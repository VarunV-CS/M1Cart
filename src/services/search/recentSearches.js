const STORAGE_KEY = 'm1cart-recent-searches';
const MAX_ITEMS = 6;

export const getRecentSearches = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
};

export const addRecentSearch = (query) => {
  const next = (query || '').trim();
  if (!next) return getRecentSearches();

  const existing = getRecentSearches().filter(
    (item) => item.toLowerCase() !== next.toLowerCase()
  );
  const updated = [next, ...existing].slice(0, MAX_ITEMS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage failures (private mode, quotas, etc.)
  }

  return updated;
};

