// client.js
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startButton = document.getElementById('startButton');
const hangupButton = document.getElementById('hangupButton');

// Chat elements
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');

// Connect to Socket.IO
const socket = io();

// Configuration for our PeerConnection
// Google STUN server for demonstration. 
// For production usage, consider your own TURN server for NAT traversal.
const configuration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

let localStream;
let remoteStream;
let peerConnection;
let isCallActive = false;

// Request access to camera and mic
async function getMediaStream() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;
  } catch (err) {
    console.error('Error accessing media devices.', err);
  }
}

// Create a new peer connection and add tracks from local stream
function createPeerConnection() {
  peerConnection = new RTCPeerConnection(configuration);

  // Send any ICE candidates to the other peer
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('ice-candidate', event.candidate);
    }
  };

  // Once remote track arrives, display it
  peerConnection.ontrack = (event) => {
    // For simple 1:1, we can attach directly
    remoteVideo.srcObject = event.streams[0];
  };

  // Add local stream tracks to the connection
  if (localStream) {
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });
  }
}

// Handle the Start Call button
startButton.addEventListener('click', async () => {
  if (isCallActive) return; // prevent multiple calls
  isCallActive = true;

  // Ensure we have local media
  await getMediaStream();
  createPeerConnection();

  try {
    // Create an offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // Send offer to the server
    socket.emit('offer', offer);
  } catch (err) {
    console.error('Error creating offer', err);
  }
});

// Handle the Hang Up button
hangupButton.addEventListener('click', () => {
  endCall();
});

// End call logic
function endCall() {
  isCallActive = false;
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  if (remoteVideo.srcObject) {
    remoteVideo.srcObject = null;
  }
  // Optionally, stop local stream tracks
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
    localVideo.srcObject = null;
  }
  socket.emit('user-disconnected');
}

// Listen for incoming "offer"
socket.on('offer', async (offer) => {
  if (!isCallActive) {
    isCallActive = true;
    await getMediaStream();
    createPeerConnection();
  }
  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer', answer);
  } catch (err) {
    console.error('Error handling offer', err);
  }
});

// Listen for incoming "answer"
socket.on('answer', async (answer) => {
  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  } catch (err) {
    console.error('Error setting remote description', err);
  }
});

// Listen for incoming ICE candidates
socket.on('ice-candidate', async (candidate) => {
  try {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (err) {
    console.error('Error adding received ICE candidate', err);
  }
});

// Listen for user disconnect
socket.on('user-disconnected', () => {
  console.log('Remote user disconnected');
  endCall();
});

// ---- Chat logic ---- //
sendChatBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

function sendMessage() {
  const message = chatInput.value.trim();
  if (message.length > 0) {
    appendMessage(`You: ${message}`);
    socket.emit('chat-message', message);
    chatInput.value = '';
  }
}

socket.on('chat-message', (msg) => {
  appendMessage(`Friend: ${msg}`);
});

function appendMessage(text) {
  const msgDiv = document.createElement('div');
  msgDiv.textContent = text;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
