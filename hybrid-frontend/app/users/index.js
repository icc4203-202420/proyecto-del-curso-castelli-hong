import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Input, Button, Icon } from '@rneui/themed';
import axios from 'axios';
import { NGROK_URL } from '@env';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import EventModal from './EventModal';
import BackButton from '../components/BackButton';

const UserSearchScreen = () => {
  const [currentUserId, setCurrentUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const storedUserId = await SecureStore.getItemAsync('USER_ID');
      if (storedUserId) {
        setCurrentUserId(storedUserId);
      }
    };
    fetchUser();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${NGROK_URL}/api/v1/users`);
      const filteredUsers = response.data.users.filter(user => user.id !== parseInt(currentUserId));
      setUsers(filteredUsers);
      setFilteredUsers(filteredUsers);
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const results = users.filter(user => user.handle.toLowerCase().includes(searchText.toLowerCase()));
    setFilteredUsers(results);
  }, [searchText, users]);

  const handleAddFriend = (userId) => {
    setSelectedFriendId(userId);
    setModalVisible(true);
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

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Solicitud de Amistad',
          body: 'Has enviado una solicitud de amistad.',
        },
        trigger: null,
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
        <BackButton/>
        <Input
          placeholder="Buscar"
          value={searchText}
          onChangeText={setSearchText}
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.input}
          leftIcon={<Icon name="search" color="#6F4E37" />}
          placeholderTextColor="#6F4E37"
        />
        {loading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardContent}>
                  <View style={styles.userInfo}>
                    <Text style={styles.handleText}>{item.handle}</Text>
                    <Text style={styles.nameText}>{`${item.first_name} ${item.last_name}`}</Text>
                  </View>
                  <Button 
                    title="" 
                    onPress={() => handleAddFriend(item.id)} 
                    icon={<Icon name="person-add" color="#ffffff" />}
                    buttonStyle={styles.addButton}
                  />
                </View>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron usuarios.</Text>}
          />
        )}
        <EventModal 
          visible={modalVisible} 
          onClose={() => setModalVisible(false)} 
          onSubmit={handleModalSubmit}
          friendId={selectedFriendId}
        />
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  inputContainer: {
    marginBottom: 5,
    marginTop: 40,
  },
  input: {
    backgroundColor: '#A67B5B',
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  handleText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  nameText: {
    fontSize: 16,
    color: '#666',
    opacity: 0.6,
  },
  addButton: {
    backgroundColor: '#B17457',
  },
});

export default UserSearchScreen;
