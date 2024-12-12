function logout() {
  localStorage.clear();
  window.location.href = '/auth/signin';
}

export { logout };
