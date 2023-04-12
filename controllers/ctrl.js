const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const models = require('../model/model')
const User = models.User
const Alert = models.Alert
const Event = models.Event
const Comment = models.Comment
const ChangeControl = models.ChangeControl

const validations = require('../validation/validation')
const userValidation = validations.userValidation
const eventValidation = validations.eventValidation
const alertValidation = validations.alertValidation

const middlewares = require('../middlewares/updateDb')
const updateChangeControl = middlewares.updateChangeControl
const updateType = middlewares.updateType


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
        return res.status(500).json({ error: "An error occurred." })
    }
}

/**
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
exports.updateEvent = async (req, res) => {
    // ** Get the data
    const { body } = req
    // ** Validate the data using joi
    //const { error } = eventValidation(body).eventValidation
    //if (error) return res.status(401).json(error.details[0].message)

    // check if event id already exist
    // update event
    const existingEvent = await Event.findOne({ id: body.id })

    if (existingEvent) { // si l'objet existe déjà, le mettre à jour
        existingEvent.set(body);
        await existingEvent
            .save()
            .then((event) => {
                // save modification timestamp
                middlewares.updateChangeControl(updateType.Event)

                res.status(201).json({ msg: "Event updated" })
            })
            .catch((error) => {
                console.log(`Error 500 ${error}`)
                res.status(500).json(error)
            });
    } else { // sinon, créer un nouvel objet avec les données fournies
        const newEvent = new Event(body);
        await newEvent
            .save()
            .then((event) => {
                // save modification timestamp
                middlewares.updateChangeControl(updateType.Alert)

                res.status(201).json({ msg: "Event created" })
            })
            .catch ((error) => {
                console.log(`Error 500 ${error}`)
                res.status(500).json(error)
            });
    }
}

/**
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
exports.updateAlert = async (req, res) => {
    // ** Get the data
    const { body } = req
    // ** Validate the data using joi
    const { error } = alertValidation(body).alertValidation
    if (error) return res.status(401).json(error.details[0].message)

    // check if alert id already exist
    // update event

    //TODO CHECK {new: true}
    const existingAlert = await Alert.findById({ id: body.id })

    if (existingAlert) { // si l'objet existe déjà, le mettre à jour
        existingAlert.set(body);
        await existingAlert
            .save()
            .then((alert) => {
                // save modification timestamp
                middlewares.updateChangeControl(updateType.Alert)

                res.status(201).json({ msg: "Alert updated" })
            })
            .catch((error) => res.status(500).json(error));
    } else { // sinon, créer un nouvel objet avec les données fournies
        const newAlert = new Alert(body);
        await newAlert
            .save()
            .then((alert) => {
                // save modification timestamp
                middlewares.updateChangeControl(updateType.Alert)

                res.status(201).json({ msg: "Alert created" })
            })
            .catch ((error) =>
             res.status(500).json(error));
    }
}

/**
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
exports.updateComment = async (req, res) => {
    // ** Get the data
    const { body } = req
    // ** Validate the data using joi
    //const { error } = commentValidation(body).alertValidation
    //if (error) return res.status(401).json(error.details[0].message)

    // check if alert id already exist
    // update event

    //TODO CHECK {new: true}
    const existingComment = await Comment.findById({ id: body.id })

    if (existingComment) { // si l'objet existe déjà, le mettre à jour
        existingComment.set(body);
        await existingComment
            .save()
            .then((comment) => {
                // save modification timestamp
                middlewares.updateChangeControl(updateType.Comment)

                res.status(201).json({ msg: "Comment updated" })
            })
            .catch((error) => res.status(500).json(error));
    } else { // sinon, créer un nouvel objet avec les données fournies
        const newComment = new Comment(body);
        await newComment
            .save()
            .then((comment) => {
                // save modification timestamp
                middlewares.updateChangeControl(updateType.Comment)

                res.status(201).json({ msg: "Comment created" })
            })
            .catch ((error) =>
             res.status(500).json(error));
    }
}

/**
 * 
 * @param {express.Request} req
 * @param {express.Response} res 
 */
exports.changeControl = async (req, res) => {
    try {
        const lastUpdate = req.body

        const change = await ChangeControl.findOne()
        if (!change) {
            return res.status(404).json({ error: "Change control not found." })
        }
        const cloudLastUpdate = change.lastUpdate
        return res.status(200).json({
            hasUpdate: lastUpdate < cloudLastUpdate,
            changeControl: change
        })
    } catch (error) {
        return res.status(500).json({ error: "An error occurred." })
    }


}


const ImageModel = require('../models/images');
const ImageService = require('../service/images')

// https://medium.com/jsblend/image-upload-using-nodejs-16b1e804ec92

// User id in input
/**
 * @param {express.Request} req
 * @param {express.Response} res 
 */
exports.uploadImage = async (req, res ) => {
    if(req.body.images){
        const imageService = new ImageService()
        req.body.images = imageService.singleImageUpload('image', req.body.images)
    }
    console.log(req.body.images)
    //assign the value
    const image = new ImageModel()
    image.images = req.body.images
    //save the user
    await image.save();

    res.status(200).send({
        status: 200,
        message: "Single Image Uploaded!"
    })
}




