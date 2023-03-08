const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const models = require('../model/model')
const User = models.User
const Alert = models.Alert
const Event = models.Event
const Comment = models.Comment

const validations = require('../validation/validation')
const userValidation = validations.userValidation
const eventValidation = validations.eventValidation

/**
 * @api {post} /signup Create a new user account
 * @apiName Signup
 * @apiGroup Authentication
 *
 * @apiParam {String} firstName First name of the user
 * @apiParam {String} lastName Last name of the user
 * @apiParam {String} userName Username of the user (must be unique)
 * @apiParam {String} password Password of the user
 * @apiParam {Boolean} isAdmin Boolean value indicating whether the user is an admin (default is false)
 * @apiParam {Date} date Date of birth of the user
 *
 * @apiSuccess {String} msg Success message indicating that the user has been created
 *
 * @apiError {String} error Error message indicating the cause of the error
 *
 * @apiErrorExample Error Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "Server Error"
 *     }
 *
 * @apiErrorExample Validation Error Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "Validation error message"
 *     }
 */
/**
 * @param {express.Request} req
 * @param {express.Response} res 
 */
exports.inscription = (req, res) => {

    // ** Get the data
    const { body } = req
    // ** Validate the data => by using joi
    const { error } = userValidation(body).userValidationSignUp
    if (error) return res.status(401).json(error.details[0].message)

    // ** hash of the password with bcrypt
    bcrypt.hash(body.password, 6)
        .then(hash => {
            if (!hash) return res.status(500).json({ msg: "Server Error" })
            delete body.password
            new User({
                firstName: body.firstName,
                lastName: body.lastName,
                userName: body.userName,
                isAdmin: body.isAdmin,
                date: body.date,
                password: hash
            })
                .save()
                .then((user) => {
                    console.log(user)
                    res.status(201).json({ msg: "User Created !" })
                })
                .catch((error) => res.status(500).json(error))
        })
        .catch((error) => res.status(500).json(error))
}


/**
 * @param {express.Request} req
 * @param {express.Response} res 
 */
exports.connexion = (req, res) => {
    const { userName, password } = req.body

    if (!userName || !password) {
        return res.status(400).json({ msg: "Missing userName or password field" })
    }

    // ** Validation of data
    const { error } = userValidation(req.body).userValidationLogin
    if (error) return res.status(401).json(error.details[0].message)


    // ** Find user with userName in db
    User.findOne({ userName: userName })
        .then(user => {
            if (!user) return res.status(404).json({ msg: "User not fund" })
            console.log(user)


            // ** Check password
            bcrypt.compare(password, user.password)
                .then(match => {
                    if (!match) return res.status(401).json({ msg: "Invalid username or password" })

                    // ** send web token
                    res.status(200).json({
                        userName: user.userName,
                        id: user._id,
                        token: jwt.sign({ id: user._id }, "SECRET_AEC_KEY", {})
                    })

                })
                .catch(error => res.status(500).json(error))
        })
        .catch(error => res.status(500).json(error))
}

/**
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
exports.startup = async (req, res) => {
    const currentDate = new Date();
    const twoMonthsFromNow = new Date(currentDate);
    twoMonthsFromNow.setMonth(currentDate.getMonth() + 2);

    try {
        // get current user from user id in body
        const username = req.body.userName

        // validate input
        if (!username) {
            return res.status(400).json({ error: "Username is required." })
        }

        // retrieve user from database
        const mUser = await User.findOne({ userName: username })
        if (!mUser) {
            return res.status(404).json({ error: "User not found." })
        }

        // retrieve alerts from database
        const mAlerts = await Alert.find({ endDate: { $gt: currentDate } }) //.limit(30)

        // retrieve events from database
        const mEvents = await Event.find({ date: { $gt: currentDate, $lt: twoMonthsFromNow } }) //.limit(30)

        // filter events for user
        const mUserEvents = mEvents.filter(event => event.users.includes(username))

        // return response
        return res.status(200).json({
            user: mUser,
            alerts: mAlerts,
            events: mEvents,
            user_events: mUserEvents
        })
    } catch (error) {
        // handle errors
        console.error(error)
        return res.status(500).json({ error: "An error occurred." })
    }
}

exports.addEvent = (req, res) => {
    // ** Get the data
    const { body } = req
    // ** Validate the data using joi
    const { error } = eventValidation(body).eventValidation
    if (error) return res.status(401).json(error.details[0].message)

    //TODO check if event id already exist
    // update event

    // else create event
    new Event({
        id: body.id,
        date: body.date,
        time: body.time,
        team: body.team,
        users: body.users,
        title: body.title,
        description: body.description,
        comments: body.description
    })
    .save()
    .then((event) => {
        // TODO
        res.status(201).json({ msg: "Event created"})
    })
    .catch((error) => res.status(500).json(error))
}

