console.log("Chat evento caricata ✔️");

// ===============================
// Recupero ID evento da URL
// ===============================
const params = new URLSearchParams(window.location.search);
const eventId = params.get("id");

if (!eventId) {
  alert("Errore: ID evento mancante nell’URL.");
  throw new Error("Event ID missing");
}

// ===============================
// Variabili DOM
// ===============================
const chatBox = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendMessageButton");

// ===============================
// Recupero token e dati utente
// ===============================
const token = localStorage.getItem("accessToken");
const username = localStorage.getItem("username");

if (!token) {
  alert("Devi effettuare il login per accedere alla chat.");
  window.location.href = "../../index.html";
}

// ==============================================
// Funzione helper per chiamate API con token
// ==============================================
async function tokenFetch(url, options = {}) {
  const opts = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
      ...(options.headers || {})
    }
  };

  const res = await fetch(url, opts);
  return res.json();
}

// ===============================
// Caricamento messaggi iniziali
// ===============================
async function loadMessages() {
  const messages = await tokenFetch(`/api/events/${eventId}/messages`);

  chatBox.innerHTML = "";

  messages.forEach(msg => {
    addMessageToUI(msg.user.username, msg.body, msg.createdAt);
  });

  scrollToBottom();
}

// =============================================================
// Funzione aggiungi messaggio alla chat
// =============================================================
function addMessageToUI(sender, text, timestamp) {
  const div = document.createElement("div");
  div.classList.add("mb-2");

  const date = new Date(timestamp);
  const formatted = date.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit"
  });

  div.innerHTML = `
    <div class="p-2 rounded border bg-white shadow-sm">
      <strong>${sender}</strong> <span class="text-muted" style="font-size: 0.8em">${formatted}</span>
      <br>
      ${text}
    </div>
  `;

  chatBox.appendChild(div);
}

// ===============================
// Scroll automatico in fondo
// ===============================
function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ===============================
// Socket.io: connessione e join chatroom
// ===============================
const socket = io();

socket.emit("join-event", eventId);

socket.on("new-message", data => {
  addMessageToUI(data.username, data.message, data.createdAt);
  scrollToBottom();
});

// =============================================================
// Invio messaggio (API POST + Socket emit)
// =============================================================
async function sendMessage() {
  const text = messageInput.value.trim();

  if (!text) return;

  // Invia il messaggio al server (senza mostrarlo due volte)
  const res = await tokenFetch(`/api/events/${eventId}/messages`, {
    method: "POST",
    body: JSON.stringify({ message: text })
  });

  if (res.error) {
    console.error(res.error);
    alert("Errore durante l’invio del messaggio");
    return;
  }

  // Solo quando il messaggio è stato inviato e salvato dal server, lo mostriamo
  // Lo mostriamo subito nella chat dell’utente
  addMessageToUI(username, text, new Date().toISOString());
  scrollToBottom();

  messageInput.value = ""; // Reset del campo input
}


// ============================================
// Event listeners per invio messaggio
// ============================================
sendButton.addEventListener("click", sendMessage);

messageInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

// ===============================
// Carica messaggi iniziali
// ===============================
loadMessages();
