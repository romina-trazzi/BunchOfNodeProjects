console.log("Dashboard loaded ✅");

document.addEventListener("DOMContentLoaded", () => {
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("userRole");
  const accessToken = localStorage.getItem("accessToken");

  // Redirect if not logged in
  if (!accessToken) {
    window.location.href = "/pages/login.html";
    return;
  }

  // Display username
  document.getElementById("usernameDisplay").textContent = username || "Utente";
  document.getElementById("welcomeUser").textContent = username || "Utente";

  // Show admin area if applicable
  if (role === "ADMIN") {
    document.getElementById("adminSection").classList.remove("d-none");
  }

  // Simulated notifications
  const notifBadge = document.getElementById("notifBadge");
  setTimeout(() => {
    notifBadge.textContent = Math.floor(Math.random() * 5);
    notifBadge.classList.add("pulse");
  }, 2000);

  // ========== Gestione form "Crea Evento" ==========
  console.log("✅ Gestione form eventi attiva");

  const openBtn = document.getElementById("openCreateEventBtn");
  const createSection = document.getElementById("createEventSection");
  const cardsRow = document.querySelector(".dashboard-container .row");
  const cancelBtn = document.getElementById("cancelEventBtn");
  const createForm = document.getElementById("createEventForm");

  if (!openBtn) {
    console.warn("⚠️ Bottone 'Crea evento' non trovato nel DOM");
  } else {
    // Mostra il form
    openBtn.addEventListener("click", () => {
      console.log("Click su 'Crea evento'");
      if (cardsRow) cardsRow.classList.add("creating");
      createSection.classList.remove("d-none");
      createSection.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Nascondi il form su annulla
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      console.log("Form annullato");
      createForm.reset();
      createSection.classList.add("d-none");
      if (cardsRow) cardsRow.classList.remove("creating");
    });
  }

  // Gestione submit 
  if (createForm) {
    createForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const newEvent = {
        title: document.getElementById("eventTitle").value.trim(),
        description: document.getElementById("eventDescription").value.trim(),
        date: document.getElementById("eventDate").value,
        location: document.getElementById("eventLocation").value.trim(),
        capacity: parseInt(document.getElementById("eventCapacity").value),
        image: document.getElementById("eventImage").files[0]?.name || null,
      };

      console.log("Evento creato:", newEvent);
      alert("Evento creato (simulazione)");
      createForm.reset();
      createSection.classList.add("d-none");
      if (cardsRow) cardsRow.classList.remove("creating");
    });
  }

  // Logout logic shared by both buttons
  const logout = () => {
    const body = document.querySelector("body");
    body.classList.add("fade-out");
    setTimeout(() => {
      localStorage.clear();
      window.location.href = "../../index.html";
    }, 600);
  };

  // Attach to both buttons
  const logoutDesktop = document.getElementById("logoutBtn");
  const logoutMobile = document.getElementById("logoutBtnMobile");
  if (logoutDesktop) logoutDesktop.addEventListener("click", logout);
  if (logoutMobile) logoutMobile.addEventListener("click", logout);
});