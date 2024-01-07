const socket = io();
const peer = new Peer();
var localUserId = '';
let roomarray ={}
let roomplayers={}
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
socket.on('roommembers',(roommembers)=>{
  roomplayers=roommembers
})


function checkroom(){
  var roomid = document.getElementById('roomid').value
  for(const id in roomarray){
  if(roomid==roomarray[id]){
     socket.emit('roommember',{roomid:roomid,userid:localUserId})
     
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
     for(const roomid in roomplayers){
       if(roomid==roomid){
        for(const id in roomplayers[roomid]){
          console.log(roomplayers[roomid][id])
          // peer.connect(roomplayers[roomid][id])
          getUserMedia(
            { video: true, audio: true },
            function (stream){
              var call = peer.call(roomplayers[roomid][id], stream);
              call.on('stream', function (remoteStream) {
                newVideo(remoteStream);
              });
            }
          )

        }
       }
     }
     
    
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
  peerid.innerHTML=`<button onmouseover="this.style.backgroundColor='blue'" onmouseout="this.style.backgroundColor='white'" onclick= "CopyToClipboard() ;this.innerText ='Copied!'" style="border: 4px solid blue;
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  font-size:18px ;font-weight: bold;
  outline: none;
  border-radius: 5px;
  cursor: pointer;">Click to copy Roomid</button>`}
  peerid.style.position='absolute'
  peerid.style.left = '240px'
}
function CopyToClipboard() {
  navigator.clipboard.writeText(`${localUserId}`);
  alert("RoomID has been created and copied Now you can invite your friends")
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

function addMessage(message) {
  var chatbox = document.getElementById('chatbox');
  var newMessage = document.createElement('div');
  newMessage.classList.add('message');
  newMessage.textContent = message;
  chatbox.appendChild(newMessage);
  chatbox.scrollTop = chatbox.scrollHeight;
}

function sendMessage(){addMessage(document.getElementById('message').value)}
document.getElementById('message').addEventListener('keydown',(e)=>{
    if(e.key=='Enter'){
      sendMessage()
    }
})