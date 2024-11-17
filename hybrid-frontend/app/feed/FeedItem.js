import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from '@rneui/themed';
import { useRouter } from 'expo-router';

const FeedItem = ({ item }) => {
  const router = useRouter();
  const formattedDate = new Date(item.created_at).toLocaleString();

  return (
    <View style={styles.post}>
      {item.type === 'event_picture' && (
        <TouchableOpacity onPress={() => router.push(`/events/${item.event_id}`)}>
          <Text style={styles.title}>{item.event_name || 'Unnamed Event'}</Text>
          <View style={styles.userInfo}>
            <Icon name="user" type="feather" size={16} color="#B17457" />
            <Text style={styles.userName}>{item.user_handle}</Text>
          </View>
          {item.image_url && <Image source={{ uri: item.image_url }} style={styles.image} />}
          <Text style={styles.description}>{item.description}</Text>
          <View style={styles.dateContainer}>
            <Icon name="calendar" type="feather" size={16} color="#B17457" />
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
        </TouchableOpacity>
      )}

      {item.type === 'beer_review' && (
        <TouchableOpacity onPress={() => router.push(`/beers/${item.beer_id}`)}>
          <Text style={styles.title}>{item.beer_name || 'Unnamed Beer'}</Text>
          <View style={styles.userInfo}>
            <Icon name="user" type="feather" size={16} color="#B17457" />
            <Text style={styles.userName}>{item.user_name}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Icon name="star" type="feather" size={16} color="#FFA500" />
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
          <Text style={styles.description}>{item.review_text}</Text>
          <View style={styles.dateContainer}>
            <Icon name="clock" type="feather" size={16} color="#B17457" />
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  post: {
    backgroundColor: '#F0EDE0',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0EDE0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B17457',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    color: '#B17457',
    marginLeft: 4,
    fontSize: 14,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  description: {
    color: '#B17457',
    marginBottom: 8,
    fontSize: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    color: '#B17457',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    color: '#B17457',
    marginLeft: 4,
    fontSize: 12,
  },
});

export default FeedItem;

// import React from 'react';
// import { View, Text, Image } from 'react-native';

// const FeedItem = ({ post }) => {
//   if (post.type === "event_picture") {
//     // Publicación de imagen de evento
//     return (
//       <View style={{ padding: 10 }}>
//         <Text>📸 {post.event_picture.user_handle} uploaded a new event picture!</Text>
//         <Image source={{ uri: post.event_picture.image_url }} style={{ width: 100, height: 100 }} />
//         <Text>Description: {post.event_picture.description}</Text>
//         {post.tagged_users && (
//           <Text>Tagged Users: {post.tagged_users.map(user => user.handle).join(", ")}</Text>
//         )}
//       </View>
//     );
//   } else if (post.type === "user_tagged") {
//     // Notificación de usuario etiquetado en una imagen
//     return (
//       <View style={{ padding: 10 }}>
//         <Text>👤 {post.tagged_user.handle} was tagged in a photo by {post.event_picture.user_handle}</Text>
//         <Image source={{ uri: post.event_picture.image_url }} style={{ width: 100, height: 100 }} />
//       </View>
//     );
//   }

//   // Otros tipos de publicaciones
//   return (
//     <View style={{ padding: 10 }}>
//       <Text>{post.message}</Text>
//     </View>
//   );
// };

// export default FeedItem;
