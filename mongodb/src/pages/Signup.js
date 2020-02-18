import React from 'react'
import md5 from 'md5'

import { Redirect, useHistory } from 'react-router-dom'

import { Button } from "react-bootstrap"

import { connect } from 'react-redux'

import {
  setEmail, setUsername, registerUser
} from '../redux/actions/userActions'

const Login = ({ dispatch, email, username, isLoggedIn }) => {
  const [password, setPassword] = React.useState('')
  const [confPassword, setConfPassword] = React.useState('')

  let history = useHistory()

  const verify = () => {
    if (!email.includes('@') || !email.includes('.')) {
      alert('Not a valid email!')
    } else if (username === '') {
      alert('Username cannot be empty!')
    } else if (password !== confPassword) {
      alert('Passwords do not match!')
    } else if (password.length < 5) {
      alert('Password must be longer than 5 characters!')
    } else {
      dispatch(registerUser({
        user: {
          username, email, password: md5(password)
        }
      }))
    }
  }

  const updateEmail = (newEmail) => {
    if (newEmail.length < 20) {
      dispatch(setEmail(newEmail))
    }
  }

  const updateUsername = (newUsername) => {
    if (newUsername.length < 20) {
      dispatch(setUsername(newUsername))
    }
  }

  const updatePassword = newPassword => {
    if (newPassword.length < 20) {
      setPassword(newPassword)
    }
  }

  const updateConfPassword = newConfPassword => {
    if (newConfPassword.length < 20) {
      setConfPassword(newConfPassword)
    }
  }

  if (isLoggedIn) {
    return <Redirect to="/dashboard" />
  }

  return (
    <div>
      <br />
      <h2>Sign Up</h2>
      <div>
        <div className="App-header">
          <input
            value={ email }
            placeholder="EMAIL"
            type="text"
            onChange={ e => updateEmail(e.target.value) }
          />
          <input
            value={ username }
            placeholder="USERNAME"
            type="text"
            onChange={ e => updateUsername(e.target.value) }
          />
          <input
            value={ password }
            placeholder="PASSWORD"
            type="password"
            onChange={ e => updatePassword(e.target.value) }
          />
          <input
            value={ confPassword }
            placeholder="PASSWORD"
            type="password"
            onChange={ e => updateConfPassword(e.target.value) }
            onKeyPress={ e => e.key === 'Enter' ? verify() : '' }
          />
        </div>

        <div style={{ "paddingTop": "10px" }}>
          <Button
            variant="primary" onClick={ () => verify() } size="lg"
            style={{ "minWidth": "300px" }}
          >
            Sign Up
          </Button>
        </div>

        <br />

        <div>
          Already have an account
          <span style={{ "paddingLeft": "3px" }}>
            <Button
              variant="outline-secondary"
              onClick={ () => history.push('/') }
            >
              Go To Log In Page
            </Button>
          </span>
        </div>

      </div>
    </div>
  )
}

const mapStateToProps = state => ({
  email: state.userReducer.email,
  username: state.userReducer.username,
  isLoggedIn: state.userReducer.isLoggedIn
})

export default connect(mapStateToProps)(Login)
