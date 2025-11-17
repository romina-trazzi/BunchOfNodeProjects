const socket = io("http://localhost:4000");
const eventId = "12345"; // L'ID dell'evento, prendi dinamicamente dall'URL o da un parametro

socket.emit('join-event', eventId);

document.getElementById('sendMessageButton').addEventListener('click', sendMessage);

socket.on('new-message', (data) => {
  const chatMessages = document.getElementById('chatMessages');
  const messageElement = document.createElement('div');
  messageElement.innerText = data.message;
  chatMessages.appendChild(messageElement);
});

function sendMessage() {
  const message = document.getElementById('messageInput').value;
  socket.emit('new-message', { eventId, message });
  document.getElementById('messageInput').value = ''; // Clear input
}
