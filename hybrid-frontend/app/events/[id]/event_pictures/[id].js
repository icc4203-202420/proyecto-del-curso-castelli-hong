import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { NGROK_URL } from '@env';
import BackButton from '../../../components/BackButton'; 
import { format } from 'date-fns';  // Importando 'format' de date-fns
import FriendRequestModal from "../../../components/FriendRequestModal"; // Modal para solicitud de amistad

const EventPictureDetail = () => {
  const { event_id, id } = useLocalSearchParams(); 
  const [pictureDetails, setPictureDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taggedUsers, setTaggedUsers] = useState([]); // Inicializa como un array vacío
  const [showFriendRequestModal, setShowFriendRequestModal] = useState(false); // Controla el modal
  const [selectedUser, setSelectedUser] = useState(null); // Usuario seleccionado para la solicitud de amistad
  const [selectedEvent, setSelectedEvent] = useState(null); // Evento seleccionado

  const router = useRouter(); // Hook para la navegación

  useEffect(() => {
    const fetchPictureDetails = async () => {
      try {
        // Fetch the picture details
        const response = await axios.get(`${NGROK_URL}/api/v1/events/${event_id}/event_pictures/${id}`);
        setTaggedUsers(response.data.tagged_users);
        setPictureDetails(response.data.event_picture);

        // Fetch the user details (assuming `user_id` is available in the picture details)
        const userResponse = await axios.get(`${NGROK_URL}/api/v1/users/${response.data.event_picture.user_id}`);
        setUserDetails(userResponse.data);
        
      } catch (error) {
        console.error('Error fetching picture details or user details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPictureDetails();
  }, [event_id, id]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
  }

  // Formatear la fecha 'created_at'
  const formattedDate = pictureDetails?.created_at ? format(new Date(pictureDetails.created_at), 'MMMM dd, yyyy') : null;

  // Mostrar los usuarios etiquetados y permitir la interacción
  const renderTaggedUsers = () => {
    if (taggedUsers && taggedUsers.length > 0) {
      return (
        <View style={styles.taggedUsers}>
          <Text style={styles.taggedUsersTitle}>Tagged Users:</Text>
          {taggedUsers.map((user) => (
            <TouchableOpacity 
              key={user.id} 
              style={styles.taggedUserButton} 
              onPress={() => handleAddFriend(user)} // Redirige al usuario al hacer clic
            >
              <Text style={styles.taggedUser}>
                {user.handle}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    } else {
      return; // no hay usuarios etiquetados
    }
  };

  // Abre el modal para enviar una solicitud de amistad
  const handleAddFriend = (user) => {
    setSelectedUser(user);  // Establece el usuario seleccionado
    setShowFriendRequestModal(true);  // Muestra el modal
  };
  const handleModalSubmit = async (event) => {
    if (!currentUserId || !event) return;

    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        Alert.alert('Error', 'Token de autenticación no encontrado.');
        return;
      }

      await axios.post(`${NGROK_URL}/api/v1/users/${currentUserId}/friendships`, {
        friendship: {
          friend_id: selectedFriendId,
          event_id: event.id,
        },
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert('Éxito', 'Solicitud de amistad enviada.');
    } catch (error) {
      console.error('Error al agregar amigo:', error);
      Alert.alert('Error', 'No se pudo enviar la solicitud de amistad.');
    } finally {
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <BackButton />
      
      {/* Mostrar los detalles del usuario */}
      {userDetails && (
        <View style={styles.userInfo}>
          <View style={[styles.avatar]}>
            <Text style={styles.avatarText}>
              {userDetails.handle ? userDetails.handle[0].toUpperCase() : '?'}
            </Text>
          </View>
          <Text style={styles.handle}>{userDetails.handle}</Text>
        </View>
      )}

      {/* Mostrar la imagen */}
      <Image 
        source={{ uri: `${NGROK_URL}${pictureDetails.image_url}` }} 
        style={styles.image}
      />

      {/* Mostrar la descripción */}
      <View style={styles.caption}>
        <Text style={styles.handle}>{userDetails.handle}</Text>
        <Text style={styles.description}>
          {pictureDetails.description || 'No description available'}
        </Text>
      </View>

      {/* Mostrar la fecha formateada */}
      {formattedDate && (
        <Text style={styles.date}>{formattedDate}</Text>
      )}

      {/* Mostrar los usuarios etiquetados */}
      {renderTaggedUsers()}

      {/* Modal para solicitud de amistad */}
      {showFriendRequestModal && selectedUser && (
        <FriendRequestModal
          visible={showFriendRequestModal}
          onClose={() => setShowFriendRequestModal(false)}
          onSubmit={handleModalSubmit}
          friendId={selectedUser.id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
  image: { width: '100%', height: 300, marginBottom: 10 },
  description: { fontSize: 16, color: 'gray' },

  // Styles for user info section
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#5F6F52',
  },
  avatarText: {
    color: 'white',
    fontSize: 14,
  },
  handle: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Styles for caption (handle and description on the same line)
  caption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    color: 'gray',
    marginLeft: 6,
  },

  // Styles for date
  date: {
    fontSize: 14,
    color: 'gray',
    marginTop: 10,
  },

  // Styles for tagged users
  taggedUsers: {
    marginTop: 10,
  },
  taggedUsersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  taggedUserButton: {
    marginTop: 10,
    backgroundColor: '#B2AFA8',
    paddingVertical: 10, 
    paddingHorizontal: 20,
    borderRadius: 20, 
  },
  taggedUser: {
    color: 'white',
    fontSize: 14,
  },

  // Style for no tagged users message
  noTaggedUsers: {
    fontSize: 14,
    color: 'gray',
    marginTop: 10,
  },
});

export default EventPictureDetail;
