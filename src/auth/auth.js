export const AUTH_STORAGE_KEY = "civicfix_auth";
export const USERS_STORAGE_KEY = "civicfix_users";

const ADMIN_EMAIL = "admin@civicfix.com";
const ADMIN_PASSWORD = "admin123";

export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Could not read CivicFix session:", error);
    return null;
  }
};

export const setCurrentUser = (user) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("civicfix-auth-changed"));
};

export const logout = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event("civicfix-auth-changed"));
};

export const getUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    const users = raw ? JSON.parse(raw) : [];
    return Array.isArray(users) ? users : [];
  } catch (error) {
    console.error("Could not read CivicFix users:", error);
    return [];
  }
};

export const saveUsers = (users) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const registerUser = ({ name, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();

  if (normalizedEmail === ADMIN_EMAIL) {
    return {
      ok: false,
      message: "That email is reserved for CivicFix administration.",
    };
  }

  if (users.some((user) => user.email === normalizedEmail)) {
    return {
      ok: false,
      message: "An account with this email already exists.",
    };
  }

  const user = {
    id: `USR-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: "user",
    createdAt: new Date().toISOString(),
  };

  saveUsers([...users, user]);

  return { ok: true, user };
};

export const loginUser = ({ email, password, role }) => {
  const normalizedEmail = email.trim().toLowerCase();

  if (role === "admin") {
    if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      return {
        ok: true,
        user: {
          id: "ADMIN-001",
          name: "CivicFix Admin",
          email: ADMIN_EMAIL,
          role: "admin",
        },
      };
    }

    return {
      ok: false,
      message: "Invalid admin credentials.",
    };
  }

  const user = getUsers().find(
    (item) =>
      item.email === normalizedEmail &&
      item.password === password &&
      item.role === "user"
  );

  if (!user) {
    return {
      ok: false,
      message: "Invalid email or password. Create an account first if needed.",
    };
  }

  return { ok: true, user };
};

export const isAuthenticated = () => Boolean(getCurrentUser());
