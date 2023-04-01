const mongoose = require('mongoose')
const muv = require('mongoose-unique-validator')

const userSchema = mongoose.Schema({
    firstName: { type: String, require: true },
    lastName: { type: String, require: true },
    userName: { type: String, require: true, unique: true },
    isAdmin: { type: Boolean, require: true },
    password: { type: String, require: true },
    date: { type: Date, default: Date.now },
    haveKey: { type: Boolean, require: false, default: false }
});

const imageSchema = new mongoose.Schema({
    userName: { type: String, require: true, unique: true },
    images: {type: String }
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

const changeControlSchema = mongoose.Schema({
    date: { type: Date, require: true},
    userCount: { type: Number, require: false},
    eventCount: { type: Number, require: false},
    alertCount: { type: Number, require: false},
    commentCount: { type: Number, require: false},
})


mongoose.plugin(muv) // to be sure that userName is unique

const User = mongoose.model('user', userSchema)
const Images = mongoose.model('images', imageSchema)
const Alert = mongoose.model('alert', alertSchema)
const Event = mongoose.model('event', eventSchema)
const Comment = mongoose.model('comment', commentSchema)
const ChangeControl = mongoose.model('changeControl', changeControlSchema)


module.exports = {
    User,
    Images,
    Alert,
    Event,
    Comment,
    ChangeControl
  }