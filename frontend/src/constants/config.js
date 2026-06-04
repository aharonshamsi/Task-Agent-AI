// =========================================================
// App Configuration
// =========================================================
// Centralized environment variables and general settings.
// Note: In production, secrets like tokens should be stored
// in a hidden .env file and not committed to source control.
// =========================================================

// Base API URL - Centralized for easy updates.
// Web/iOS simulator: http://127.0.0.1:5000
// Android emulator: http://10.0.2.2:5000
// Physical device: http://YOUR_COMPUTER_LAN_IP:5000
const DEFAULT_BASE_URL = 'http://127.0.0.1:5000';
const configuredBotUrl = process.env.EXPO_PUBLIC_API_URL;

export const BASE_URL = configuredBotUrl
  ? configuredBotUrl.replace(/\/bot\/?$/, '')
  : DEFAULT_BASE_URL;

// Chat bot endpoint
export const API_URL = configuredBotUrl || `${BASE_URL}/bot`;

// Public auth token (should ideally be handled securely)
export const AUTH_TOKEN = process.env.EXPO_PUBLIC_AUTH_TOKEN;

// Local register endpoint
export const REGISTER_URL = `${BASE_URL}/user`;

// Local login endpoint
export const LOGIN_URL = `${BASE_URL}/login`;

// Local transcription endpoint (Voice-to-Text)
export const TRANSCRIBE_URL = `${BASE_URL}/transcribe`;

// Config object to support legacy and service references
export const Config = {
  BASE_URL,
  TRANSCRIBE_URL,
  LOGIN_URL,
  REGISTER_URL,
};
