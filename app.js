const express = require('express');
const { ExpressPeerServer } = require('peer');
const app = express();

const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer, {
  cors: {
    origin: '*',
  },
});
app.set('view engine', 'ejs');
app.use(express.static('public'));
const peerServer = ExpressPeerServer(httpServer, {
  debug: true,
});
app.use('/peerjs', peerServer);
app.get('/', (req, res) => {
  return res.render('index');
});

io.on('connection', (socket) => {
  socket.on('video-join', (userId) => {
    socket.join('room');
    io.to('room').emit('connect-user', userId);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`App is listening on ${PORT}`));
