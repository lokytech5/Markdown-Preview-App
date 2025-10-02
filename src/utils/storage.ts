export function loadFromStorage(key: string, fallback = ""): string {
  try {
    const v = localStorage.getItem(key);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

export function saveToStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore quota / private mode errors
  }
}
