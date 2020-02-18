var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    _createdAt: {
        type: Date,
        default: Date.now(),
        required: true
    }
});

module.exports = mongoose.model('user', userSchema);
