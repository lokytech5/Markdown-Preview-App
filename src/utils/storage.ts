export function loadFromStorage(key: string, fallback = ""): string {
  try {
    const v = localStorage.getItem(key);
    // Treat null/undefined/empty/whitespace as "no value" → use fallback
    return v != null && v.trim() !== "" ? v : fallback;
  } catch {
    return fallback;
  }
}

export function saveToStorage(key: string, value: string): void {
  try {
    const trimmed = value.trim();
    if (trimmed) {
      localStorage.setItem(key, trimmed);
    } else {
      // If empty, remove so next load falls back to the sample
      localStorage.removeItem(key);
    }
  } catch {
  }
}
