document.addEventListener('DOMContentLoaded', function () {
    const roomsContainer = document.getElementById('rooms-container');
    const createRoomForm = document.getElementById('create-room-form');
  
    // Toggle join/leave functionality
    roomsContainer.addEventListener('click', function (e) {
      if (e.target.classList.contains('join-btn')) {
        const button = e.target;
        if (button.textContent === 'Join Room') {
          button.textContent = 'Leave Room';
          button.style.backgroundColor = '#ff5050'; // Red to indicate leaving
        } else {
          button.textContent = 'Join Room';
          button.style.backgroundColor = '#0073b1'; // Back to original
        }
      }
    });
  
    // Handle the creation of a new room
    createRoomForm.addEventListener('submit', function (e) {
      e.preventDefault();
  
      const titleInput = document.getElementById('room-title');
      const isPublic = document.getElementById('is-public').checked;
      const geoRestriction = document.getElementById('geo-restriction').value;
  
      // Create a new room card
      const newRoom = document.createElement('div');
      newRoom.classList.add('room-card');
  
      const newRoomTitle = document.createElement('h3');
      newRoomTitle.textContent = titleInput.value;
  
      const newRoomHost = document.createElement('p');
      newRoomHost.textContent = 'Host: You (Premium User)';
  
      const newRoomBtn = document.createElement('button');
      newRoomBtn.classList.add('btn-primary', 'join-btn');
      newRoomBtn.textContent = 'Join Room';
  
      newRoom.appendChild(newRoomTitle);
      newRoom.appendChild(newRoomHost);
  
      // Optional: Show room status (public or private) and geo restriction
      const extraInfo = document.createElement('p');
      extraInfo.textContent = `Public: ${isPublic ? 'Yes' : 'No'}, Geo Restriction: ${geoRestriction}`;
      newRoom.appendChild(extraInfo);
  
      newRoom.appendChild(newRoomBtn);
  
      // Add it to the container
      roomsContainer.appendChild(newRoom);
  
      // Reset the form
      titleInput.value = '';
      document.getElementById('is-public').checked = false;
      document.getElementById('geo-restriction').value = 'None';
    });
  });