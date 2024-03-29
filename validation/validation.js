const joi = require('joi')

function userValidation(body) {
    const userValidationSignUp = joi.object({
        firstName : joi.string().min(2).max(30).trim().required(),
        lastName : joi.string().min(2).max(30).trim().required(),
        userName : joi.string().min(2).max(30).trim().required(),
        isAdmin : joi.boolean().required(),
        password : joi.string().min(4).max(4).trim().required()
    })

    const userValidationLogin = joi.object({
        userName : joi.string().min(2).max(30).trim().required(),
        password : joi.string().min(4).max(4).trim().required()
    })

    return {
        userValidationSignUp : userValidationSignUp.validate(body),
        userValidationLogin : userValidationLogin.validate(body)
    }
}

function eventValidation(body) {
    const eventValidationAdded = joi.object({
        id : joi.string().required(),
        date : joi.date().required(), 
        time : joi.string(), 
        team : joi.string(),
        users: joi.array().items(joi.string()),
        title: joi.string(),
        description: joi.string(),
        comments: joi.array().items(joi.string())
    })
    return {
        eventValidationAdded: eventValidationAdded.validate(body)
    }
}

function alertValidation(body) {
    const eventValidationAdded = joi.object({
        id : joi.string().required(),
        type : joi.string().required(), 
        title : joi.string(), 
        body : joi.string(),
        endDate: joi.array().items(joi.string())
    })
}

function commentValidation(body) {
    const eventValidationAdded = joi.object({
        id : joi.string().required(),
        userId : joi.string().required(), 
        text : joi.string().required(), 
        date : joi.date()
    })
}



module.exports = {
    userValidation,
    eventValidation,
    alertValidation
}