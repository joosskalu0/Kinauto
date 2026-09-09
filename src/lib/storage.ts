/**
 * Safe LocalStorage helpers with fallback in case of Safari Private Mode or JSON parse errors
 */

export function safeGetStorage<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return fallback;
    }
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`[Storage] Failed to read key "${key}":`, err);
    return fallback;
  }
}

export function safeSetStorage<T>(key: string, value: T): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (err) {
    console.warn(`[Storage] Failed to write key "${key}":`, err);
  }
}

export function safeGetString(key: string, fallback: string): string {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return fallback;
    }
    const item = localStorage.getItem(key);
    return item ?? fallback;
  } catch (err) {
    console.warn(`[Storage] Failed to read string key "${key}":`, err);
    return fallback;
  }
}

export function safeSetString(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  } catch (err) {
    console.warn(`[Storage] Failed to write string key "${key}":`, err);
  }
}
