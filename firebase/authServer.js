const express = require('express');
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser');
const redis = require('redis');
const { isAuthRequired, getRedisSessionData, deleteSessionData } = require('./utils/authUtils');
const userService = require('./services/userService');
const RedisSession = require('./utils/session').RedisSession
const _  = require('lodash');

const redisClient = redis.createClient();

const app = express();
const port = 3000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(cookieParser());

var authRoutes = {
  '/api/auth/verify': ['GET'],
  '/api/auth/user/logout': ['POST']
}

// custom middleware for identifying and validating
// routes that needs authentication.
app.use(async (req, res, next) => {
  const apiUrl = req.originalUrl;
  const httpMethod = req.method;

  console.log(httpMethod, apiUrl);

  if (isAuthRequired(httpMethod, apiUrl, authRoutes)) {
    try {
      let auth = JSON.parse(req.cookies.auth);
      const sessionId = auth['sessionId']
      // if session id was received, fetch that session from redis.
      if (sessionId) {
        let userId = await getRedisSessionData(redisClient, sessionId);
        // check redisData is null or empty object {}
        if (userId) { 
          const user = await userService.getUserById(userId.toString());
          req.session = new RedisSession(userId.toString(), sessionId);
          req.session.setData(user);
          req.sessionId = req.session.getId();
        } else {
          return res.status(401).send({
            ok: false,
            error: {
              reason: "Invalid sessionId",
              code: 401
            }
          });
        }
      } else {
        return res.status(401).send({
          ok: false,
          error: {
            reason: "Missing sessionId",
            code: 401
          }
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(401).send({
        ok: false,
        error: {
          reason: "Error verifying",
          code: 401
        }
      });
    }
    
  } 

  next();
});

app.get('/api/auth/verify', (req, res) => {
  res.data = { 'sessionId': req.sessionId, 'user': req.session.getData() };
  handleResponse(req, res);
})


app.post('/api/auth/user/logout', async (req, res, next) => {
  try {
    if(req.sessionId && req.session){
      req.session.destroy(redisClient);
      req.sessionId = null;
      req.session   = null;
      res.clearCookie('auth');
      handleResponse(req, res);
    } else {
      return res.status(400).send({
        ok: false,
        error: {
          reason: "Bad Request",
          code: 400
        }
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      ok: false,
      error: {
        reason: "Bad Request",
        code: 400
      }
    });
  }
});

app.post('/api/auth/user/login', async (req, res, next) => {
    try {
      if (req.sessionId && req.session) {
        req.session.destroy(redisClient);
        req.sessionId = null;
        req.session = null;
        res.clearCookie('auth');
      }

      if ((req.body.user['email'] || req.body.user['username']) && req.body.user['password']) {

        // will return user on sucessful login
        let user = await userService.verifyUserLogin({
          email: req.body.user['email'],
          username: req.body.user['username'], 
          password: req.body.user['password']
        });

        if (user) {
          // Operation SUCCESS
          // create a new session
          let newSession  = new RedisSession(user._id.toString());
          req.session     = newSession;
          req.session.setData(_.pick(user, ['_id', 'username', 'email', '_createdAt'])); 
          req.sessionId   = newSession.getId();
          res.data        = {'user' : req.session.getData() };
          handleResponse(req, res);
        } else {
          return res.status(401).send({
            ok: false,
            error: {
              reason: "username or email or password invalid",
              code: 401
            }
          });
        }
      } else {
        return res.status(401).send({
          ok: false,
          error: {
            reason: "username or email and password required ",
            code: 401
          }
        });
      }
    } catch (error) {
      console.log(error)
        return res.status(401).send({
          ok: false,
          error: {
            reason: error,
            code: 401
          }
        });
    }
});

app.post('/api/auth/user/signup', async (req, res, next) => {
  try {
    if (req.body.user['email'] && req.body.user['password'] && req.body.user['username']) {
      let user = await userService.createUser({ 
        email: req.body.user['email'], 
        password: req.body.user['password'],
        username: req.body.user['username']
      });
      if (user) {
        // Operation SUCESS
        req.session   = new RedisSession(user._id.toString());
        req.session.setData(_.pick(user, ['_id', 'username', 'email', '_createdAt'])); 
        req.sessionId = req.session.getId();
        res.data      = { 'user': req.session.getData() }
        handleResponse(req, res);
      } else {
        return res.status(401).send({
          ok: false,
          error: {
            reason: "username or email already taken ",
            code: 401
          }
        });
      }
    } else {
      return res.status(401).send({
        ok: false,
        error: {
          reason: "username and email and password required",
          code: 401
        }
      });
    }
  } catch (error) {
    console.log(error)
    return res.status(401).send({
      ok: false,
      error: {
        reason: "Error occured",
        code: 401
      }
    });
  }
});

// block the rest of the endpoints
app.all('*', (req, res, next) => {
  if (!req.session || !req.sessionId) {
    return res.status(404).send({
      ok: false,
      error: {
        reason: "Not Found",
        code: 404
      }
    });
  }
});


/**
 * internal use
 * call to send a response when endpoint and param data are valid
 *  
 */
const handleResponse = (req, res) => {
  // session is set to new session 
  if (req.session && req.sessionId) {
    try {
     
      req.session.save(redisClient);
      res.cookie('auth', JSON.stringify({ 'sessionId': req.sessionId, 'user': req.session.getData() }), {
        maxAge: 60 * 60 * 60
      })
      
    } catch (e) {
      console.log('Error:', e);
      return res.status(500).send({
        ok: false,
        error: {
          reason: "Server Error", code: 500
        }
      });
    }
  }
  
  res.status(res.statusCode || 200)
    .send({ ok: true, response: res.data });
}



app.listen(port, () => console.log(`Example app listening on port ${port}!`))