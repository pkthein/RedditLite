var fs  = require('fs');
var mongoose = require('mongoose');

const dbURI = 'mongodb://127.0.0.1:27017/redditlite';
var db = mongoose.connection;

// handle DB events
db.on('connecting', function () {
    console.log('connecting to MongoDB...');
});

db.on('error', function (error) {
    console.error('Error in MongoDb connection: ' + error);
    mongoose.disconnect();
});
db.on('connected', function () {
    console.log('MongoDB connected!');
});
db.once('open', function () {
    console.log('MongoDB connection opened!');
});
db.on('reconnected', function () {
    console.log('MongoDB reconnected!');
});
db.on('disconnected', function () {
    console.log('MongoDB disconnected!');
    mongoose.connect(dbURI, { server: { auto_reconnect: true } });
});

mongoose.connect(dbURI, { server: { auto_reconnect: true }, useUnifiedTopology: true, useNewUrlParser: true });
var models = {};

var models_path = __dirname
// load all models
fs.readdirSync(models_path).forEach(function (file) {
    if(file !== 'index.js'){
        const modelName = file.substr(0, file.indexOf('.'))
        models[modelName] = require(models_path + '/' + file)
        console.log(file);
    }
});

module.exports = models;