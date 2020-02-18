const Models = require('../models');


module.exports.createUser = (userObj) => {
    return new Promise((resolve, reject) => {
            // create a user if it has unique username and email
            Models.user.find({ username: userObj['username'] }, { email: userObj['email'] }, function (error, result) {
            if (error) {
                reject(error)
            } else {
                if (!result || result.length == 0) {
                    Models.user.create(userObj, (error, user) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve({ _id: user._id, username: user.username, email: user.email, _createdAt: user._createdAt });
                        }
                    });
                  
                } else {
                    resolve(null);
                }
            }
        });        
    });
};

module.exports.getUser = (userName) => {
    return new Promise((resolve, reject) => {
        let user = Models.user;
        user.findOne({ username: userName }, function (err, user) { 
            if(err) {
                reject(err);
            } else {
                resolve({ _id: user._id, username: user.username, email: user.email, _createdAt: user._createdAt });
            }
        });
    });
};

module.exports.verifyUserLogin = ({username, email, password}) => {
    let query = {};
    if (email) {
        query = {email}
    } else {
        query = {username}
    }
    return new Promise((resolve, reject) => {
        Models.user.findOne(query, (err, user) => {
            if (err) {
                reject(err);
            }else if (user && user.password == password) {
                resolve({ _id: user._id, username: user.username, email: user.email, _createdAt: user._createdAt });
            } else {
                resolve(null);
            }
        });   
    });
}

module.exports.getUserById = (id) => {
    return new Promise((resolve, reject) => {
        Models.user.findOne({ _id: id }, (error, user) => {
            if (error) reject(error);

            resolve({ _id: user._id, username: user.username, email: user.email, _createdAt: user._createdAt });
        })
    });
}