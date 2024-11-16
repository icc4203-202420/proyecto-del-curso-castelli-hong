import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { Button, Card, Icon, Input } from '@rneui/themed';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store'; // Para manejar authToken
import io from 'socket.io-client'; // Usar socket.io
import BackButton from '../components/BackButton';
const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState({ type: null, value: null });
  const [error, setError] = useState('');
  const [authToken, setAuthToken] = useState(null);
  const socket = io('ws://localhost:3001'); // Establecer la conexión al servidor WebSocket

  useEffect(() => {
    // Obtener authToken desde SecureStore
    const fetchAuthToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('authToken');
        if (!token) {
          throw new Error('No se encontró authToken.');
        }
        setAuthToken(token);
      } catch (err) {
        setError('Error al obtener el token de autenticación.');
      }
    };

    fetchAuthToken();
  }, []);

  useEffect(() => {
    if (!authToken) return;

    // Cargar publicaciones iniciales del feed
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`/v1/feed`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setPosts(response.data);
      } catch (err) {
        setError('Error al cargar las publicaciones.');
      }
    };

    fetchPosts();

    // Configurar la conexión WebSocket para recibir actualizaciones en tiempo real
    socket.on('connect', () => {
      console.log('Conectado al FeedChannel.');
    });

    socket.on('received', (data) => {
      if (filter.type && filter.value) {
        // Aplicar filtro a las publicaciones en tiempo real
        if (data.post[filter.type] === filter.value) {
          setPosts((prevPosts) => [data.post, ...prevPosts]);
        }
      } else {
        setPosts((prevPosts) => [data.post, ...prevPosts]);
      }
    });

    // Limpiar la conexión WebSocket al desmontar el componente
    return () => {
      socket.off('received');
      socket.disconnect();
    };
  }, [authToken, filter]);

  const handleFilterChange = (type, value) => {
    if (value === '') {
      setFilter({ type: null, value: null });
    } else {
      setFilter({ type, value });
    }
  };

  return (
    <View style={styles.container}>
      <BackButton/>
      <Text style={styles.title}>Feed: Actividad en tiempo real</Text>

      {/* Filtro de publicaciones */}
      <Input
        placeholder="Filtrar por tipo (friend, bar, country, beer)"
        onChangeText={(value) => handleFilterChange('type', value)}
        containerStyle={styles.input}
      />
      <Input
        placeholder="Especifica el valor para filtrar"
        onChangeText={(value) => handleFilterChange(filter.type, value)}
        containerStyle={styles.input}
      />

      {/* Publicaciones */}
      <FlatList
        data={posts}
        keyExtractor={(post) => post.id.toString()}
        renderItem={({ item: post }) => (
          <Card containerStyle={styles.card}>
            <Card.Title>{post.author.nickname} publicó:</Card.Title>
            <Card.Divider />
            <Text>{post.content}</Text>
            {post.image && (
              <Image
                source={{ uri: post.image }}
                style={styles.image}
                resizeMode="cover"
              />
            )}
            <Button
              title="Ver más"
              onPress={() => (window.location.href = `/event/${post.event_id}`)}
              icon={<Icon name="arrow-right" type="font-awesome" color="white" />}
              buttonStyle={styles.button}
            />
          </Card>
        )}
      />

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    marginBottom: 10,
  },
  card: {
    marginBottom: 10,
    borderRadius: 10,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    borderRadius: 10,
  },
  button: {
    backgroundColor: '#2089dc',
    borderRadius: 10,
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});

export default Feed;
