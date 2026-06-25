import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Platform, KeyboardAvoidingView, useWindowDimensions } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';

import { COLORS } from '../constants/colors';
import { sendMessageToBot } from '../services/botApi';
import { fetchEventsForUser } from '../services/eventApi';
import { Header } from '../components/Header';
import { CalendarSidebar } from '../components/CalendarSidebar';

import { 
  renderAvatar, 
  renderBubble, 
  renderMessageText, 
  renderInputToolbar, 
  renderSend, 
  renderFooter
} from '../components/ChatCustomUI';

import 'react-native-get-random-values';
import { startRecording, stopRecordingAndTranscribe } from '../services/audioService';

const extractEventsFromResponse = (response) => {
  if (Array.isArray(response?.events)) {
    return response.events;
  }

  if (Array.isArray(response?.calendar_events)) {
    return response.calendar_events;
  }

  if (Array.isArray(response?.data?.events)) {
    return response.data.events;
  }

  return null;
};

const getEventEndTime = (event) => event.end_time || event.start_time;

const normalizeEventForAgenda = (event) => {
  const id = event.id || event.event_id;
  const startTime = event.start_time || event.start;
  const endTime = event.end_time || startTime;

  if (!id || !startTime || !endTime) {
    return null;
  }

  return {
    id: String(id),
    title: event.title || 'אירוע ללא כותרת',
    description: event.description || '',
    start_time: startTime,
    end_time: endTime,
  };
};

const filterActiveEvents = (events, currentTime = Date.now()) => {
  return events.filter((event) => {
    const endTime = new Date(getEventEndTime(event)).getTime();
    return !Number.isNaN(endTime) && endTime >= currentTime;
  });
};

const normalizeActiveEvents = (events, currentTime = Date.now()) => {
  return filterActiveEvents(events.map(normalizeEventForAgenda).filter(Boolean), currentTime);
};

const getResponseSystemTime = (response) => {
  const systemTime = new Date(response?.current_system_time).getTime();
  return Number.isNaN(systemTime) ? Date.now() : systemTime;
};

export const ChatScreen = ({ userToken, onLogout }) => {

  const { width } = useWindowDimensions();
  const showCalendarSidebar = width > 768;

  const [messages, setMessages] = useState([]);
  const [events, setEvents] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'שלום! המערכת מחוברת. איך אפשר לעזור היום?',
        createdAt: new Date(),
        user: { _id: 2, name: 'Smart Agent' },
      },
    ]);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadInitialEvents = async () => {
      try {
        const response = await fetchEventsForUser(userToken);
        const initialEvents = extractEventsFromResponse(response);

        if (isMounted && initialEvents !== null) {
          setEvents(normalizeActiveEvents(initialEvents, getResponseSystemTime(response)));
        }
      } catch (error) {
        console.error("Initial events load error:", error);
      }
    };

    loadInitialEvents();

    return () => {
      isMounted = false;
    };
  }, [userToken]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setEvents(previousEvents => filterActiveEvents(previousEvents));
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleStartRecording = async () => {
    setIsRecording(true);
    await startRecording();
  };

  const handleStopRecording = async () => {
  setIsRecording(false);
  setIsTyping(true);

  try {

    const text = await stopRecordingAndTranscribe();

    if (text) {
      onSend([{
        _id: Math.random().toString(),
        text,
        createdAt: new Date(),
        user: { _id: 1 }
      }]);
    }

  } catch (err) {
    console.error("Transcription error:", err);
    setIsTyping(false);
  }
};

  const onSend = useCallback(async (newMessages = []) => {

    setMessages(previous => GiftedChat.append(previous, newMessages));
    const userText = newMessages[0].text;

    setIsTyping(true);

    try {

      const response = await sendMessageToBot(userText, userToken);
      const syncedEvents = extractEventsFromResponse(response);

      if (syncedEvents !== null) {
        setEvents(normalizeActiveEvents(syncedEvents, getResponseSystemTime(response)));
      }

      const botMsg = {
        _id: Math.random().toString(),
        text: response.reply || 'בוצע בהצלחה',
        createdAt: new Date(),
        user: { _id: 2, name: 'Smart Agent' },
      };

      setMessages(previous => GiftedChat.append(previous, [botMsg]));

    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsTyping(false);
    }

  }, [userToken]);

  const renderInputToolbarStable = useCallback((props) => {
    return renderInputToolbar(props, handleStartRecording, handleStopRecording, isRecording);
  }, [isRecording]);

  return (
    <SafeAreaView style={styles.container}>

      <Header title="Agent Desk" onLogout={onLogout} />

      <View style={[styles.innerContainer, showCalendarSidebar && styles.wideInnerContainer]}>

        <View style={styles.chatPanel}>
          <GiftedChat
            messages={messages}
            onSend={msgs => onSend(msgs)}
            user={{ _id: 1 }}

            placeholder="הקלד הודעה..."
            locale="he"

            renderAvatar={renderAvatar}
            renderBubble={renderBubble}
            renderMessageText={renderMessageText}
            renderInputToolbar={renderInputToolbarStable}
            renderSend={renderSend}
            renderFooter={() => renderFooter(isTyping)}

            isTyping={isTyping}
            scrollToBottom

            timeTextStyle={{
              left: { color: COLORS.secondaryText },
              right: { color: COLORS.secondaryText }
            }}

            listViewProps={{
              style: { backgroundColor: COLORS.background }
            }}
          />
        </View>

        {showCalendarSidebar && (
          <View style={styles.sidebarPanel}>
            <CalendarSidebar events={events} />
          </View>
        )}

      </View>

      {Platform.OS === 'android' && (
        <KeyboardAvoidingView behavior="padding" />
      )}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },

  innerContainer: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: COLORS.background
  },

  wideInnerContainer: {
    flexDirection: 'row',
    maxWidth: 1180
  },

  chatPanel: {
    flex: 1,
    backgroundColor: COLORS.background
  },

  sidebarPanel: {
    flex: 0.54,
    minWidth: 300,
    maxWidth: 430
  }

});
