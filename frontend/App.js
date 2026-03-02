import React, { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { ChatScreen } from './src/screens/ChatScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from './src/constants/colors';

export default function App() {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync('userToken');
        if (savedToken) {
          setToken(savedToken);
        }
      } catch (error) {
        console.log("SecureStore error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkLogin();
  }, []);

  // פונקציית ההתנתקות - מוחקת את הטוקן ומחזירה למסך ה-Login
  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken'); // מחיקה מהזיכרון הקבוע
      setToken(null); // איפוס ה-State יגרום לרינדור מחדש של מסך ה-Login
    } catch (error) {
      console.log("Logout error:", error);
      setToken(null); 
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return token ? (
    // העברת פונקציית ההתנתקות למסך הצ'אט
    <ChatScreen userToken={token} onLogout={handleLogout} />
  ) : (
    <LoginScreen onLoginSuccess={(newToken) => setToken(newToken)} />
  );
}