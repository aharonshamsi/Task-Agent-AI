import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { COLORS } from '../constants/colors';
import { LOGIN_URL } from '../constants/config';

export const LoginScreen = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('שגיאה', 'נא להזין שם משתמש וסיסמה');
      return;
    }

    setLoading(true);
    try {
      // 1. שליחת הבקשה לשרת
      const response = await axios.post(LOGIN_URL, { username, password });
      
      // 2. חילוץ הטוקן מהתגובה (ודא שבשרת ה-Flask המפתח נקרא 'access_token')
      const token = response.data.access_token;

      if (!token) {
        throw new Error("Token not found in response");
      }

      // 3. שמירת הטוקן
      try {
        await SecureStore.setItemAsync('userToken', token);
      } catch (storeError) {
        // ב-Web, SecureStore לפעמים נכשל. נמשיך הלאה בלי לשמור (רק לזמן הריצה הנוכחי)
        console.warn("SecureStore failed, moving forward without persistent save:", storeError);
      }
      
      // 4. הודעה לאפליקציה שהתחברנו בהצלחה
      // השורה הזו היא זו ש"מעבירה" אותך למסך הבא
      onLoginSuccess(token);

    } catch (error) {
      console.error("Login detail error:", error.response?.data || error.message);
      Alert.alert('התחברות נכשלה', 'שם משתמש או סיסמה שגויים');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>כניסה למערכת</Text>
      
      <TextInput
        style={styles.input}
        placeholder="שם משתמש"
        placeholderTextColor={COLORS.secondaryText}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="סיסמה"
        placeholderTextColor={COLORS.secondaryText}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>התחבר</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    color: COLORS.text,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    textAlign: 'right',
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});