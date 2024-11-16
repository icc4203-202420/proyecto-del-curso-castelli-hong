// src/components/Feed.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet } from 'react-native';
import { Button, Card, Icon, Input, ButtonGroup } from '@rneui/themed';
import axios from 'axios';
import * as ActionCable from '@rails/actioncable';

const Feed = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState({ type: null, value: null });
  const [error, setError] = useState('');
  const cableConnection = ActionCable.createConsumer("ws://localhost:3001/cable");

  useEffect(() => {
    // Cargar publicaciones iniciales del feed
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`/v1/feed`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setPosts(response.data);
      } catch (err) {
        setError('Error al cargar las publicaciones.');
      }
    };
    fetchPosts();

    // Configurar la conexión WebSocket para recibir actualizaciones en tiempo real
    const subscription = cableConnection.subscriptions.create(
      { channel: 'FeedChannel', user_id: user.id },
      {
        connected() {
          console.log('Conectado al FeedChannel.');
        },
        received(data) {
          if (filter.type && filter.value) {
            // Aplicar filtro a las publicaciones en tiempo real
            if (data.post[filter.type] === filter.value) {
              setPosts((prevPosts) => [data.post, ...prevPosts]);
            }
          } else {
            setPosts((prevPosts) => [data.post, ...prevPosts]);
          }
        },
        rejected() {
          setError('No se pudo autenticar la conexión.');
        },
      }
    );

    // Limpiar la conexión WebSocket al desmontar el componente
    return () => {
      subscription.unsubscribe();
    };
  }, [filter, user.id, user.token]);

  const handleFilterChange = (type, value) => {
    if (value === '') {
      setFilter({ type: null, value: null });
    } else {
      setFilter({ type, value });
    }
  };

  return (
    <View style={styles.container}>
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
