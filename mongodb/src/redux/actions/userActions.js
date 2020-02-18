import axios from 'axios'

import { listNotes } from './notesActions'

export const setActiveUsers = activeUsers => ({
  type: 'SET_ACTIVE_USERS',
  activeUsers,
})

export const setEmail = email => ({
  type: 'SET_EMAIL',
  email
})

export const setIsLoggedIn = isLoggedIn => ({
  type: 'SET_IS_LOGGED_IN',
  isLoggedIn
})

export const setUsername = username => ({
  type: 'SET_USERNAME',
  username
})

export const registerUser = user => (dispatch, getState) => {
  axios.post(`/api/auth/user/signup`, user, { withCredentials: true })
    .then(res => {
      window.ws.send(JSON.stringify({
        type: 'LOGGED_IN',
        email: user.user.email
      }))

      dispatch(setIsLoggedIn(true))
      return
    })
    .catch(res => {
      console.log(res)
    })
}

export const loginUser = user => (dispatch, getState) => {
  let cookiePW = user.user.password

  axios.post(`/api/auth/user/login`, user, { withCredentials: true })
    .then(res => {
      document.cookie = `email=${res.data.response.user.email}`
      document.cookie = `password=${cookiePW}`

      window.ws.send(JSON.stringify({
        type: 'LOGGED_IN',
        email: user.user.email
      }))

      dispatch(setUsername(res.data.response.user.username))
      dispatch(setIsLoggedIn(true))
      return
    })
    .then(() => {
      dispatch(listNotes())
      return
    })
    .catch(res => {
      alert('Email and password combination does not exist!')
      console.log(res)
    })
}

export const logoutUser = () => (dispatch, getState) => {
  axios.post(`api/auth/user/logout`, {}, { withCredentials: true })
    .then(res => {
      dispatch(setEmail(''))
      dispatch(setUsername(''))
      dispatch(setIsLoggedIn(false))
    })
    .catch(res => {
      console.log(res)
    })
}
