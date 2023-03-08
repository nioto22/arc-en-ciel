const mongoose = require('mongoose')
const muv = require('mongoose-unique-validator')

const userSchema = mongoose.Schema({
    firstName: { type: String, require: true },
    lastName: { type: String, require: true },
    userName: { type: String, require: true, unique: true },
    isAdmin: { type: Boolean, require: true },
    password: { type: String, require: true },
    date: { type: Date, default: Date.now }
});


const alertSchema = mongoose.Schema({
    id: { type: String, require: true, unique: true },
    type: { type: String, require: false },
    title: { type: String, require: false },
    body: { type: String, require: false },
    endDate: { type: Date, require: true }
});


const eventSchema = mongoose.Schema({
    id: { type: String, require: true, unique: true },
    date: { type: Date, require: true },
    time: { type: String, require: false },
    team: { type: String, require: false, default: 'Général' },
    users: { type: [String], require: false },
    title: { type: String, require: false },
    description: { type: String, require: false },
    comments: { type: [String], require: false }
});


const commentSchema = mongoose.Schema({
    id: { type: String, require: true, unique: true },
    userId: { type: String, require: true },
    text: { type: String, require: true },
    date: { type: Date, default: Date.now }
});


mongoose.plugin(muv) // to be sure that userName is unique

module.exports = mongoose.model('user', userSchema)
module.exports = mongoose.model('alert', alertSchema)
module.exports = mongoose.model('event', eventSchema)
module.exports = mongoose.model('comment', commentSchema)