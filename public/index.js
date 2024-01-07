const socket = io();
const peer = new Peer();
var localUserId = '';
let roomarray ={}
let roomplayers={}
let roomid
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
  roomid=id
});
socket.on('rooms',(rooms)=>{
  roomarray=rooms
})
socket.on('roommembers',(roommembers)=>{
  roomplayers=roommembers
})



function checkroom(){
  roomid = document.getElementById('roomid').value
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
     for(const room_id in roomplayers){
       if(room_id==roomid){
        for(const id in roomplayers[room_id]){
          peer.connect(roomplayers[room_id][id])
          getUserMedia(
            { video: true, audio: true },
            function (stream){
              var call = peer.call(roomplayers[room_id][id], stream);
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
  // socket.emit('roommember',({roomid:localUserId,userid:localUserId}))
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
  var inputElement = document.createElement("input");
  inputElement.value = localUserId;
  document.body.appendChild(inputElement);
  inputElement.select();
  document.execCommand("copy");
  document.body.removeChild(inputElement);
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
  video.remove()
})

function playvideo(){
  var link = document.getElementById('link').value
  socket.emit('videolink',({vlink:link,room_id:roomid}))
}

function addMessage(message,sender) {
  var chatbox = document.getElementById('chatbox');
  var newMessage = document.createElement('div');
  newMessage.classList.add('message');
  newMessage.textContent = message;
  chatbox.appendChild(newMessage);
  chatbox.scrollTop = chatbox.scrollHeight;
  if(sender==localUserId){newMessage.style.left='90px'}
  else{newMessage.style.left='0px'}
  
}
function onSeek(position) {
  socket.emit('seek', { position, room_id: roomid });
}


function sendMessage(){
  if(document.getElementById('message').value !='')socket.emit('messagebyuser',({message:document.getElementById('message').value, sender:localUserId}))
   document.getElementById('message').value=''
}
document.getElementById('message').addEventListener('keydown',(e)=>{
    if(e.key=='Enter'){
      if(document.getElementById('message').value !='')socket.emit('messagebyuser',({message:document.getElementById('message').value, sender:localUserId}))
      document.getElementById('message').value =''
    }
})
socket.on('messageemit',({message,sender})=>{
  console.log(roomid)
  for(const room_id in roomplayers){
    if(room_id==roomid){
     for(const id in roomplayers[room_id]){

     }}}
  
     addMessage(message,sender)
})
var videoPlayer 
let m_video =''
socket.on('video-link',({vlink,room_id})=>{
  if(room_id==roomid){
  videoPlayer= document.getElementById('video-player');
  videoPlayer.innerHTML = `
    <video id="m_video" width="100%" height="100%" autoplay controls style="border-radius : 10px">
      <source src="${vlink}" type="video/mp4">
    </video>
  `
  if(localUserId!=roomid){socket.on('back_videoState', (currentTime)=>{
    m_video.controls = false
    m_video.currentTime=currentTime
  })}
  m_video= document.getElementById('m_video')
  ;}
  if(m_video!='' && localUserId==roomid){
    m_video.addEventListener('timeupdate',()=>{
      socket.emit('videoState', m_video.currentTime);
    })
  }
})
// if(m_video){const m_video= document.getElementById(m_video)
// console.log(m_video)}