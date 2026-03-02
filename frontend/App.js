// =========================================================
// App Entry Point
// =========================================================
// This is the main application component. It handles:
// 1. Checking for a saved user token on startup.
// 2. Conditional rendering of ChatScreen or LoginScreen.
// 3. User logout functionality.
// =========================================================

import React, { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { View, ActivityIndicator } from 'react-native';

import { ChatScreen } from './src/screens/ChatScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { COLORS } from './src/constants/colors';

export default function App() {
  // ---------------------------
  // State
  // ---------------------------
  const [token, setToken] = useState(null);      // Stores user authentication token
  const [isLoading, setIsLoading] = useState(true); // Loading state while checking token

  // ---------------------------
  // Effect: Check if user is logged in
  // ---------------------------
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

  // ---------------------------
  // Logout handler
  // ---------------------------
  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken'); // Remove token from secure storage
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      setToken(null); // Reset state to trigger LoginScreen
    }
  };

  // ---------------------------
  // Loading screen while checking token
  // ---------------------------
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  // ---------------------------
  // Conditional rendering based on token
  // ---------------------------
  return token ? (
    <ChatScreen userToken={token} onLogout={handleLogout} />
  ) : (
    <LoginScreen onLoginSuccess={(newToken) => setToken(newToken)} />
  );
}