import React, { useEffect, useRef, useState } from 'react';
import { View, FlatList, Button } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import FeedItem from './FeedItem';
import createCable, { subscribeToFeed } from '../services/WebSocket';
import * as SecureStore from 'expo-secure-store';


const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [authToken, setAuthToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const cableRef = useRef(null);
  const subscriptionRef = useRef(null);
  const router = useRouter();

  // Obtener authToken y userId al montar el componente
  useEffect(() => {
    const getTokenAndUserId = async () => {
      try {
        const storedAuthToken = await SecureStore.getItemAsync('authToken');
        const storedUserId = await SecureStore.getItemAsync('USER_ID');
        setAuthToken(storedAuthToken);
        setUserId(storedUserId);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    getTokenAndUserId();
  }, []);

  // Configuración del WebSocket y manejo de publicaciones en tiempo real
  useFocusEffect(
    React.useCallback(() => {
      if (authToken && !cableRef.current) {
        cableRef.current = createCable(authToken);
        subscriptionRef.current = subscribeToFeed(cableRef.current, (data) => {
          if (data.action === "new_event_picture") {
            setPosts((prevPosts) => [
              {
                type: "event_picture",
                ...data.event_picture,
                tagged_users: data.tagged_users
              },
              ...prevPosts
            ]);
          } else if (data.action === "user_tagged") {
            setPosts((prevPosts) => [
              {
                type: "user_tagged",
                event_picture: data.event_picture,
                tagged_user: data.tagged_user
              },
              ...prevPosts
            ]);
          }
        });
      }

      return () => {
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        }
        if (cableRef.current) {
          cableRef.current.close();
          cableRef.current = null;
        }
      };
    }, [authToken])
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Botón de regreso */}
      <Button title="Back" onPress={() => router.back()} />

      {/* Lista de publicaciones */}
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <FeedItem post={item} />
        )}
        keyExtractor={(item) => item.id.toString()}
        inverted // Muestra las publicaciones más recientes en la parte superior
      />
    </View>
  );
};

export default Feed;
