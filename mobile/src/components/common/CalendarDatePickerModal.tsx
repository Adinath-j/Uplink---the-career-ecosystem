import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { radii, spacing, useTheme, useThemedStyles, ColorPalette } from '../../theme';
import { Icon } from './Icon';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';

interface CalendarDatePickerModalProps {
  visible: boolean;
  value?: string; // format: "YYYY-MM-DD"
  title?: string;
  minDate?: string;
  maxDate?: string;
  allowClear?: boolean;
  onConfirm: (dateString: string) => void;
  onClear?: () => void;
  onClose: () => void;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

export function formatToIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = padZero(d.getMonth() + 1);
  const day = padZero(d.getDate());
  return `${year}-${month}-${day}`;
}

export function formatFriendlyDate(isoString?: string): string {
  if (!isoString) return '';
  const parts = isoString.split('-');
  if (parts.length !== 3) return isoString;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return isoString;
  const d = new Date(year, month, day);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const CalendarDatePickerModal: React.FC<CalendarDatePickerModalProps> = ({
  visible,
  value,
  title = 'Select Date',
  allowClear = false,
  onConfirm,
  onClear,
  onClose,
}) => {
  const { colors } = useTheme();
  const { styles } = useThemedStyles(createStyles);

  const today = new Date();
  const todayIso = formatToIsoDate(today);

  const parseInitialDate = () => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  };

  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(parseInitialDate());
  const [selectedDateIso, setSelectedDateIso] = useState<string>(
    value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : todayIso
  );
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      const d = parseInitialDate();
      setCurrentMonthDate(d);
      setSelectedDateIso(value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : todayIso);
      setIsYearPickerOpen(false);
    }
  }, [visible, value]);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0-indexed

  // First day of month (0 = Sunday, 1 = Monday, ...)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (dayNumber: number) => {
    const iso = `${year}-${padZero(month + 1)}-${padZero(dayNumber)}`;
    setSelectedDateIso(iso);
  };

  const handleSelectYear = (selectedYear: number) => {
    setCurrentMonthDate(new Date(selectedYear, month, 1));
    setIsYearPickerOpen(false);
  };

  const handleQuickToday = () => {
    const t = new Date();
    setCurrentMonthDate(t);
    setSelectedDateIso(formatToIsoDate(t));
  };

  const handleConfirm = () => {
    onConfirm(selectedDateIso);
    onClose();
  };

  const handleClear = () => {
    onClear?.();
    onClose();
  };

  // Build grid of day items
  const daysGrid: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysGrid.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysGrid.push(d);
  }

  // Generate range of years (currentYear - 40 to currentYear + 10)
  const currentYear = today.getFullYear();
  const yearsList: number[] = [];
  for (let y = currentYear + 6; y >= currentYear - 35; y--) {
    yearsList.push(y);
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.selectedSubtitle}>
                {selectedDateIso ? formatFriendlyDate(selectedDateIso) : 'None selected'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.closeBtn}
            >
              <Icon name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Month & Year Navigation Bar */}
          <View style={styles.monthBar}>
            <TouchableOpacity
              onPress={() => setIsYearPickerOpen(!isYearPickerOpen)}
              style={styles.monthYearSelector}
              activeOpacity={0.7}
            >
              <Text style={styles.monthYearText}>
                {MONTH_NAMES[month]} {year}
              </Text>
              <Icon
                name={isYearPickerOpen ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>

            {!isYearPickerOpen && (
              <View style={styles.navButtons}>
                <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
                  <Icon name="chevron-left" size={18} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
                  <Icon name="chevron-right" size={18} color={colors.text} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Year Picker Dropdown */}
          {isYearPickerOpen ? (
            <View style={styles.yearPickerContainer}>
              <Text style={styles.yearPickerLabel}>Select Year</Text>
              <ScrollView
                style={styles.yearScroll}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.yearGrid}
              >
                {yearsList.map((y) => {
                  const isSelected = y === year;
                  return (
                    <TouchableOpacity
                      key={y}
                      onPress={() => handleSelectYear(y)}
                      style={[styles.yearChip, isSelected && styles.yearChipSelected]}
                    >
                      <Text
                        style={[
                          styles.yearChipText,
                          isSelected && styles.yearChipTextSelected,
                        ]}
                      >
                        {y}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          ) : (
            <>
              {/* Day of Week Header */}
              <View style={styles.weekRow}>
                {WEEK_DAYS.map((w, index) => (
                  <View key={index} style={styles.weekCell}>
                    <Text style={styles.weekText}>{w}</Text>
                  </View>
                ))}
              </View>

              {/* Days Grid */}
              <View style={styles.daysContainer}>
                {daysGrid.map((dayNum, index) => {
                  if (dayNum === null) {
                    return <View key={`blank-${index}`} style={styles.dayCell} />;
                  }

                  const cellIso = `${year}-${padZero(month + 1)}-${padZero(dayNum)}`;
                  const isSelected = cellIso === selectedDateIso;
                  const isToday = cellIso === todayIso;

                  return (
                    <TouchableOpacity
                      key={`day-${dayNum}`}
                      onPress={() => handleSelectDay(dayNum)}
                      style={[
                        styles.dayCell,
                        isToday && styles.todayCell,
                        isSelected && styles.selectedDayCell,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isToday && styles.todayText,
                          isSelected && styles.selectedDayText,
                        ]}
                      >
                        {dayNum}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Quick shortcuts */}
              <View style={styles.quickBar}>
                <TouchableOpacity onPress={handleQuickToday} style={styles.quickBtn}>
                  <Text style={styles.quickBtnText}>Today</Text>
                </TouchableOpacity>
                {allowClear && (
                  <TouchableOpacity onPress={handleClear} style={styles.quickBtn}>
                    <Text style={[styles.quickBtnText, { color: colors.danger }]}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {/* Action buttons */}
          <View style={styles.actions}>
            <SecondaryButton
              label="Cancel"
              onPress={onClose}
              style={{ flex: 1 }}
            />
            <PrimaryButton
              label="Confirm Date"
              onPress={handleConfirm}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: ColorPalette, isDark: boolean) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing[4],
    },
    card: {
      width: '100%',
      maxWidth: 380,
      backgroundColor: colors.surface,
      borderRadius: radii.xl,
      padding: spacing[5],
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 12,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing[3],
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    selectedSubtitle: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: '600',
      marginTop: 2,
    },
    closeBtn: {
      padding: 4,
    },
    monthBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing[2],
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      marginBottom: spacing[3],
    },
    monthYearSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: radii.md,
      backgroundColor: colors.surfaceElevated,
    },
    monthYearText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    navButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    navBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surfaceMuted,
      justifyContent: 'center',
      alignItems: 'center',
    },
    weekRow: {
      flexDirection: 'row',
      marginBottom: spacing[2],
    },
    weekCell: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 4,
    },
    weekText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
      textTransform: 'uppercase',
    },
    daysContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dayCell: {
      width: '14.28%',
      aspectRatio: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 2,
      borderRadius: radii.full,
    },
    todayCell: {
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    selectedDayCell: {
      backgroundColor: colors.primary,
    },
    dayText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },
    todayText: {
      color: colors.primary,
      fontWeight: '700',
    },
    selectedDayText: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    quickBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing[3],
      paddingTop: spacing[2],
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    quickBtn: {
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    quickBtnText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '600',
    },
    yearPickerContainer: {
      height: 220,
      paddingVertical: spacing[2],
    },
    yearPickerLabel: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '600',
      marginBottom: spacing[2],
    },
    yearScroll: {
      flex: 1,
    },
    yearGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      paddingBottom: 10,
    },
    yearChip: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: radii.md,
      backgroundColor: colors.surfaceMuted,
    },
    yearChipSelected: {
      backgroundColor: colors.primary,
    },
    yearChipText: {
      fontSize: 13,
      color: colors.text,
      fontWeight: '600',
    },
    yearChipTextSelected: {
      color: '#FFFFFF',
    },
    actions: {
      flexDirection: 'row',
      gap: spacing[3],
      marginTop: spacing[4],
    },
  });
