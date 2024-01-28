function setLocalStorage(window: any, key: string, value: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, value);
  }
}
function getLocalStorage(window: any, key: string) {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key);
  }
  return null;
}

export { setLocalStorage, getLocalStorage };
