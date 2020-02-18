import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import * as serviceWorker from './serviceWorker'

import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './redux/reducers/rootReducer'
import { Provider } from 'react-redux'
import { BrowserRouter as Router } from 'react-router-dom'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'font-awesome/css/font-awesome.min.css'

import { setActiveUsers } from './redux/actions/userActions'
// import { resetApp } from './redux/actions/notesActions'

const ws = new WebSocket('ws://' + window.location.host.split(':')[0] + (window.location.port && `:${window.location.port}`) + '/websocket');

const store = createStore(rootReducer, applyMiddleware(thunk))

ws.onclose = () => {
  // console.log('connection has closed!')
}

ws.onopen = () => {
  // console.log('connection has opened!')
}

ws.onmessage = (message) => {
  const messageObject = JSON.parse(message.data)

  switch (messageObject.type) {
    case 'UPDATE_USER_COUNT':
      store.dispatch(setActiveUsers(messageObject.count))
      break
    case 'UPDATE_MESSAGES':
      // store.dispatch(resetApp())
      break
    default:
      return
  }

  // console.log(messageObject)
}

ws.onerror = (e) => {
  console.log(e)
}

window.ws = ws

ReactDOM.render(
  <Provider store={ store }>
    <Router>
      <App />
    </Router>
  </Provider>
  ,
  document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
