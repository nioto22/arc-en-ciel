const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../model/model')
const {Alert} = require('../model/model')
const {Event} = require('../model/model')
const {Comment} = require('../model/model')

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

    // ** Validation of data
    const { error } = userValidation(req.body).userValidationLogin
    if (error) return res.status(401).json(error.details[0].message)


    // ** Find user with userName in db
    User.findOne({ userName: userName })
        .then(user => {
            if (!user) return res.status(404).json({ msg: "User not fund" })
            console.log(user.userName)

            // ** Check password
            bcrypt.compare(password, user.password)
                .then(match => {
                    if (!match) return res.status(500).json({ msg: "Invalid password" })

                    // ** send web token
                    res.status(200).json({
                        username: user.userName,
                        id: user._id,
                        token: jwt.sign({ id: user._id }, "SECRET_AEC_KEY", { expiresIn: "365d" })
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
exports.startup = (req, res) => {

    // get current user from user id in body
    const username = req.body
    const mUser = null
    const mAlerts = []
    const mEvents = []
    const mUserEvents = []
    User.findOne({ userName: username })
        .then(user => {
            console.log("User find")
            mUser = user
        })
        .catch(error => res.status(500).json(error))

    // get all alerts
    Alert.find()
    .then(alerts => {
        alerts.forEach(alert => {
            console.log(alert.title)  
        });
        mAlerts = alerts
    })
    .catch(error => {
        console.log("Error to get alerts ${error}")
    })
    // get all events 
    Event.find()
    .then(events => {
        events.forEach(event => {
            console.log(event.title)  
        });
        mEvents = events
    })
    .catch(error => {
        console.log("Error to get events ${error}")
    })

    // get all events for user
    mUserEvents = mEvents.filter(event => event.users.includes(username))

    // find last saturday event for user and add assuidity alert if necessary

    // catch no error

    // send alerts, events, userEvents
    return res.status(200).json({
        user: mUser,
        alerts: mAlerts,
        events: mEvents,
        user_events: mUserEvents
    })
}

