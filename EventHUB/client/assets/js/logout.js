// logout.js
console.log("Logging out...");


// Remove the tokens from localStorage
localStorage.removeItem("accessToken");
localStorage.removeItem("refreshToken");

// Redirect to the login page
window.location.href = "index.html";