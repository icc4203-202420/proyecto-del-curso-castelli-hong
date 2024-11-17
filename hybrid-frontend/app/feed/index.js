import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { Button, Card, Icon, Input } from '@rneui/themed';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store'; // Para manejar authToken
import io from 'socket.io-client'; // Usar socket.io
import { useNavigation } from '@react-navigation/native'; // Para manejar navegación
import { NGROK_URL } from '@env'; // Importa NGROK_URL desde el archivo .env

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState({ type: null, value: null });
  const [error, setError] = useState('');
  const [authToken, setAuthToken] = useState(null);

  // Configuración de WebSocket con la URL de ngrok
  const socket = io(`${NGROK_URL}/cable`, {
    transports: ['websocket'], // Usar solo WebSocket
    path: '/cable', // Coincide con la ruta de ActionCable en Rails
  });

  const navigation = useNavigation(); // Hook para manejar navegación

  useEffect(() => {
    // Obtener authToken desde SecureStore
    const fetchAuthToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('authToken');
        if (!token) {
          throw new Error('No se encontró authToken.');
        }
        console.log('AuthToken obtenido:', token);
        setAuthToken(token);
      } catch (err) {
        console.error('Error al obtener el token de autenticación:', err.message);
        setError('Error al obtener el token de autenticación.');
      }
    };

    fetchAuthToken();
  }, []);

  useEffect(() => {
    if (!authToken) return;

    // Configurar Axios con la URL base de ngrok
    const api = axios.create({
      baseURL: `${NGROK_URL}/v1`,
      timeout: 5000,
      headers: { Authorization: `Bearer ${authToken}` },
    });

    // Cargar publicaciones iniciales del feed
    const fetchPosts = async () => {
      try {
        console.log('Solicitando publicaciones desde:', `${NGROK_URL}/v1/feed`);
        const response = await api.get(`/feed`);
        console.log('Publicaciones iniciales cargadas:', response.data);
        setPosts(response.data);
      } catch (err) {
        console.error('Error al cargar las publicaciones:', err.message, err.response);
        setError('Error al cargar las publicaciones.');
      }
    };

    fetchPosts();

    // Configurar la conexión WebSocket para recibir actualizaciones en tiempo real
    socket.on('connect', () => {
      console.log('Conexión WebSocket establecida. ID del socket:', socket.id);
    });

    socket.on('received', (data) => {
      console.log('Datos recibidos a través de WebSocket:', data);

      if (filter.type && filter.value) {
        // Aplicar filtro a las publicaciones en tiempo real
        if (data.post[filter.type] === filter.value) {
          console.log('Publicación filtrada y agregada:', data.post);
          setPosts((prevPosts) => [data.post, ...prevPosts]);
        }
      } else {
        console.log('Publicación agregada:', data.post);
        setPosts((prevPosts) => [data.post, ...prevPosts]);
      }
    });

    socket.on('disconnect', () => {
      console.log('WebSocket desconectado.');
    });

    socket.on('error', (err) => {
      console.error('Error en la conexión WebSocket:', err.message);
    });

    // Limpiar la conexión WebSocket al desmontar el componente
    return () => {
      console.log('Desconectando WebSocket...');
      socket.off('received');
      socket.disconnect();
    };
  }, [authToken, filter]);

  const handleFilterChange = (type, value) => {
    if (value === '') {
      console.log('Filtro eliminado.');
      setFilter({ type: null, value: null });
    } else {
      console.log('Filtro actualizado:', { type, value });
      setFilter({ type, value });
    }
  };

  return (
    <View style={styles.container}>
      {/* Botón de "Atrás" */}
      <Button
        title="Atrás"
        onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('Home'); // Redirige a la pantalla principal si no hay pantalla previa
          }
        }}
        icon={<Icon name="arrow-left" type="font-awesome" color="white" />}
        buttonStyle={styles.backButton}
      />

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
              onPress={() => navigation.navigate('EventDetails', { id: post.event_id })}
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
  backButton: {
    backgroundColor: '#ff6347',
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});

export default Feed;
