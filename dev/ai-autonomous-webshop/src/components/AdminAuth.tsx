import { useState } from 'react';

const ADMIN_KEY = 'nexus_admin_session';

export const isAdminAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(ADMIN_KEY) === 'true';
};

export const setAdminAuthenticated = (value: boolean) => {
  if (typeof window === 'undefined') return;
  if (value) {
    localStorage.setItem(ADMIN_KEY, 'true');
  } else {
    localStorage.removeItem(ADMIN_KEY);
  }
};

export function useAdminAuth() {
  const [authed, setAuthed] = useState(isAdminAuthenticated());

  const login = () => {
    setAdminAuthenticated(true);
    setAuthed(true);
  };

  const logout = () => {
    setAdminAuthenticated(false);
    setAuthed(false);
  };

  return { authed, login, logout };
}
