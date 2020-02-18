const Models = require('../models');
const arrayUtils = require('../utils/array');
const _ = require('lodash');

const AUTHOR_EXCLUDES = '-password -__v -_id' // exclude these fields

/**
 * delete comment
 * @param commentId is the id of comment to be deleted
 * @returns true 
 */
module.exports.deleteComment = (commentId) => {
    return new Promise((resolve, reject) => {
        Models.comment.findById(commentId, (error, comment) => {
            if (error) {
                reject(error);
            } else {
                Models.comment.findByIdAndRemove(id, function(err){
                    if (err){
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });
            }
        });
    });
}


/**
 * create a new comment
 * @param commentObj is the object to be created
 * @returns created comment
 */
module.exports.createComment = (commentObj) => {
    return new Promise((resolve, reject) => {
        Models.comment.create(commentObj, (error, comment) => {
            if (error) {
                reject(error);
            } else {
                comment.populate('author', AUTHOR_EXCLUDES)
                    .execPopulate()
                    .then(populatedComment => resolve(populatedComment));
            }
        });
    });
}

/**
 * get comments by postId
 * @param postId id of the post comments belongs to.
 * @returns array of nested comments.
 */
module.exports.getComments = (postId) => {
    return new Promise((resolve, reject) => {
        Models.comment.find({ post: postId })
        .populate('author', AUTHOR_EXCLUDES)
        .lean()
        .exec((err, comments) => {
            if (err) {
                reject(err);
            } else {
                // comments that belongs directly to a post
                var rootComments = [];
                // mapping of child comments by parent id.
                let childCommentsMap = {};

                // fill root coments and child comments with according data.
                for (let comment of comments) {
                    if(comment.parent) {
                        // keep child comments sorted by creation date.
                        childCommentsMap[comment.parent] = arrayUtils.insertionSortInsert(childCommentsMap[comment.parent], comment, 
                            (left, right) => (new Date(left._createdAt)).valueOf() <= (new Date(right._createdAt)).valueOf() );
                    } else { 
                        rootComments.push(comment);
                    }
                }

                // sort root comments by creation date.
                rootComments = _.sortBy(rootComments, (comment)=> {
                    return (new Date(comment._createdAt)).valueOf()
                });

                // fill in the child comments of the parent comments
                for (let i = 0; i < rootComments.length; i++) {
                    rootComments[i].comments= buildComments(rootComments[i], childCommentsMap);
                }
               
                // return root comments
                resolve(rootComments);                
            }
        })
    });
}


// Internal helper function. Not to be used outside of this module.
// recursively build comments
const buildComments = (comment, commentsMap) => {
    const comments = commentsMap[comment._id];
    if (!comments) return comments; 
    
    for (let i = 0; i < comments.length; i++) {
        comments[i].comments = buildComments(comments[i], commentsMap);
    }

    return comments;
};

