const uuid = require('node-uuid');

/**
 * Redis Session interface
 * Use for saving redis data.
 */
module.exports.RedisSession = class RedisSession {
    constructor(sessionModelId, sessionId = uuid.v4()) {
        this.sessionId = sessionId;
        this.sessionModelId = sessionModelId;
        this.sessionData = null;
    }

    setData(data) {
        this.sessionData = data;
    }

    save(redisClient, expire = 2 * 60 * 60) {
        redisClient.set(this.sessionId, this.sessionModelId);
        redisClient.expire(this.sessionId, expire);
    }

    getId() {
        return this.sessionId;
    }

    getData() {
        return this.sessionData;
    }

    destroy(redisClient) {
        redisClient.del(this.sessionId, function (err, response) {
            if (response == 1) {
                console.log("REDIS token Deleted Successfully!")
            } else {
                console.log("REDIS token Cannot delete", response)
            }
        });
    }

}