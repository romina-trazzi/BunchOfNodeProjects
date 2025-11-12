// client/assets/js/dashboard.js
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
