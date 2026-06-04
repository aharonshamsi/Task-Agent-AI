import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants/colors';

const getEventStart = (event) => event.start_time || event.start || event.date || null;

const formatEventTime = (event) => {
  const startValue = getEventStart(event);

  if (!startValue) {
    return '--:--';
  }

  const start = new Date(startValue);

  if (Number.isNaN(start.getTime())) {
    return String(startValue).slice(11, 16) || '--:--';
  }

  return start.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const formatEventDate = (event) => {
  const startValue = getEventStart(event);

  if (!startValue) {
    return '';
  }

  const start = new Date(startValue);

  if (Number.isNaN(start.getTime())) {
    return '';
  }

  return start.toLocaleDateString('he-IL', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
};

const sortEventsByStartTime = (events) => {
  return [...events].sort((a, b) => {
    const first = new Date(getEventStart(a)).getTime();
    const second = new Date(getEventStart(b)).getTime();

    if (Number.isNaN(first) && Number.isNaN(second)) {
      return 0;
    }

    if (Number.isNaN(first)) {
      return 1;
    }

    if (Number.isNaN(second)) {
      return -1;
    }

    return first - second;
  });
};

const CalendarEventCard = ({ event }) => {
  const title = event.title || event.name || 'אירוע ללא כותרת';
  const description = event.description || event.notes;

  return (
    <View style={styles.eventRow}>
      <View style={styles.timeline}>
        <View style={styles.timelineDot} />
        <View style={styles.timelineLine} />
      </View>

      <View style={styles.eventCard}>
        <View style={styles.eventMeta}>
          <Text style={styles.eventTime}>{formatEventTime(event)}</Text>
          <Text style={styles.eventDate}>{formatEventDate(event)}</Text>
        </View>

        <Text style={styles.eventTitle} numberOfLines={2}>
          {title}
        </Text>

        {!!description && (
          <Text style={styles.eventDescription} numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>
    </View>
  );
};

export const CalendarSidebar = ({ events = [] }) => {
  const sortedEvents = useMemo(() => sortEventsByStartTime(events), [events]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>סדר היום שלי</Text>
        <Text style={styles.headerCount}>{sortedEvents.length}</Text>
      </View>

      <FlatList
        data={sortedEvents}
        keyExtractor={(item, index) => String(item.id || item.event_id || `${item.title}-${index}`)}
        renderItem={({ item }) => <CalendarEventCard event={item} />}
        contentContainerStyle={[
          styles.listContent,
          sortedEvents.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>אין אירועים להצגה</Text>
            <Text style={styles.emptyText}>אירועים שתוסיף דרך הצ'אט יופיעו כאן מיד.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.leftBubble,
    borderLeftColor: 'rgba(134, 150, 160, 0.18)',
    borderLeftWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
  },

  header: {
    alignItems: 'center',
    borderBottomColor: 'rgba(134, 150, 160, 0.16)',
    borderBottomWidth: 1,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'right',
  },

  headerCount: {
    backgroundColor: 'rgba(0, 168, 132, 0.14)',
    borderColor: 'rgba(0, 168, 132, 0.34)',
    borderRadius: 14,
    borderWidth: 1,
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '700',
    minWidth: 30,
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 4,
    textAlign: 'center',
  },

  listContent: {
    paddingTop: 18,
    paddingBottom: 10,
  },

  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  eventRow: {
    flexDirection: 'row-reverse',
    marginBottom: 14,
  },

  timeline: {
    alignItems: 'center',
    marginLeft: 12,
    width: 16,
  },

  timelineDot: {
    backgroundColor: COLORS.accent,
    borderColor: 'rgba(0, 168, 132, 0.28)',
    borderRadius: 6,
    borderWidth: 3,
    height: 12,
    marginTop: 18,
    width: 12,
  },

  timelineLine: {
    backgroundColor: 'rgba(134, 150, 160, 0.22)',
    flex: 1,
    marginTop: 6,
    minHeight: 38,
    width: 1,
  },

  eventCard: {
    backgroundColor: 'rgba(11, 20, 26, 0.72)',
    borderColor: 'rgba(134, 150, 160, 0.12)',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },

  eventMeta: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  eventTime: {
    color: COLORS.accent,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'right',
  },

  eventDate: {
    color: COLORS.secondaryText,
    fontSize: 12,
    textAlign: 'left',
  },

  eventTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
    textAlign: 'right',
  },

  eventDescription: {
    color: COLORS.secondaryText,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
    textAlign: 'right',
  },

  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 18,
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },

  emptyText: {
    color: COLORS.secondaryText,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
