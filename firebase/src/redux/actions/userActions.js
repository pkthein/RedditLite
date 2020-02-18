// import axios from 'axios'
import { db } from '../../firebase/firebase'

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
  // axios.post(`/api/auth/user/signup`, user, { withCredentials: true })
  //   .then(res => {
  //     console.log(res)
  //     dispatch(setIsLoggedIn(true))
  //   })
  //   .catch(res => {
  //     console.log(res)
  //   })
  return db.collection('users').doc('ToC').get().then(doc => {
    if (doc.exists) {
      let docData = doc.data()
      if (user.user.email in docData) {
        throw new Error('Email is already in use!')
      } else if (user.user.username in docData) {
        throw new Error('Username is already in use!')
      }

      return db.collection('users').doc('ToC').set({
        [user.user.email]: user.user.username,
        [user.user.username]: user.user.email
      }, { merge: true })
    } else {
      throw new Error('No ToC!')
    }
  }).then(() => {
    return db.collection('users').doc(`${user.user.email}`).set({
      username: user.user.username,
      password: user.user.password
    })
  }).then(() => {
    dispatch(setIsLoggedIn(true))

    window.ws.send(JSON.stringify({
      type: 'LOGGED_IN',
      email: user.user.email
    }))
    return 
  }).catch(err => {
    alert(err)
  })
}

export const loginUser = user => (dispatch, getState) => {
  let cookiePW = user.user.password
  
  // axios.post(`/api/auth/user/login`, user, { withCredentials: true })
  //   .then(res => {
  //     document.cookie = `email=${res.data.response.user.email}`
  //     document.cookie = `password=${cookiePW}`

  //     dispatch(setUsername(res.data.response.user.username))
  //     dispatch(setIsLoggedIn(true))
  //     return
  //   })
  //   .then(() => dispatch(listNotes()))
  //   .catch(res => {
  //     console.log(res)
  //   })

  return db.collection('users').doc(user.user.email).get().then(doc => {
    if (doc.exists) {
      if (user.user.password === doc.data().password) {
        document.cookie = `email=${user.user.email}`
        document.cookie = `password=${cookiePW}`

        dispatch(setUsername(doc.data().username))
        dispatch(setIsLoggedIn(true))

        window.ws.send(JSON.stringify({
          type: 'LOGGED_IN',
          email: user.user.email
        }))
        return
      }
    }
    throw new Error('This user does not exists!')
  }).then(() => {
    dispatch(listNotes())
    return
  }).catch(err => {
    alert(err)
  })
}

export const logoutUser = () => (dispatch, getState) => {
  // axios.post(`api/auth/user/logout`, {}, { withCredentials: true })
  //   .then(res => {
  //     dispatch(setEmail(''))
  //     dispatch(setUsername(''))
  //     dispatch(setIsLoggedIn(false))
  //   })
  //   .catch(res => {
  //     console.log(res)
  //   })

  dispatch(setEmail(''))
  dispatch(setUsername(''))
  dispatch(setIsLoggedIn(false))
}
