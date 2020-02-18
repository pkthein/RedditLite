const Models = require('../models');

// const commentService = require('./services/commentService');

const AUTHOR_EXCLUDES = '-password -__v -_id' // exclude these fields

/**
 *  Create a new Post
 *  @param postObj post obect to be saved
 *  @returns Promise  of array of posts.
 */
module.exports.createPost = (postObj) => {
    return new Promise((resolve, reject) => {
        Models.post.create(postObj, (error, post) => {
            if (error) {
                reject(error);
            } else {
                post.populate('author', AUTHOR_EXCLUDES)
                .execPopulate()
                .then((populatedPost) => resolve(populatedPost));
            }
        });
    });
};

/**
 * findall post that has the same properties with postObj
 * @param postObj object that contains equivalent properties. 
 *                Check out mongoose 'find' query for more details
 * @returns promise of array of Posts that was returned by the query
 */
module.exports.findAllPost = (postObj) => {
    return new Promise((resolve, reject) => {
        Models.post.find(postObj).populate('author', AUTHOR_EXCLUDES).exec((error, posts) => {
            if (error)
                reject(error);
            else
                resolve(posts)
        });
    });
}

/**
 * Get posts in a sorted order
 * default is get post by most recent.
 * @param property property to be sorted with
 * @param order in order to be sorted. 1 for ascending and -1 for descending
 * @param limit the limit of documents to be fetched.
 */
module.exports.getSorted = (poperty='_id', order=1, limit) => {
    return new Promise((resolve, reject) => {
        const sortCondition = {}
        sortCondition[poperty] = order;
        if (limit) {
            Models.post.find({}).sort(sortCondition).limit(limit).populate('author', AUTHOR_EXCLUDES).exec((error, posts) => {
                if (error)
                    reject(error);
                else
                    resolve(posts)
            });
        } else {
            Models.post.find({}).sort(sortCondition).populate('author', AUTHOR_EXCLUDES).exec((error, posts) => {
                if (error)
                    reject(error);
                else
                    resolve(posts)
            });
        }
       
    });
}


/**
 * Increment comments count
 * @param postId id of the post whose num_comments to be incremented
 * @param incrementBy value to increment comment with.
 */
module.exports.incrementNumComments = (postId, incementBy = 1) => {
    return new Promise((resolve, reject) => {
        Models.post.findById(postId)
        .populate('author', AUTHOR_EXCLUDES)
        .exec((error, post) => {
            if (error) 
                reject(error);
            else
                post = Object.assign(post, {num_comments: post.num_comments + incementBy});
                post.save((error, newObj) => {
                    if (error) 
                        reject(error);
                    else
                        resolve(newObj);
                });
        });
    });
}




// // end point to get post by id - wasnt clear on how to get it so just made another endpoint for it
// module.exports.findPostById = (postId) => {
//     return new Promise((resolve, reject) => {
//         Models.post.findById(postId).populate('author', AUTHOR_EXCLUDES).exec((error, post) => {
//             if (error)
//                 reject(error);
//             else
//             {
//                 post.comments = await commentService.getComments(req.param.id);
//                 resolve(post);
//             }
//         });
//     });
// }

/**
 * findOne post that has the same properties with postObj
 * @param postObj object that contains equivalent properties.
 *                the only difference between this and findAll is that this only
 *                returns 1 object instead of array
 *                Check out mongoose 'find' query for more details
 * @returns promise of array of Posts that was returned by the query
 */
module.exports.findOnePost = (postObj) => {
    return new Promise((resolve, reject) => {
        Models.post.findOne(postObj)
        .populate('author', AUTHOR_EXCLUDES)
        .exec((error, post) => {
            if (error) 
                reject(error);
            else
                resolve(post)
        });
    });
}

/**
 * simple query to get user with a specified id.
 * @param postId id of the post to find
 * @returns post with the specified id.
 */
module.exports.getPostById = (postId) => {
    return new Promise((resolve, reject) => {
        Models.post.findOne({ _id: postId })
        .populate('author', AUTHOR_EXCLUDES)
        .exec((error, post) => {
            if (error) 
                reject(error);
            else 
                resolve(post);
        })
    });
}

/**
 * update a post. 
 * Notes: passed in post must contain an _id
 *        only the passed in properties will be updated.
 * @param postObj that contains prperties to be updated.
 * @returns updated post.
 */
module.exports.updatePost = (postObj) => {
    return new Promise((resolve, reject) => {
        Models.post
            .findById(postObj._id)
            .populate('author', AUTHOR_EXCLUDES)
            .exec((error, post) => {
                if (error) {
                    reject(error);
                } else if (!post) {
                    reject(`${JSON.stringify(postObj)} not it Database!`);
                }else {
                    post = Object.assign(post, postObj);
                    post.save((error, newObj) => {
                        if (error) 
                            reject(error);
                        else
                            resolve(newObj);
                    });
                }
            });
    })
}