import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, ActivityIndicator, StyleSheet, Alert, TextInput } from 'react-native';
import { Button, Icon } from '@rneui/themed';
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
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar usuarios..."
        placeholderTextColor="#9CA3AF"
        value={searchText}
        onChangeText={setSearchText}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#6F4E37" />
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
  searchInput: {
    backgroundColor: '#FFFFFF',
    color: '#333',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    margin: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#9CA3AF',
  },
  card: {
    backgroundColor: '#F0EDE0',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
    // elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'column',
  },
  handleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  nameText: {
    fontSize: 13,
    color: '#6B7280',
  },
  addButton: {
    backgroundColor: '#A9B388',
    borderRadius: 8,
  },
});

export default UserSearchScreen;
