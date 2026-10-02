import React, { useState, useContext } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import colors from '../../theme/colors';
import client from '../../api/client';
import * as ImagePicker from 'expo-image-picker';
import {
  ImagePlus,
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Tag,
  Trash2,
  Sparkles,
  ShieldAlert,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../../context/AuthContext';

const PRESET_CATEGORIES = ['Music', 'Tech', 'Food', 'Business', 'Art', 'Sports'];

const CreateEventScreen = ({ navigation, route }) => {
  const { user } = useContext(AuthContext);
  const eventToEdit = route?.params?.eventToEdit;
  const isEditing = Boolean(eventToEdit);

  const [title, setTitle] = useState(eventToEdit?.title || '');
  const [description, setDescription] = useState(eventToEdit?.description || '');
  const [category, setCategory] = useState(eventToEdit?.category || 'Music');
  
  // Date & Time state (supports calendar and time selection)
  const [eventDate, setEventDate] = useState(() => {
    if (eventToEdit?.date) {
      const parsed = new Date(eventToEdit.date);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 1);
    defaultDate.setHours(18, 0, 0, 0); // Default to 6:00 PM tomorrow
    return defaultDate;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [venue, setVenue] = useState(eventToEdit?.venue || '');
  const [ticketPrice, setTicketPrice] = useState(
    eventToEdit?.ticketPrice !== undefined ? String(eventToEdit.ticketPrice) : ''
  );
  const [totalCapacity, setTotalCapacity] = useState(
    eventToEdit?.totalCapacity !== undefined ? String(eventToEdit.totalCapacity) : ''
  );
  const [imageUri, setImageUri] = useState(eventToEdit?.imageUrl || null);
  const [loading, setLoading] = useState(false);

  const onDateChange = (event, selected) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (event.type === 'set' && selected) {
      const updated = new Date(eventDate);
      updated.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
      setEventDate(updated);
    }
  };

  const onTimeChange = (event, selected) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (event.type === 'set' && selected) {
      const updated = new Date(eventDate);
      updated.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      setEventDate(updated);
    }
  };

  const formatDateDisplay = (dateObj) => {
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTimeDisplay = (dateObj) => {
    return dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatFullPreview = (dateObj) => {
    const dateStr = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${dateStr} • ${timeStr}`;
  };

  if (user && user.role !== 'organizer') {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.restrictedContainer}>
          <View style={styles.restrictedIconCircle}>
            <ShieldAlert size={44} color={colors.danger} />
          </View>
          <Text style={styles.restrictedTitle}>Organizer Access Only</Text>
          <Text style={styles.restrictedDesc}>
            Creating and hosting events is exclusively reserved for registered Event Organizers. Attendees can discover and book tickets.
          </Text>
          <TouchableOpacity
            style={styles.backButtonPrompt}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Text style={styles.backButtonPromptText}>Return to Previous Screen</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (e) {
      console.log('Image picker error:', e);
    }
  };

  const handleCreate = async () => {
    if (
      !title.trim() ||
      !description.trim() ||
      !category.trim() ||
      !venue.trim() ||
      !ticketPrice.trim() ||
      !totalCapacity.trim()
    ) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please fill in all required event details.',
      });
      return;
    }

    if (!eventDate || isNaN(eventDate.getTime())) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Schedule',
        text2: 'Please select a valid event date and start time.',
      });
      return;
    }

    const price = parseFloat(ticketPrice);
    const capacity = parseInt(totalCapacity, 10);

    if (isNaN(price) || price < 0) {
      Toast.show({ type: 'error', text1: 'Invalid Price', text2: 'Ticket price must be a valid number.' });
      return;
    }

    if (isNaN(capacity) || capacity < 1) {
      Toast.show({ type: 'error', text1: 'Invalid Capacity', text2: 'Capacity must be at least 1.' });
      return;
    }

    const isoDateString = eventDate.toISOString();

    setLoading(true);
    try {
      if (isEditing) {
        if (imageUri && imageUri.startsWith('file://')) {
          const formData = new FormData();
          formData.append('title', title.trim());
          formData.append('description', description.trim());
          formData.append('category', category.trim());
          formData.append('date', isoDateString);
          formData.append('venue', venue.trim());
          formData.append('ticketPrice', String(price));
          formData.append('totalCapacity', String(capacity));

          const filename = imageUri.split('/').pop() || 'event_banner.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          formData.append('image', { uri: imageUri, name: filename, type });

          await client.put(`/events/${eventToEdit._id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } else {
          await client.put(`/events/${eventToEdit._id}`, {
            title: title.trim(),
            description: description.trim(),
            category: category.trim(),
            date: isoDateString,
            venue: venue.trim(),
            ticketPrice: price,
            totalCapacity: capacity,
            imageUrl: imageUri || eventToEdit.imageUrl,
          });
        }

        Toast.show({
          type: 'success',
          text1: 'Event Updated Successfully',
          text2: 'Modifications have been saved.',
        });

        navigation.goBack();
      } else {
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('description', description.trim());
        formData.append('category', category.trim());
        formData.append('date', isoDateString);
        formData.append('venue', venue.trim());
        formData.append('ticketPrice', String(price));
        formData.append('totalCapacity', String(capacity));

        if (imageUri) {
          const filename = imageUri.split('/').pop() || 'event_banner.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          formData.append('image', { uri: imageUri, name: filename, type });
        }

        await client.post('/events', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        Toast.show({
          type: 'success',
          text1: 'Event Published Successfully',
          text2: 'Your event is now live and accepting bookings.',
        });

        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          try {
            navigation.navigate('Dashboard');
          } catch (navErr) {
            navigation.navigate('Home');
          }
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Could not save event. Please check inputs.';
      Alert.alert(isEditing ? 'Update Failed' : 'Publish Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <ChevronLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>{isEditing ? 'Edit Event' : 'Create New Event'}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Poster Picker */}
          <View style={styles.imagePickerCard}>
            {imageUri ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
                <View style={styles.imageActionRow}>
                  <TouchableOpacity style={styles.changeImageBtn} onPress={pickImage}>
                    <Text style={styles.changeImageText}>Change</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => setImageUri(null)}
                  >
                    <Trash2 size={16} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.imagePlaceholder}
                onPress={pickImage}
                activeOpacity={0.8}
              >
                <View style={styles.uploadIconCircle}>
                  <ImagePlus size={26} color={colors.primary} />
                </View>
                <Text style={styles.uploadPrompt}>Upload Event Banner</Text>
                <Text style={styles.uploadSubPrompt}>High-resolution 16:9 image recommended</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            <CustomInput
              label="Event Title *"
              placeholder="e.g. Summer Music Festival 2026"
              value={title}
              onChangeText={setTitle}
            />

            {/* Category Chips Selector */}
            <View style={styles.categorySection}>
              <Text style={styles.inputLabel}>Category *</Text>
              <View style={styles.categoryChipsRow}>
                {PRESET_CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                      onPress={() => setCategory(cat)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          isSelected && styles.categoryChipTextSelected,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Date & Time Selection Section */}
            <View style={styles.dateTimeSection}>
              <Text style={styles.inputLabel}>Event Schedule *</Text>
              
              <View style={styles.dateTimeRow}>
                {/* Date Picker Button */}
                <TouchableOpacity
                  style={styles.dateTimeCard}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.8}
                >
                  <View style={styles.dateTimeIconCircle}>
                    <Calendar size={18} color={colors.primary} />
                  </View>
                  <View style={styles.dateTimeTextContainer}>
                    <Text style={styles.dateTimeLabel}>Event Date</Text>
                    <Text style={styles.dateTimeValue}>{formatDateDisplay(eventDate)}</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.colSpace} />

                {/* Time Picker Button */}
                <TouchableOpacity
                  style={styles.dateTimeCard}
                  onPress={() => setShowTimePicker(true)}
                  activeOpacity={0.8}
                >
                  <View style={styles.dateTimeIconCircle}>
                    <Clock size={18} color={colors.primary} />
                  </View>
                  <View style={styles.dateTimeTextContainer}>
                    <Text style={styles.dateTimeLabel}>Start Time</Text>
                    <Text style={styles.dateTimeValue}>{formatTimeDisplay(eventDate)}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Formatted Schedule Summary Banner */}
              <View style={styles.scheduleSummary}>
                <Sparkles size={14} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.scheduleSummaryText} numberOfLines={1}>
                  {formatFullPreview(eventDate)}
                </Text>
              </View>
            </View>

            {/* Native Date Pickers */}
            {Platform.OS === 'ios' ? (
              <Modal
                visible={showDatePicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowDatePicker(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Select Event Date</Text>
                      <TouchableOpacity
                        style={styles.modalDoneBtn}
                        onPress={() => setShowDatePicker(false)}
                      >
                        <Text style={styles.modalDoneText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={eventDate}
                      mode="date"
                      display="inline"
                      minimumDate={new Date()}
                      onChange={onDateChange}
                      themeVariant="light"
                    />
                  </View>
                </View>
              </Modal>
            ) : (
              showDatePicker && (
                <DateTimePicker
                  value={eventDate}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={onDateChange}
                />
              )
            )}

            {/* Native Time Pickers */}
            {Platform.OS === 'ios' ? (
              <Modal
                visible={showTimePicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowTimePicker(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Select Start Time</Text>
                      <TouchableOpacity
                        style={styles.modalDoneBtn}
                        onPress={() => setShowTimePicker(false)}
                      >
                        <Text style={styles.modalDoneText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={eventDate}
                      mode="time"
                      display="spinner"
                      onChange={onTimeChange}
                      themeVariant="light"
                    />
                  </View>
                </View>
              </Modal>
            ) : (
              showTimePicker && (
                <DateTimePicker
                  value={eventDate}
                  mode="time"
                  display="default"
                  is24Hour={false}
                  onChange={onTimeChange}
                />
              )
            )}

            <CustomInput
              label="Venue & Address *"
              placeholder="e.g. Madison Square Garden, New York"
              value={venue}
              onChangeText={setVenue}
              icon={MapPin}
            />

            {/* Price & Capacity in 2 Columns */}
            <View style={styles.row}>
              <View style={styles.col}>
                <CustomInput
                  label="Ticket Price ($) *"
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={ticketPrice}
                  onChangeText={setTicketPrice}
                  icon={DollarSign}
                />
              </View>
              <View style={styles.colSpace} />
              <View style={styles.col}>
                <CustomInput
                  label="Total Seats *"
                  placeholder="250"
                  keyboardType="numeric"
                  value={totalCapacity}
                  onChangeText={setTotalCapacity}
                  icon={Users}
                />
              </View>
            </View>

            <CustomInput
              label="Event Description *"
              placeholder="Describe agenda, line-up, special guests, and what attendees should expect..."
              value={description}
              onChangeText={setDescription}
              multiline={true}
              numberOfLines={4}
            />

            {/* Submit Button */}
            <CustomButton
              title={isEditing ? 'Save Changes' : 'Publish Event'}
              onPress={handleCreate}
              loading={loading}
              size="lg"
              style={{ marginTop: 12 }}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  scroll: {
    paddingBottom: 40,
  },
  imagePickerCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  uploadIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadPrompt: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  uploadSubPrompt: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 4,
  },
  previewContainer: {
    position: 'relative',
    height: 200,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imageActionRow: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  changeImageBtn: {
    backgroundColor: colors.dark,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  changeImageText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  removeImageBtn: {
    backgroundColor: colors.white,
    width: 34,
    height: 34,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    padding: 20,
  },
  categorySection: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  categoryChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  categoryChipTextSelected: {
    color: colors.white,
  },
  row: {
    flexDirection: 'row',
  },
  col: {
    flex: 1,
  },
  colSpace: {
    width: 14,
  },
  restrictedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  restrictedIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.dangerLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  restrictedTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  restrictedDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  backButtonPrompt: {
    backgroundColor: colors.dark,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  backButtonPromptText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  dateTimeSection: {
    marginBottom: 18,
  },
  dateTimeRow: {
    flexDirection: 'row',
  },
  dateTimeCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 12,
  },
  dateTimeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  dateTimeTextContainer: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '600',
    marginBottom: 2,
  },
  dateTimeValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '800',
  },
  scheduleSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(204, 75, 55, 0.15)',
  },
  scheduleSummaryText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  modalDoneBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  modalDoneText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
});

export default CreateEventScreen;
