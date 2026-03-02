import axios from 'axios';
import { API_URL } from '../constants/config';

// פונקציה אסינכרונית לשליחת ההודעה ושליפת התשובה
export const sendMessageToBot = async (userMessage, token) => {
  try {
    const response = await axios.post(API_URL, 
      { message: userMessage }, 
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return response.data; // מחזיר את האובייקט הכולל את ה-reply
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};