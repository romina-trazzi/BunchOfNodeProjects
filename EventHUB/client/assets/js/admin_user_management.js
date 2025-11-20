import { tokenFetch } from "./helpers/tokenFetch.js";

console.log("Admin user management loaded");

document.addEventListener("DOMContentLoaded", function() {
  loadUsers();
});

// Funzione per caricare gli utenti
async function loadUsers() {
  try {
    const users = await tokenFetch('/api/admin/users?' + new Date().getTime());  // Recupera gli utenti tramite API

    const userList = document.getElementById('usersList');
    if (!userList) {
      console.error('Elemento usersList non trovato!');
      return;
    }

    userList.innerHTML = '';  // Pulisce la lista

    // Mostra gli utenti nella UI
    users.forEach(user => {
      const row = document.createElement('tr');
      
      const buttonClass = user.isBlocked ? 'btn-success' : 'btn-danger';
      const buttonText = user.isBlocked ? 'Sblocca' : 'Blocca';

      row.innerHTML = `
        <td>${user.username}</td>
        <td>${user.isBlocked ? 'Bloccato' : 'Attivo'}</td>
        <td>
          ${user.role === 'ADMIN' ? '' : `<button class="btn ${buttonClass}">
            ${buttonText}
          </button>`}
        </td>
      `;
      
      userList.appendChild(row);

      // Aggiungi il gestore di eventi solo se non è un ADMIN
      const button = row.querySelector('button');
      if (button && user.role !== 'ADMIN') {
        button.addEventListener('click', function() {
          toggleBlock(user.id, user.isBlocked, button);
        });
      }
    });
  } catch (error) {
    console.error("Errore nel recupero degli utenti:", error);
    alert("Si è verificato un errore nel recupero degli utenti.");
  }
}

// Funzione per bloccare/sbloccare un utente
async function toggleBlock(userId, isBlocked, button) {
  try {
    const endpoint = isBlocked ? 'unblock' : 'block';
    const response = await tokenFetch(`/api/admin/users/${userId}/${endpoint}`, { method: 'PUT' });

    const nowBlocked = response?.user?.isBlocked === true;
    if (nowBlocked) {
      alert('Utente bloccato con successo');
      button.classList.remove('btn-danger');
      button.classList.add('btn-success');
      button.textContent = 'Sblocca';
    } else {
      alert('Utente sbloccato con successo');
      button.classList.remove('btn-success');
      button.classList.add('btn-danger');
      button.textContent = 'Blocca';
    }

    loadUsers();
  } catch (error) {
    console.error("Errore nel bloccare/sbloccare l'utente:", error);
    alert("Si è verificato un errore durante l'operazione.");
  }
}
