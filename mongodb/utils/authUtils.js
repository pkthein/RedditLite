const uuid = require('node-uuid');

module.exports
    .generateRandomSessionId = () => {
        return uuid.v4();
    }

module.exports
    .isNewSessionRequired = (httpMethod, route, newSessionsRoutes) => {
        return newSessionsRoutes[route]
            && newSessionsRoutes[route] instanceof Array
            && newSessionsRoutes[route].find((method) => method == httpMethod);
    }

module.exports
    .isAuthRequired = (httpMethod, route, authRoutes) => {
        return authRoutes[route]
            && authRoutes[route] instanceof Array
            && authRoutes[route].find((method) => method == httpMethod);
    };

module.exports
    .getRedisSessionData = (redisClient, sessionId) => {
        return new Promise((resolve, reject) => {
            redisClient.get(sessionId, (err, data) => {
                if (err) {
                    reject(data);
                } else {
                    resolve(data);
                }
            })
        })
    };

module.exports
    .deleteSessionData = (redisClient, sessionId) => {
        return new Promise((resolve, reject) => {
            redisClient.del(sessionId, function (err, response) {
                if (err) {
                    reject(err);
                } else {
                    resolve(response);
                }
            });
        })
    };