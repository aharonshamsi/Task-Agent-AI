import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Bubble, MessageText, InputToolbar, Send } from 'react-native-gifted-chat';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

// Avatar
export const renderAvatar = (props) => (
  <View style={styles.avatarCircle}>
    <Text style={styles.avatarText}>EA</Text>
  </View>
);

// Bubble
export const renderBubble = (props) => (
  <Bubble
    {...props}
    wrapperStyle={{
      left: styles.bubbleLeft,
      right: styles.bubbleRight,
    }}
    containerStyle={{
      left: { marginLeft: 5, flexShrink: 1 },
      right: { marginRight: 5, flexShrink: 1 },
    }}
    textStyle={{
      left: styles.bubbleText,
      right: styles.bubbleText,
    }}
  />
);

// Message text
export const renderMessageText = (props) => (
  <MessageText
    {...props}
    textStyle={{
      left: styles.messageText,
      right: styles.messageText,
    }}
  />
);

// Input toolbar
export const renderInputToolbar = (props) => (
  <InputToolbar
    {...props}
    containerStyle={styles.inputToolbar}
    primaryStyle={{ alignItems: 'center' }}
  />
);

// Send button
export const renderSend = (props) => (
  <Send {...props} containerStyle={styles.sendButton}>
    <MaterialIcons name="send" size={24} color={COLORS.accent} />
  </Send>
);

// Typing indicator
export const renderFooter = (isTyping) => {
  if (isTyping) {
    return (
      <View style={styles.typingContainer}>
        <Text style={styles.typingText}>מעבד נתונים</Text>
        <ActivityIndicator size="small" color={COLORS.accent} style={{ marginLeft: 8 }} />
      </View>
    );
  }
  return null;
};

const styles = StyleSheet.create({
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.avatarBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.avatarText,
  },

  avatarText: {
    color: COLORS.avatarText,
    fontSize: 12,
    fontWeight: 'bold',
  },

  bubbleLeft: {
    backgroundColor: COLORS.leftBubble,
    borderRadius: 15,
    marginBottom: 5,
    maxWidth: '80%',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },

  bubbleRight: {
    backgroundColor: COLORS.rightBubble,
    borderRadius: 15,
    marginBottom: 5,
    maxWidth: '80%',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },

  bubbleText: {
    color: COLORS.text,
    fontSize: 16,
  },

  messageText: {
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 22,
    color: '#ffffff',
    paddingHorizontal: 10,

    flexShrink: 1,
    flexWrap: 'wrap',  
  },

  inputToolbar: {
    backgroundColor: COLORS.inputBackground,
    borderTopWidth: 0,
    marginHorizontal: 10,
    marginBottom: 5,
    borderRadius: 25,
    paddingHorizontal: 5,
  },

  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 5,
  },

  typingContainer: {
    paddingLeft: 20,
    paddingVertical: 5,
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },

  typingText: {
    fontSize: 12,
    color: COLORS.secondaryText,
    fontStyle: 'italic',
  },
});