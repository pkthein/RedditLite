const express   = require('express');
const server = require('http');
const httpProxy = require('http-proxy');
//const mongoose  = require('mongoose');
const app       = express();
const appServer = server.createServer(app);
const port      = process.env.PORT || 80;

const apiProxy = httpProxy.createProxyServer()

const wsProxy = httpProxy.createProxyServer({
  target: process.env.WEBSOCKET_HOST || 'http://localhost:6000',
  ws: true,
});

apiProxy.on('error', (err, req, res) => {
  console.log(err)
  res.status(500).send('Proxy Error')
})

wsProxy.on('error', (err, req, socket) => {
  console.log(err);
  console.log('ws failed');
  socket.end();
});

const websocketHost = process.env.WEBSOCKET_HOST || 'http://localhost:6000/websocket';
console.log(`WebSocket end proxies to: ${websocketHost}`);
app.all('/websocket*', (req, res) => {
  console.log('incoming ws');
  apiProxy.web(req, res, { target: websocketHost });
});

appServer.on('upgrade', (req, socket, head) => {
  console.log('upgrade ws here');
  wsProxy.ws(req, socket, head);
});

app.all("/api/auth/*", (req, res) => {
  // service1
  console.log(req.path)
  apiProxy.web(req, res, {
    target: 'http://localhost:3000',
  });
});

app.all("/api/post/*", (req, res) => {
  // service2
  console.log(req.path)
  apiProxy.web(req, res, {
    target: 'http://localhost:3001',
  });
});

app.all("/conveyer/post/*", (req, res) => {
  console.log(req.path)
  apiProxy.web(req, res, {
    target: 'http://localhost:5001',
  });
});

app.all("*", (req, res) => {
  // front end server / react
  apiProxy.web(req, res, {
    target: 'http://localhost:4000',
  })
})

appServer.listen(port, () => console.log(`Gateway on port ${port}!`))
