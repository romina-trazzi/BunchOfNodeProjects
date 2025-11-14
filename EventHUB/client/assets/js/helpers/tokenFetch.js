// Funzione che serve per tornare alla pagina di login direttamente se il token non è più valido.

export async function tokenFetch(url, options = {}) {
  const token = localStorage.getItem("accessToken");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    localStorage.clear();
    alert("Sessione scaduta. Effettua di nuovo il login.");
    window.location.href = "../../index.html";
    return;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}