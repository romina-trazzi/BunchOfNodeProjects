import { tokenFetch } from "./helpers/tokenFetch.js";

console.log("Dashboard loaded ✅");

document.addEventListener("DOMContentLoaded", () => {

  // ============================================================
  // 1. RECUPERO DATI UTENTE E VALIDAZIONE ACCESSO
  // ============================================================

  const username    = localStorage.getItem("username");
  const role        = localStorage.getItem("userRole");
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    window.location.href = "/pages/login.html";
    return;
  }

  document.getElementById("usernameDisplay").textContent = username || "Utente";
  document.getElementById("welcomeUser").textContent     = username || "Utente";

  if (role === "ADMIN") {
    document.getElementById("adminSection").classList.remove("d-none");
  }

  // Notifiche simulate
  const notifBadge = document.getElementById("notifBadge");
  setTimeout(() => {
    notifBadge.textContent = Math.floor(Math.random() * 5);
    notifBadge.classList.add("pulse");
  }, 2000);


  // ============================================================
  // 2. GESTIONE APERTURA / CHIUSURA FORM CREAZIONE EVENTO
  // ============================================================

  const openCreateBtn = document.getElementById("openCreateEventBtn");
  const createSection = document.getElementById("createEventSection");
  const eventForm     = document.getElementById("createEventForm");
  const cancelBtn     = document.getElementById("cancelEventBtn");
  const cardsRow      = document.querySelector(".dashboard-container .row");

  if (openCreateBtn) {
    openCreateBtn.addEventListener("click", () => {
      cardsRow?.classList.add("creating");
      createSection.classList.remove("d-none");
      createSection.scrollIntoView({ behavior: "smooth" });
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      eventForm.reset();
      createSection.classList.add("d-none");
      cardsRow?.classList.remove("creating");
    });
  }


  // ============================================================
  // 3. SUBMIT FORM CREAZIONE EVENTO
  // ============================================================ 

  if (eventForm) {
  eventForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title       = document.getElementById("eventTitle").value.trim();
    const description = document.getElementById("eventDescription").value.trim();
    const startsAt    = document.getElementById("eventDate").value;
    const capacity    = parseInt(document.getElementById("eventCapacity").value);
    const location    = document.getElementById("eventLocation").value.trim();
    const category    = document.getElementById("eventCategory").value.trim();  
    const imageFile   = document.getElementById("eventImage").files[0];
    const imageUrl    = imageFile ? imageFile.name : null;

    if (!title || !startsAt || !capacity) {
      alert("Titolo, data e capienza sono obbligatori.");
      return;
    }

    const newEvent = {
      title,
      description,
      category, 
      location,   
      startsAt,
      capacity,
      imageUrl
    };

    console.log("Invio evento al server:", newEvent);

    const result = await tokenFetch("/api/events", {
      method: "POST",
      body: JSON.stringify(newEvent),
    });

    if (!result || result.error) {
      alert(result?.error || "Errore durante la creazione dell’evento.");
      return;
    }

    alert("Evento creato con successo!");
    eventForm.reset();
    createSection.classList.add("d-none");
    cardsRow?.classList.remove("creating");
  });
}


  // ============================================================
  // 4. LOGOUT (desktop + mobile)
  // ============================================================

  const logout = () => {
    document.body.classList.add("fade-out");
    setTimeout(() => {
      localStorage.clear();
      window.location.href = "../../index.html";
    }, 600);
  };

  document.getElementById("logoutBtn")?.addEventListener("click", logout);
  document.getElementById("logoutBtnMobile")?.addEventListener("click", logout);


  // ============================================================
  // 5. CARICARE GLI EVENTI DELL’UTENTE (IN FUTURO)
  // ============================================================

  // function loadUserEvents() { ... }

});