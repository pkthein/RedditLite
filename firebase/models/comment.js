var mongoose = require('mongoose');
var commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comment',
        required: false
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post',
        required: true
    },
    _createdAt: {
        type: Date,
        default: Date.now(),
        required: true
    }
});

module.exports = mongoose.model('comment', commentSchema);