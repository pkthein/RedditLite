const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 6000 })

let loggedInUsers = []

const broadcastMessage = (message) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      // console.log(client._socket.remoteAddress)
      client.send(JSON.stringify(message))
    }
  });
};

const updateUserCount = () => {
  broadcastMessage({
    type: 'UPDATE_USER_COUNT',
    count: loggedInUsers.length
  })
}

const broadcastAllMessages = () => {
  broadcastMessage({
    type: 'UPDATE_MESSAGES'
  })
}

wss.on('connection', (ws) => {
  console.log('Someone has connected')

  updateUserCount()

  ws.send(JSON.stringify({
    type: 'UPDATE_MESSAGES'
  }))

  ws.on('message', (message) => {
    const messageObject = JSON.parse(message)

    switch (messageObject.type) {
      case 'SEND_MESSAGE':
        broadcastAllMessages()
        break
      case 'LOGGED_OUT':
        loggedInUsers = loggedInUsers.filter(v => v !== messageObject.email)
        updateUserCount()
        break
      case 'LOGGED_IN':
        if (!loggedInUsers.includes(messageObject.email)) {
          loggedInUsers.push(messageObject.email)
        }
        updateUserCount()
        break
    }

    console.log(message);
  });

  ws.on('close', () => {
    updateUserCount()

    console.log('someone has disconnected!')
  })

  ws.on('error', (e) => {
    console.log(e)
  })
})
