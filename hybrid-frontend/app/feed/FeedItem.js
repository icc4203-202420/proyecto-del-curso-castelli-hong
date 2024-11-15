// src/components/FeedItem.js
import React from 'react';
import { View, Text, Image } from 'react-native';

const FeedItem = ({ post }) => {
  if (post.type === "event_picture") {
    // Publicación de imagen de evento
    return (
      <View style={{ padding: 10 }}>
        <Text>📸 {post.event_picture.user_handle} uploaded a new event picture!</Text>
        <Image source={{ uri: post.event_picture.image_url }} style={{ width: 100, height: 100 }} />
        <Text>Description: {post.event_picture.description}</Text>
        {post.tagged_users && (
          <Text>Tagged Users: {post.tagged_users.map(user => user.handle).join(", ")}</Text>
        )}
      </View>
    );
  } else if (post.type === "user_tagged") {
    // Notificación de usuario etiquetado en una imagen
    return (
      <View style={{ padding: 10 }}>
        <Text>👤 {post.tagged_user.handle} was tagged in a photo by {post.event_picture.user_handle}</Text>
        <Image source={{ uri: post.event_picture.image_url }} style={{ width: 100, height: 100 }} />
      </View>
    );
  }

  // Otros tipos de publicaciones
  return (
    <View style={{ padding: 10 }}>
      <Text>{post.message}</Text>
    </View>
  );
};

export default FeedItem;
