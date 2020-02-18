import React from 'react'
import { connect } from 'react-redux'
import { Redirect, useHistory } from 'react-router-dom'

import { Button } from 'react-bootstrap'

import { createNewPost } from '../redux/actions/notesActions'

const CreatePost = ({ dispatch, isLoggedIn, username }) => {
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')

  let history = useHistory()

  const verify = () => {
    if (!title) {
      alert('Title cannot be empty!')
    } else if (!description) {
      alert('Description cannot be empty!')
    } else {
      dispatch(createNewPost(title, description, username))
      history.push('/dashboard')
    }
  }

  if (!isLoggedIn) {
    return <Redirect to="/" />
  }

  return (
    <div>
      <br />
      <h3>Create Post</h3>
      <input
        type="text" placeholder="Title of the post..."
        value={ title }
        onChange={ e => setTitle(e.target.value) }
      /><br />

      <textarea
        type="text"
        placeholder="Description of the post goes here..."
        value={ description }
        onChange={ e => setDescription(e.target.value) }
      >
      </textarea><br />

      <Button style={{ "minWidth": "300px" }} onClick={ () => verify() }>
        Submit
      </Button>
    </div>
  )
}

const mapStatetoProps = state => ({
  isLoggedIn: state.userReducer.isLoggedIn,
  username: state.userReducer.username
})

export default connect(mapStatetoProps)(CreatePost)
