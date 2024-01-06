const socket = io();
const peer = new Peer();
var localUserId = '';
let roomarray ={}
var videosAry = [];
const getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

getUserMedia({ video: true, audio: true }, function (stream) {
  newVideo(stream);
});
peer.on('open', (id) => {
  localUserId = id;
  socket.emit('video-join', id);
});
socket.on('rooms',(rooms)=>{
  roomarray=rooms
})



socket.on('connect-user', (userId) => {
  if (localUserId === userId) return;
  // peer.connect(userId)  ]'
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
function checkroom(){
  var roomid = document.getElementById('roomid').value
  for(const id in roomarray){
  if(roomid==roomarray[id]){
     console.log(roomid)
     peer.connect(roomid)
     getUserMedia(
      { video: true, audio: true },
      function (stream) {
        var call = peer.call(roomid, stream);
        call.on('stream', function (remoteStream) {
          newVideo(remoteStream);
        });
      }
    )
  }}
}

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

function createroom(){
  if(localUserId){
  socket.emit('roomid', localUserId)
  var peerid = document.getElementById('rooms')
  peerid.innerHTML=`<div>${localUserId}</div>`}
}

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
  video.style.width = '100%';
  video.style.height = '100%';
  video.style.objectFit = 'cover';
  video.style.border ='3px solid rgb(160, 10, 198)' ;
  video.style.borderRadius = '10px';
};
peer.on('close', ()=>{
  video.remove
})

function playvideo(){
  var link = document.getElementById('link').value
  var videoPlayer = document.getElementById('video-player');
  videoPlayer.innerHTML = `
    <video width="100%" height="100%" autoplay controls style="border-radius : 10px">
      <source src="${link}" type="video/mp4">
    </video>
  `;

}
