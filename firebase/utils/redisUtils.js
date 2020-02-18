module.exports
    .getRedisData = (redisClient, hashId) => {
        return new Promise((resolve, reject) => {
            redisClient.get(hashId, (err, data) => {
                if (err) {
                    reject(data);
                } else {
                    resolve(data);
                }
            })
        })
    };

module.exports
    .deleteRedisData = (redisClient, hashId) => {
        return new Promise((resolve, reject) => {
            redisClient.del(hashId, function (err, response) {
                if (err) {
                    reject(err);
                } else {
                    resolve(response);
                }
            });
        })
    };

module.exports
    .setRedisData = (redisClient, hashId, data) => {
        return new Promise((resolve, reject) => {
            redisClient.set(hashId, data, function (err, response) {
                if (err) {
                    reject(err);
                } else {
                    resolve(response);
                }
            });
        })
    };
