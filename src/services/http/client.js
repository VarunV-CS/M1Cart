export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const REQUEST_TIMEOUT = 30000;

export const fetchWithTimeout = async (url, options = {}) => {
  const { signal: userSignal, headers: optionHeaders, ...restOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  let removeUserAbortListener = null;

  if (userSignal) {
    if (userSignal.aborted) {
      controller.abort(userSignal.reason);
    } else {
      const onAbort = () => controller.abort(userSignal.reason);
      userSignal.addEventListener('abort', onAbort, { once: true });
      removeUserAbortListener = () => userSignal.removeEventListener('abort', onAbort);
    }
  }

  try {
    const response = await fetch(url, {
      ...restOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...optionHeaders,
      },
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  } finally {
    if (removeUserAbortListener) {
      removeUserAbortListener();
    }
  }
};

export const handleResponse = async (response) => {
  if (!response.ok) {
    let errorData;

    try {
      errorData = await response.json();
    } catch {
      errorData = { message: `HTTP error! status: ${response.status}` };
    }

    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};
