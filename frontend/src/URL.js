export const API_BASE_URL = import.meta.env.VITE_API_URL;
// If your socket URL is always the same as your API base URL, you can define it like this:
export const SOCKET_URL = import.meta.env.VITE_API_URL; 

// If you want to keep them separate for future flexibility:
// export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL; 

// For simplicity, assuming VITE_API_URL will be the base for both HTTP and WebSocket for now.