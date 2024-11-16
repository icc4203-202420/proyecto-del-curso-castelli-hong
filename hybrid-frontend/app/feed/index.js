import React, { useEffect, useRef, useState } from 'react';
import { View, FlatList, Button } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { NGROK_URL } from '@env';
import * as SecureStore from 'expo-secure-store';

// Función para crear y conectar el WebSocket
const createCable = (authToken) => {
  if (!authToken) {
    console.error("Auth token is missing");
    return;
  }

  const ws = new WebSocket(`ws://${NGROK_URL}/cable?token=${authToken}`);

  ws.onopen = () => {
    console.log("Connected to WebSocket");
  };

  ws.onclose = () => {
    console.log("Disconnected from WebSocket");
  };

  ws.onerror = (error) => {
    console.error("WebSocket Error:", error);
  };

  return ws;
};

// Función para suscribirse al canal Feed
const subscribeToFeed = (ws, onReceived) => {
  const message = {
    command: 'subscribe',
    identifier: JSON.stringify({ channel: 'FeedChannel' }),
  };

  ws.onopen = () => {
    ws.send(JSON.stringify(message));
  };

  ws.onmessage = (event) => {
    const response = JSON.parse(event.data);

    // Ignora los mensajes de ping o cualquier otro mensaje no relevante
    if (response.type === "ping" || !response.message) return;

    // Pasa los datos recibidos al callback
    onReceived(response.message);
  };

  return {
    unsubscribe: () => {
      const unsubscribeMessage = {
        command: 'unsubscribe',
        identifier: JSON.stringify({ channel: 'FeedChannel' }),
      };
      ws.send(JSON.stringify(unsubscribeMessage));
      ws.close();
    },
  };
};

// Componente principal de Feed
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
          <View>
            <Text>{item.type === "event_picture" ? "New Event Picture" : "User Tagged"}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        inverted // Muestra las publicaciones más recientes en la parte superior
      />
    </View>
  );
};

export default Feed;
