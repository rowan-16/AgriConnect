export function loadStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(`agriconnect_${key}`);
    if (data) {
      return JSON.parse(data) as T;
    }
  } catch (e) {
    console.error(`Failed to load storage key ${key}`, e);
  }
  return fallback;
}

export function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`agriconnect_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save storage key ${key}`, e);
  }
}
