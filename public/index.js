const socket = io('/');
const peer = new Peer();
var localUserId = '';
var videosAry = [];
const getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

getUserMedia({ video: true, audio: true }, function (stream) {
  newVideo(stream);
});

socket.on('connect-user', (userId) => {
  if (localUserId === userId) return;
  peer.connect(userId);
  getUserMedia(
    { video: true, audio: true },
    function (stream) {
      var call = peer.call(userId, stream);
      call.on('stream', function (remoteStream) {
        newVideo(remoteStream);
      });
    }
  )
});

peer.on('connection', function (con) {
  peer.on('call', function (call) {
    getUserMedia(
      { video: true, audio: true },
      function (stream) {
        call.answer(stream);
        call.on('stream', function (remoteStream) {
          newVideo(remoteStream);
        });
      }
    );
  });
});

peer.on('open', (id) => {
  localUserId = id;
  socket.emit('video-join', id);
});

const newVideo = (stream) => {
  const video = document.createElement('video');
  const videoContainer = document.getElementById('video-container');
  if (videosAry.includes(stream.id)) return;
  video.srcObject = stream;
  video.id = stream.id;
  videosAry.push(stream.id);
  video.addEventListener('loadedmetadata', () => {
    video.play();
    videoContainer.append(video);
  });
};