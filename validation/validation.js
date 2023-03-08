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
}



module.exports = {
    userValidation,
    eventValidation
}