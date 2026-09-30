import React, { useState, useContext } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import colors from '../../theme/colors';
import client from '../../api/client';
import * as ImagePicker from 'expo-image-picker';
import {
  ImagePlus,
  ChevronLeft,
  Calendar,
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
  const [date, setDate] = useState(
    eventToEdit?.date
      ? new Date(eventToEdit.date).toISOString().slice(0, 10)
      : ''
  );
  const [venue, setVenue] = useState(eventToEdit?.venue || '');
  const [ticketPrice, setTicketPrice] = useState(
    eventToEdit?.ticketPrice !== undefined ? String(eventToEdit.ticketPrice) : ''
  );
  const [totalCapacity, setTotalCapacity] = useState(
    eventToEdit?.totalCapacity !== undefined ? String(eventToEdit.totalCapacity) : ''
  );
  const [imageUri, setImageUri] = useState(eventToEdit?.imageUrl || null);
  const [loading, setLoading] = useState(false);

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
      !date.trim() ||
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

    setLoading(true);
    try {
      if (isEditing) {
        if (imageUri && imageUri.startsWith('file://')) {
          const formData = new FormData();
          formData.append('title', title.trim());
          formData.append('description', description.trim());
          formData.append('category', category.trim());
          formData.append('date', date.trim());
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
            date: date.trim(),
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
        formData.append('date', date.trim());
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

            <CustomInput
              label="Date & Time (YYYY-MM-DD) *"
              placeholder="2026-11-20"
              value={date}
              onChangeText={setDate}
              icon={Calendar}
            />

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
});

export default CreateEventScreen;
