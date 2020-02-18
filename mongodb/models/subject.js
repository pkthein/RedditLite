var mongoose = require('mongoose');
var subjectSchema = new mongoose.Schema({
    // notes: {
    //     type: mongoose.Schema.Types.DocumentArray,
    //     required: true
    // },
    // author: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     required: true
    // },
    _createdAt: {
        type: Date,
        default: Date.now(),
        required: true
    }
});

module.exports = mongoose.model('subject', subjectSchema);