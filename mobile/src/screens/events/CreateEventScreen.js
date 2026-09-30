import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, Image, TouchableOpacity, Alert } from 'react-native';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import colors from '../../theme/colors';
import client from '../../api/client';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus } from 'lucide-react-native';

const CreateEventScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [totalCapacity, setTotalCapacity] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    if (!title || !description || !category || !date || !venue || !ticketPrice || !totalCapacity) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('date', date); // Assuming simple YYYY-MM-DD string format for this example
      formData.append('venue', venue);
      formData.append('ticketPrice', ticketPrice);
      formData.append('totalCapacity', totalCapacity);

      if (imageUri) {
        let filename = imageUri.split('/').pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;
        formData.append('image', { uri: imageUri, name: filename, type });
      }

      await client.post('/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      Alert.alert('Success', 'Event created successfully!');
      navigation.navigate('EventList');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Could not create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <ImagePlus size={32} color={colors.secondary} />
            <Text style={styles.imageText}>Add Event Poster</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.form}>
        <CustomInput label="Event Title" placeholder="e.g. Summer Music Festival" value={title} onChangeText={setTitle} />
        <CustomInput label="Category" placeholder="e.g. Music, Tech, Workshop" value={category} onChangeText={setCategory} />
        <CustomInput label="Date (YYYY-MM-DD)" placeholder="2026-12-31" value={date} onChangeText={setDate} />
        <CustomInput label="Venue" placeholder="e.g. Madison Square Garden" value={venue} onChangeText={setVenue} />
        
        <View style={styles.row}>
          <View style={styles.col}>
            <CustomInput label="Ticket Price ($)" placeholder="0.00" keyboardType="numeric" value={ticketPrice} onChangeText={setTicketPrice} />
          </View>
          <View style={styles.colSpace} />
          <View style={styles.col}>
            <CustomInput label="Total Capacity" placeholder="100" keyboardType="numeric" value={totalCapacity} onChangeText={setTotalCapacity} />
          </View>
        </View>

        <CustomInput label="Description" placeholder="Tell people what this event is about..." value={description} onChangeText={setDescription} multiline={true} numberOfLines={4} />

        <View style={styles.buttonContainer}>
          <CustomButton title="Create Event" onPress={handleCreate} loading={loading} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: 40,
  },
  imagePicker: {
    backgroundColor: colors.white,
    height: 200,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 36, 0.03)',
  },
  imageText: {
    marginTop: 8,
    color: colors.secondary,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  form: {
    padding: 24,
  },
  row: {
    flexDirection: 'row',
  },
  col: {
    flex: 1,
  },
  colSpace: {
    width: 16,
  },
  buttonContainer: {
    marginTop: 20,
  }
});

export default CreateEventScreen;
