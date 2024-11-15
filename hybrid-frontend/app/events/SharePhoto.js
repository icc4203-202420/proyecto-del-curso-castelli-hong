import React, { useEffect, useState } from 'react';
import { View, TextInput, Image, Alert, StyleSheet, Text, TouchableOpacity, ActivityIndicator, FlatList, ScrollView, StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { NGROK_URL } from '@env';
import { useRouter } from 'expo-router';
import BackButton from '../components/BackButton';

const SharePhoto = ({ eventId, eventName }) => {
  const [imageUri, setImageUri] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const router = useRouter();

  const fetchFriends = async () => {
    try {
      const userId = await SecureStore.getItemAsync('USER_ID');
      const token = await SecureStore.getItemAsync('authToken');

      if (!userId || !token) {
        console.error('User ID or token not found');
        return;
      }

      const response = await axios.get(`${NGROK_URL}/api/v1/users/${userId}/friendships`, {
      });

      if (response.status === 200) {
        setFriends(response.data);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const toggleFriendSelection = (friendId) => {
    setSelectedFriends(prevSelectedFriends =>
      prevSelectedFriends.includes(friendId)
        ? prevSelectedFriends.filter(id => id !== friendId)
        : [...prevSelectedFriends, friendId]
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadPhoto = async () => {
    if (!imageUri) {
      Alert.alert('Error', 'No se ha seleccionado ninguna imagen.');
      return;
    }
  
    setLoading(true);
  
    const formData = new FormData();
    formData.append('event_picture[image]', {
      uri: imageUri,
      type: 'image/jpeg',
      name: `photo_${Date.now()}.jpg`,
    });
    formData.append('event_picture[description]', description);
    formData.append('event_picture[event_id]', eventId);
  
    const userId = await SecureStore.getItemAsync('USER_ID');
    if (!userId) {
      Alert.alert('Error', 'User ID not found.');
      setLoading(false);
      return;
    }
  
    formData.append('event_picture[user_id]', userId);
  
    selectedFriends.forEach(friendId => {
      formData.append('event_picture[tag_handles][]', friendId);
    });
  
    try {
      const response = await axios.post(`${NGROK_URL}/api/v1/events/${eventId}/event_pictures`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (response.status === 201) {
        Alert.alert('Éxito', 'Foto subida con éxito.');
        setImageUri(null);
        setDescription('');
        setSelectedFriends([]);
        router.push(`/events/${eventId}`);
      } else {
        console.error('Upload failed:', response.data);
        Alert.alert('Error', 'Failed to upload photo.');
      }
    } catch (error) {
      console.error('Error al subir la foto:', error.response || error.message);
      Alert.alert('Error', 'Error al subir la foto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#A67B5B" />

      <View style={styles.header}>
        <BackButton onPress={() => router.push(`/events/${eventId}`)} />
        <Text style={styles.eventTitle}>{eventName}</Text>
      </View>

      {/* Mostrar un contenedor gris si no hay imagen */}
      {!imageUri ? (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>Selecciona una imagen</Text>
        </View>
      ) : (
        <Image source={{ uri: imageUri }} style={styles.image} />
      )}

      <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
        <Text style={styles.imagePickerText}>Seleccionar imagen</Text>
      </TouchableOpacity>

      <TextInput
        placeholder="Describe tu foto"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />

      <Text style={styles.subHeader}>Etiqueta amigos:</Text>

      <FlatList
        data={friends}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.friendContainer}>
            <View>
              <Text style={styles.friendName}>{`${item.first_name} ${item.last_name}`}</Text>
              <Text style={styles.friendHandle}>@{item.handle}</Text>
            </View>
            <TouchableOpacity
              style={[styles.selectionBox, selectedFriends.includes(item.id) && styles.selectedBox]}
              onPress={() => toggleFriendSelection(item.id)}
            >
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity
        onPress={uploadPhoto}
        style={[styles.uploadButton, loading && styles.disabledButton]}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.uploadButtonText}>Publicar</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgb(250, 247, 240)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'flex-start', // Align left for BackButton and eventTitle
    marginBottom: 20,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  imagePlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: '#D3D3D3',  // Gris claro para el placeholder
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 15,
  },
  placeholderText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 300,
    marginVertical: 15,
    borderRadius: 10,
  },
  imagePickerButton: {
    backgroundColor: '#A67B5B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePickerText: {
    color: '#fff',
    fontSize: 16,
  },
  input: {
    borderBottomWidth: 1,
    width: '100%',
    marginBottom: 15,
    padding: 5,
    fontSize: 16,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  friendContainer: {
    width: '100%',
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  friendHandle: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  selectionBox: {
    width: 30,
    height: 30,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBox: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  uploadButton: {
    backgroundColor: '#A67B5B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#d6d6d6',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SharePhoto;
