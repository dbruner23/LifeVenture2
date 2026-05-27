// Set EXPO_PUBLIC_API_URL (e.g. in a .env file) to the deployed HTTP API URL
// once the backend is live. While it's unset, the client serves local mock
// data so the app is fully usable before anything is deployed.
export const API_BASE_URL: string | null = process.env.EXPO_PUBLIC_API_URL ?? null;

export const USE_MOCK_API = !API_BASE_URL;
