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
        method: 'GET',
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




/** 
 * Query posts that are sorted in a certain way.
 * No authentication needed to use this endpoint
 * 
 * to get sorted by num_comments with a limit of 10 post:
 * /api/post/sorted?by=num_comments&order=desc&limit=1
 * 
 * 
 * can have an optional query parameter 'limit' which is a number.
 */
app.get('/api/post/sorted', async (req, res, next)=> {
    try {
        if (req.query && req.query.by && req.query.order && req.query.limit) {
            const by = req.query.by,                    // field to sort by
               order = req.query.order=='desc'? -1 : 1, // asc or desc
               limit = parseInt(req.query.limit);       // output limit 

           res.data = await postService.getSorted(by, order, limit);
        } else {
            res.data =  await postService.getSorted();
        }

        handle200Response(req, res);

    } catch (error) {
        return res.status(400).send({
            ok: false,
            error: {
                reason: "Bad Request", code: 400
            }
        });
    }
});



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
app.get('/api/post/:id/comments', authentication, async (req, res, next) =>{
    try {
        if (!req.params.id) {
            return res.status(400).send({
                ok: false,
                error: {
                    reason: "Post id required!", code: 400
                }
            });
        }

        const post = await commentService.getComments(req.params.id);
        res.data = {post};
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

/* create new comment */
app.post('/api/post/new/comment', authentication, async (req, res) =>{
    try{
        if (!req.body.comment || ! req.body.comment.post) {
            return res.status(400).send({
                ok: false,
                error: {
                    reason: "Expected a new comment object with correct fields", code: 400
                }
            });
        }

        if (!req.body.comment.author) {
            req.body.comment.author = req.user._id; 
        }
         
        const newComment = await commentService.createComment(req.body.comment);
        
        const postId = typeof req.body.comment.post === 'string'? req.body.comment.post : req.body.comment.post._id;
        await postService.incrementNumComments(postId)

        res.data = {'comment': newComment};
        
        handle200Response(req, res);
    } catch(err){
        console.log(err);
        return res.status(400).send({
            ok: false,
            err: {
                reason: "Bad Request", code: 400, error: err
            }
        });
    }
});

/* You should provide parent id in the body */
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

app.post('/api/post/new', authentication, async (req, res) => {
    try{
        if (!req.body.post) {
            return res.status(400).send({
                ok: false,
                error: {
                    reason: "Expected a new post object", code: 400
                }
            });
        }
        req.body.post.author = req.user._id; 
        const newPost = await postService.createPost(req.body.post);
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
        "_id": "someID"
		"title": "Post_Name",
		"text": "Post_Body"
	    }
    } 
*/
app.post('/api/post/edit', authentication, async (req, res) => {
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

/*
Finds all posts with the properties included, returns an array of post objects
Intended JSON to include in request: 
{
	"post": {
		"title": Post_Name,
        "text": Post_Body,
        "author": Author_ID,
        "_createdAt": Date
	    }
} 
*/

app.post('/api/post/findposts', async (req, res) => {
    try{
        if (!req.body.post){
            return res.status(400).send({
                ok: false,
                error: {
                    reason: "No postObj provided", code: 400
                }
            });
        }

        const postResults = await postService.findAllPost(req.body.post);
        console.log(postResults);
        res.data = {'posts': postResults};

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

/*
Finds one post with the properties included, returns a post object
Intended JSON to include in request: 
{
	"post": {
		"title": Post_Name,
        "text": Post_Body,
        "author": Author_ID,
        "_createdAt": Date
	    }
} 
*/

app.post('/api/post/findpost', async (req, res) => {
    try{
        if (!req.body.post) {
            return res.status(400).send({
                ok: false,
                error: {
                    reason: "No postObj provided", code: 400
                }
            });
        }

        const postResult = await postService.findOnePost(req.body.post);
        console.log(postResult);
        res.data = {'post': postResult};

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

/*
Finds one post with the postID included, returns a post object
Include postID as parameter in get request
*/

app.get('/api/post/getpost/:id', async (req, res) => {
    try{
        if (!req.params.id){
            return res.status(400).send({
                ok: false,
                error: {
                    reason: "No postID provided", code: 400
                }
            });
        }
        console.log(req.params.id)
        let postResult = await postService.getPostById(req.params.id);
        res.data = {'post': postResult};

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



/** HELPER FUNCTION */
const handle200Response = (req, res) => {
    res.status(res.statusCode || 200)
        .send({ ok: true, response: res.data });
}

app.listen(port, () => console.log(`PostServer listening on port ${port}!`))