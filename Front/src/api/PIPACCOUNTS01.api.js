/**
 * API module for Account management
 */

const BASE_URL = "/api/pip/accounts";

export async function fetchAccountsList(query) {
  const params = new URLSearchParams(query).toString();
  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) throw new Error("Failed to fetch accounts");
  return res.json();
}

export async function createAccount(data) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to create account");
  }
  return res.json();
}

export async function updateAccount(id, data) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to update account");
  }
  return res.json();
}

export async function deleteAccount(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete account");
  return res.json();
}

export async function restoreAccount(id) {
  const res = await fetch(`${BASE_URL}/${id}/restore`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to restore account");
  return res.json();
}
