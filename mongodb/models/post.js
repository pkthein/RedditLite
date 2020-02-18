var mongoose = require('mongoose');
var postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    num_comments: {
        type: Number,
        default: 0,
        required: true
    },
    _createdAt: {
        type: Date,
        default: Date.now(),
        required: true
    }
});

module.exports = mongoose.model('post', postSchema);