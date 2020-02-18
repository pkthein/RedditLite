
const redis = require('redis');
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser');
const _ = require('lodash');
const app = require('express')();
const axios = require('axios');
const noteService = require('./services/noteService');
const redisUtils = require('./utils/redisUtils');

const redisClient = redis.createClient();

const port = 5000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

/**
 * Middleware that all requests are authenticated.
 */
app.use((req, res, next) => {

    const apiUrl = req.originalUrl;
    const httpMethod = req.method;

    console.log(httpMethod, apiUrl);

    axios('http://localhost:3000/api/auth/verify', {
        method: 'POST',
        headers: {
            cookie: req.headers.cookie
        }
    }).then(result => {
        if (result.status == 200) {
            // continue if a valid User
            req.user = result.data.response.user;
            res.cookie('auth', JSON.stringify(result.data.response));
            next();
        } else {
            return res.status(403).send({
                ok: false,
                error: {
                    reason: "Forbidden", code: 403
                }
            });
        }
    }).catch(err => {
        console.log(err);
        return res.status(403).send({
                ok: false,
                error: {
                    reason: "Forbidden", code: 403
                }
            });
    })
});

app.post('/api/notes/new', async (req, res) => {
    try {
        if (!req.body.note) {
            return res.status(400).send({
                ok: false,
                error: {
                    reason: "Expected new note object", code: 400
                }
            });
        }
        req.body.note.author = req.user._id;
        const newNote = await noteService.create(req.body.note);
        res.data = {'note': newNote};
        handle200Response(req, res);
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            ok: false,
            error: {
                reason: "Bad Request", code: 400
            }
        });
    }
});

app.post('/api/notes/edit', async (req, res) => {
    try {
        if (!req.body.note || !req.body.note._id) {
            return res.status(400).send({
                ok: false,
                error: {
                    reason: "Expecting new note object", code: 400
                }
            });
        }
        const editedNote = await noteService.edit(req.body.note)
        res.data = {'note': editedNote};
        handle200Response(req, res);
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            ok: false,
            error: {
                reason: "Bad Request", code: 400
            }
        });
    }
});

app.get('/api/notes/note/:id', async (req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).send({
                ok: false,
                error: {
                    reason: "No id provided", code: 400
                }
            });
        }
        console.log(req.params.id)
        let foundNotes = await noteService.find({_id: req.params.id});
        if (!foundNotes || foundNotes.length == 0) {
            return res.status(404).send({
                ok: false,
                error: {
                    reason: "Note found", code: 404
                }
            });
        } else {
            const returnedResponse = { 'note': foundNotes[0]};
            let storedData = await redisUtils.getRedisData(redisClient, req.params.id.toString());
            let views = (storedData == null || typeof storedData != "string" || isNaN(storedData)) ? 0 : parseInt(storedData);
            views ++;
            redisClient.set(req.params.id.toString(), views.toString());
            returnedResponse['views'] = views;
            res.data = returnedResponse;
            handle200Response(req, res);
        }
        
    } catch (error) {
        console.log("ERRORED /api/notes/note/:id ", error);
        return res.status(400).send({
            ok: false,
            error: {
                reason: "Bad Request", code: 400
            }
        });
    }
});

app.get('/api/notes/all', async (req, res, next) => {
    try {
        const notes = await noteService.find({});
        res.data = { 'notes': notes };
        handle200Response(req, res);
    } catch (error) {
        console.log("ERRORED /api/notes/all", error);
        return res.status(400).send({
            ok: false,
            error: {
                reason: "Bad Request", code: 400
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


const handle200Response = (req, res) => {
    res.status(res.statusCode || 200)
        .send({ ok: true, response: res.data });
}

app.listen(port, () => console.log(`Note server listening on port ${port}!`))