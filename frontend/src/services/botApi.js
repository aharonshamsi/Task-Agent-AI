// =========================================================
// API Service: Chat Bot
// =========================================================
// Provides functions to interact with the backend chat API.
// =========================================================

import axios from 'axios';
import { API_URL } from '../constants/config';

/**
 * Sends a user message to the chat bot and returns the response.
 * @param {string} userMessage - The message from the user.
 * @param {string} token - Authorization token for API access.
 * @returns {Promise<Object>} - The response object from the API.
 * @throws Will throw an error if the API call fails.
 */
export const sendMessageToBot = async (userMessage, token) => {
  try {
    const response = await axios.post(
      API_URL,
      { message: userMessage },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    return response.data; // Returns the full reply object
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};