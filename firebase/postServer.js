const app = require('express')();
const bodyParser = require('body-parser');
const axios = require('axios');
const postService = require('./services/postService');
const commentService = require('./services/commentService');

const port = 3001;

//app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json());

/*Function to authenticate user (to be used as middleware)*/
const authentication = function(req, res, next){
    const apiUrl = req.originalUrl;
    const httpMethod = req.method;

    console.log(httpMethod, apiUrl);

    axios('http://localhost:3000/api/auth/verify', {
        method: 'POST',
        headers: {
            cookie: req.headers.cookie
        }
    }).then(result => {
        if (result.status === 200){
            //Valid user
            req.user = result.data.response.user;
            res.cookie('auth', JSON.stringify(result.data.response));
            next();
        } else{
            return res.status(403).send({
                ok: false,
                error: {
                    reason: "Forbidden!", code: 403
                }
            });
        }
    }).catch(err => {
        console.log(err);
        return res.status(403).send({
            ok: false,
            error: {
                reason: "Forbidden!", code: 403
            }
        });
    })
};

/* Used to make new posts
    Intended JSON to include in request: 
    {
	"post": {
		"title": "Post_Name",
		"text": "Post_Body"
	    }
    }  
*/

// comments on post - get post id 
/* !!! Get post by id */
app.get('/api/post/:id', async (req, res, next) =>{
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
        const post = await postService.findPostById(req.param.id);
        res.data = { post:  post};
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

/* !!! Created a new comment, including new replies. You should provide parent id in the body */
app.post('/api/post/:id/comment', async (req, res) =>{
    try{
        if (!req.body.comment) {
            return res.status(400).send({
                ok: false,
                error: {
                    reason: "Expected a new comment object", code: 400
                }
            });
        }
        req.body.post.author = req.body.user._id; 
        console.log(req.body.comment, 'commentOBJ ------------------\n\n') // ADD THIS
        const newComment = await commentService.createComment(req.body.comment);
        console.log(newComment);
        res.data = {'comment': newComment};
        return res.status(res.statusCode || 200)
            .send({
                ok: true,
                response: res.data
            });
    } catch(err){
        console.log(err);
        return res.status(400).send({
            ok: false,
            err: {
                reason: "Bad Request", code: 400
            }
        });
    }
});

/* !!! Created a new comment, including new replies. You should provide parent id in the body */
app.delete('/api/post/comment/:id', async (req, res) =>{
    try{
        if (!req.params.id) {
            return res.status(400).send({
                ok: false,
                error: {
                    reason: "No comment id", code: 400
                }
            });
        }
        const result = await commentService.deleteComment(req.params.id);
        console.log('Comment deleted');
        return res.status(res.statusCode || 200)
            .send({
                ok: result
            });
    } catch(err){
        console.log(err);
        return res.status(400).send({
            ok: false,
            err: {
                reason: "Bad Request", code: 400
            }
        });
    }
});

app.post('/api/posts/new', /*authentication,*/ async (req, res) => {
    try{
        if (!req.body.post) {
            return res.status(400).send({
                ok: false,
                error: {
                    reason: "Expected a new post object", code: 400
                }
            });
        }
        req.body.post.author = req.body.user._id; 
        console.log(req.body.post, 'postOBJ ------------------\n\n') // ADD THIS
        const newPost = await postService.createPost(req.body.post);
        console.log(newPost);
        res.data = {'post': newPost};
        return res.status(res.statusCode || 200)
            .send({
                ok: true,
                response: res.data
            });
    } catch(err){
        console.log(err);
        return res.status(400).send({
            ok: false,
            err: {
                reason: "Bad Request", code: 400
            }
        });
    }
});

/* Used to edit posts - Only passed in properties sent in body will be updated
Intended JSON to include in request: 
    {
	"post": {
		"title": "Post_Name",
		"text": "Post_Body"
	    }
    } 
*/
app.post('/api/posts/edit', authentication, async (req, res) => {
    try{
        if (!req.body.post) {
            return res.status(400).send({
                ok: false,
                error: {
                    reason: "Expected a new post object", code: 400
                }
            });
        }
        
        const updatedPost = await postService.updatePost(req.body.post);
        console.log(updatedPost);
        res.data = {'post': updatedPost};

        return res.status(res.statusCode || 200)
            .send({
                ok: true,
                response: res.data
            });
    } catch(err){
        console.log(err);
        return res.status(400).send({
            ok: false,
            err: {
                reason: "Bad Request", code: 400
            }
        });
    }
});

// Block other endpoints
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


app.listen(port, () => console.log(`PostServer listening on port ${port}!`))