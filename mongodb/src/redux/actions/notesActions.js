import axios from 'axios'

export const resetApp = () => (dispatch, getState) => {
  // last step
  // dispatch(listNotes())
}

export const loadPostContent = id => (dispatch, getState) => {
  let post = {}
  let path = `/api/post/findpost`
  let body = {
    post: { _id: id }
  }

  axios.post(path, body, { withCredentials: true })
    .then(res => {
      post.content = res.data.response.post

      return axios.get(`/api/post/${id}/comments`)
    }).then(res => {
      post.comments = res.data.response.post

      dispatch(reducePostComments(post))
      return
    })
    .catch(err => {
      console.log(err)
    })
}

const reducePostComments = post => ({
  type: 'POST_COMMENTS',
  post
})

export const createNewPost = (
  title, description, username
) => (dispatch, getState) => {
  dispatch(reduceLoading(true))
  let body = {
    post: { title, text: description }
  }

  axios.post('/api/post/new', body, { withCredentials: true })
    .then(res => {
      dispatch(reduceCreateNewPost(res.data.response.post))
      dispatch(reduceLoading(false))
      return
    })
    .catch(err => {
      console.log(err)
    })
}

const reduceCreateNewPost = post => ({
  type: 'CREATE_NEW_POST',
  post
})

const reduceLoading = loading => ({
  type: 'LOADING',
  loading
})

export const addFirstComment = (comment, username, id) => ({
  type: 'ADD_FIRST_LAYER_COMMENT',
  comment: {
    text: comment,
    author: username,
    parent: null,
    comments: [],
    _createdAt: Date(Date.now()),
    post: id
  }
})

export const addSecondComment = (comment, index, username, id) => ({
  type: 'ADD_SECOND_LAYER_COMMENT',
  comment: {
    text: comment,
    author: username,
    parent: null,
    comments: [],
    _createdAt: Date(Date.now()),
    post: id
  },
  index
})

export const listNotes = () => (dispatch, getState) => {
  dispatch(reduceLoading(true))

  axios.get('/api/post/sorted', { withCredentials: true })
    .then(res => {
      dispatch(setNotes(res.data.response))
      dispatch(reduceLoading(false))
      return
    })
    .catch(err => {
      console.log(err)
    })
}

const setNotes = notes => ({
  type: 'NOTES_SET_NOTES',
  notes
})
