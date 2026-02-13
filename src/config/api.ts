// API configuration
export const API_URL = import.meta.env.VITE_API_URL;
export const AI_API_URL = import.meta.env.VITE_AI_API_URL;
console.log("API_URL: ", API_URL);
console.log("AI_API_URL: ", AI_API_URL);

// Other API-related configuration can be added here
export const API_TIMEOUT = 30000; // 30 seconds
