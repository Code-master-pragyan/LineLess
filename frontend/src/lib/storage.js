const USER_TOKEN_KEY = "lineLessIndia_userToken";
const ADMIN_TOKEN_KEY = "lineLessIndia_adminToken";

export function saveUserToken(data) {
  localStorage.setItem(USER_TOKEN_KEY, JSON.stringify(data));
}

export function loadUserToken() {
  try {
    const raw = localStorage.getItem(USER_TOKEN_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearUserToken() {
  localStorage.removeItem(USER_TOKEN_KEY);
}

export function saveAdminToken(token) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function loadAdminToken() {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

