console.log("Admin user management loaded");

const token = localStorage.getItem("accessToken");
const container = document.getElementById("usersList");

async function loadUsers() {
  const res = await fetch("/api/admin/users", {
    headers: { Authorization: "Bearer " + token },
  });
  const users = await res.json();

  container.innerHTML = "";

  if (!users || users.length === 0) {
    container.innerHTML = `<p class="no-events">Nessun utente trovato.</p>`;
    return;
  }

  users.forEach((u) => {
    const col = document.createElement("div");
    col.classList.add("col-md-4", "d-flex");

    const card = document.createElement("div");
    card.classList.add("card", "event-card", "shadow-sm", "flex-fill");

    const body = document.createElement("div");
    body.classList.add("event-card-body");

    const title = document.createElement("h5");
    title.classList.add("fw-bold");
    title.textContent = u.username;

    const email = document.createElement("p");
    email.classList.add("text-muted", "mb-1");
    email.textContent = u.email;

    const role = document.createElement("span");
    role.classList.add("badge", u.role === "ADMIN" ? "badge-organizer" : "badge-subscribed", "mb-2");
    role.textContent = u.role;

    const btns = document.createElement("div");
    btns.classList.add("event-card-buttons", "d-flex", "justify-content-between", "mt-3");

    const blockBtn = document.createElement("button");
    blockBtn.classList.add("btn", "btn-outline-danger", "btn-sm", "d-flex", "align-items-center", "gap-2");
    blockBtn.innerHTML = `<i class="bi bi-slash-circle"></i> Blocca`;

    const unblockBtn = document.createElement("button");
    unblockBtn.classList.add("btn", "btn-outline-success", "btn-sm", "d-flex", "align-items-center", "gap-2");
    unblockBtn.innerHTML = `<i class="bi bi-check-circle"></i> Sblocca`;

    // Disabilita azioni su ADMIN
    if (u.role === "ADMIN") {
      blockBtn.disabled = true;
      unblockBtn.disabled = true;
    }

    // Stato iniziale
    if (u.isBlocked) {
      blockBtn.classList.add("active");
    }

    blockBtn.addEventListener("click", async () => {
      await fetch(`/api/admin/users/${u.id}/block`, { method: "PUT", headers: { Authorization: "Bearer " + token } });
      loadUsers();
    });

    unblockBtn.addEventListener("click", async () => {
      await fetch(`/api/admin/users/${u.id}/unblock`, { method: "PUT", headers: { Authorization: "Bearer " + token } });
      loadUsers();
    });

    btns.append(blockBtn, unblockBtn);
    body.append(role, title, email, btns);
    card.appendChild(body);
    col.appendChild(card);
    container.appendChild(col);
  });
}

loadUsers();