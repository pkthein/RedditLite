// import axios from 'axios'
import { db } from '../../firebase/firebase'

export const resetApp = () => (dispatch, getState) => {
  dispatch(listNotes())
}

export const loadPostContent = id => (dispatch, getState) => {
  let post = {}
  return db.collection('posts').doc('ToC').get().then(doc => {
    if (doc.exists) {
      for (let key in doc.data()) {
        if (doc.data()[key]._id === id) {
          return doc.data()[key]
        }
      }
    }
    throw new Error('An error has occured!')
  }).then(res => {
    post.content = res

    return db.collection('posts').doc(id).get().then(doc => {
      if (doc.exists) {
        return doc.data().comments
      }
      throw new Error('Incorrect ID!')
    })
  }).then((res) => {
    post.comments = res
    dispatch(reducePostComments(post))
    return
  }).catch(err => {
    alert(err)
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

  let ref = db.collection('posts').doc()
  let id = ref.id
  let timestamp = Date.now()
  let post = {
    _id: id,
    title: title,
    text: description,
    author: username,
    num_comments: 0,
    _createdAt: Date(Date.now()),
    uuid: timestamp
  }

  return ref.set({
    comments: []
  }).then(() => {
    return db.collection('posts').doc('ToC').set({
      [timestamp]: post
    }, { merge: true })
  }).then(() => {
    dispatch(reduceCreateNewPost(post))
    dispatch(reduceLoading(false))

    window.ws.send(JSON.stringify({
      type: 'SEND_MESSAGE'
    }))
    return
  }).catch(err => {
    alert(err)
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

export const addFirstComment = (comment, username) => ({
  type: 'ADD_FIRST_LAYER_COMMENT',
  comment: {
    text: comment,
    author: username,
    parent: null,
    comments: [],
    _createdAt: Date(Date.now())
  }
})

export const addSecondComment = (comment, index, username) => ({
  type: 'ADD_SECOND_LAYER_COMMENT',
  comment: {
    text: comment,
    author: username,
    parent: null,
    comments: [],
    _createdAt: Date(Date.now())
  },
  index
})

export const listNotes = () => (dispatch, getState) => {
  dispatch(reduceLoading(true))
  // axios.get('/api/notes/all', { withCredentials: true })
  //   .then(res => {
  //     dispatch(setNotes(res.data.response.notes))
  //   })
  //   .catch(err => {
  //     console.log(err)
  //   })
  return db.collection('posts').doc('ToC').get().then(doc => {
    if (doc.exists) {
      let posts = []
      let docData = doc.data()

      for (let key in docData) {
        posts.push(docData[key])
      }

      return posts
    }
    throw new Error('No ToC!')
  }).then(res => {
    dispatch(setNotes(res))
    dispatch(reduceLoading(false))
    return
  }).catch(err => {
    alert(err)
  })
}

const setNotes = notes => ({
  type: 'NOTES_SET_NOTES',
  notes
})
