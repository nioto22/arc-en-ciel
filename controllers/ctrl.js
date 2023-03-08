const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const models = require('../model/model')
const User = models.User
const Alert = models.Alert
const Event = models.Event
const Comment = models.Comment

const userValidation = require('../validation/validation')

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