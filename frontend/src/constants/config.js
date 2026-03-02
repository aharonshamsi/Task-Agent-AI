// ריכוז משתני סביבה והגדרות כלליות
// הערה: בעולם האמיתי ובייצור, סודות כמו טוקנים צריכים להישמר בקובץ .env נסתר
// src/constants/config.js
export const API_URL = process.env.EXPO_PUBLIC_API_URL;
export const AUTH_TOKEN = process.env.EXPO_PUBLIC_AUTH_TOKEN;
export const LOGIN_URL = 'http://127.0.0.1:5000/login'; // הנתיב החדש לחיבור