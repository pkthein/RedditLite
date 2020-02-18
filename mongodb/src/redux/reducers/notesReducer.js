import axios from 'axios'

const DEFAULT_STATE = {
  loading: false,
  notes: [], // default
  post: {
    content: {},
    comments: []
  }
}

const notesReducer = (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case 'LOADING':
      return {
        ...state,
        loading: action.loading
      }
    case 'POST_COMMENTS':
      return {
        ...state,
        post: action.post
      }
    case 'CREATE_NEW_POST':
      state.notes.push(action.post)
      return {
        ...state
      }
    case 'ADD_FIRST_LAYER_COMMENT':
      state.post.comments.push(action.comment)
      state.post.content.num_comments = state.post.content.num_comments + 1
      
      let body = {
        comment: {
          text: action.comment.text,
          post: action.comment.post
        }
      }

      axios.post('/api/post/new/comment', body, { withCredentials: true })
        .then(() => {
          return
        })
        .catch(err => {
          console.log(err)
        })
      // TODO:
      // window.ws.send(JSON.stringify({
      //   type: 'SEND_MESSAGE'
      // }))
      return {
        ...state,
        post: {
          content: state.post.content,
          comments: state.post.comments
        }
      }
    case 'ADD_SECOND_LAYER_COMMENT':
      state.post.comments[action.index].comments = state.post.comments[action.index].comments || []
      state.post.comments[action.index].comments.push(action.comment)
      state.post.content.num_comments = state.post.content.num_comments + 1

      let body0 = {
        comment: {
          text: action.comment.text,
          post: action.comment.post,
          parent: state.post.comments[action.index]._id
        }
      }

      axios.post('/api/post/new/comment', body0, { withCredentials: true })
        .then(() => {
          return
        })
        .catch(err => {
          console.log(err)
        })

      // TODO:
      // window.ws.send(JSON.stringify({
      //   type: 'SEND_MESSAGE'
      // }))
      return {
        ...state,
        post: {
          content: state.post.content,
          comments: state.post.comments
        }
      }
    case 'NOTES_SET_NOTES':
      return {
        ...state,
        notes: action.notes
      }
    default:
      return state;
  }
}

export default notesReducer
