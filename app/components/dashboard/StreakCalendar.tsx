import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore } from 'date-fns';

interface StreakCalendarProps {
  currentDate: Date;
  streakDates: Date[];
  onMonthChange: (date: Date) => void;
  onDayPress?: (date: Date) => void;
}

const StreakCalendar: React.FC<StreakCalendarProps> = ({
  currentDate,
  streakDates,
  onMonthChange,
  onDayPress
}) => {
  const theme = useTheme();
  
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [currentDate]);

  const previousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  const isStreakDay = (date: Date) => {
    return streakDates.some(streakDate => 
      streakDate.getDate() === date.getDate() && 
      streakDate.getMonth() === date.getMonth() && 
      streakDate.getFullYear() === date.getFullYear()
    );
  };

  const getWeekDayLabels = () => {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return weekdays.map(day => (
      <Text key={day} style={[styles.weekdayLabel, { color: theme.colors.textSecondary }]}>
        {day}
      </Text>
    ));
  };

  const renderDays = () => {
    const today = new Date();
    
    return calendarDays.map((date) => {
      const isCurrentMonth = isSameMonth(date, currentDate);
      const isActiveDay = isToday(date);
      const isPastDay = isBefore(date, today) && !isToday(date);
      const hasStreak = isStreakDay(date);
      
      return (
        <TouchableOpacity
          key={date.toString()}
          style={[
            styles.dayContainer,
            !isCurrentMonth && styles.outsideMonthDay,
            isActiveDay && [styles.todayContainer, { borderColor: theme.colors.primary }],
          ]}
          onPress={() => onDayPress && onDayPress(date)}
          disabled={!isCurrentMonth}
        >
          <View style={[
            styles.dayContent,
            hasStreak && [styles.streakDay, { backgroundColor: theme.colors.primary }],
            isPastDay && !hasStreak && [styles.missedDay, { backgroundColor: theme.colors.border }]
          ]}>
            <Text
              style={[
                styles.dayText,
                { color: theme.colors.text },
                hasStreak && { color: theme.colors.background },
                !isCurrentMonth && { color: theme.colors.textSecondary },
              ]}
            >
              {format(date, 'd')}
            </Text>
          </View>
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.monthTitle, { color: theme.colors.text }]}>
          {format(currentDate, 'MMMM yyyy')}
        </Text>
        <View style={styles.navigationButtons}>
          <TouchableOpacity onPress={previousMonth} style={styles.navButton}>
            <Feather name="chevron-left" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
            <Feather name="chevron-right" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.weekdayLabelsContainer}>
        {getWeekDayLabels()}
      </View>
      
      <View style={styles.daysContainer}>
        {renderDays()}
      </View>
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendMarker, { backgroundColor: theme.colors.primary }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Streak Day</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendMarker, { backgroundColor: theme.colors.border }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Missed Day</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendMarker, styles.todayLegend, { borderColor: theme.colors.primary }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Today</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  navigationButtons: {
    flexDirection: 'row',
  },
  navButton: {
    padding: 8,
    marginLeft: 4,
  },
  weekdayLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 8,
  },
  weekdayLabel: {
    fontSize: 12,
    width: 32,
    textAlign: 'center',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayContainer: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayContent: {
    width: '80%',
    height: '80%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
  },
  outsideMonthDay: {
    opacity: 0.4,
  },
  todayContainer: {
    borderWidth: 1,
    borderRadius: 16,
  },
  streakDay: {
    borderRadius: 16,
  },
  missedDay: {
    borderRadius: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  todayLegend: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  legendText: {
    fontSize: 12,
  },
});

export default StreakCalendar; 