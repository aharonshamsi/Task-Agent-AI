import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export const Header = ({ title, onLogout }) => (
  <View style={styles.header}>
    {/* Logout button on the left side */}
    <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
      <MaterialIcons name="logout" size={22} color={COLORS.secondaryText} />
    </TouchableOpacity>
    
    <Text style={styles.headerTitle}>{title}</Text>
    
    {}
    <View style={{ width: 40 }} />
  </View>
);

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: COLORS.leftBubble,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#313d45',
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  logoutButton: {
    padding: 5,
    width: 40,
  },
});