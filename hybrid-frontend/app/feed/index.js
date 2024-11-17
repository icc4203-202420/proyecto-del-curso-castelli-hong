import * as SecureStore from 'expo-secure-store';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity, FlatList, TextInput, RefreshControl } from 'react-native';
import { Icon } from '@rneui/themed';
import { NGROK_URL } from '@env';

const Feed = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchText, setSearchText] = useState('');

  const fetchFeed = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const userId = await SecureStore.getItemAsync('USER_ID');
      if (token && userId) {
        const response = await fetch(`${NGROK_URL}/api/v1/feed?user_id=${userId}`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setFeed(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        } else {
          console.error('Error fetching feed');
        }
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchFeed();
  }, []);

  const toggleFilter = () => {
    const filters = ['all', 'friendship', 'bar', 'beer'];
    const currentIndex = filters.indexOf(activeFilter);
    const nextFilter = filters[(currentIndex + 1) % filters.length];
    setActiveFilter(nextFilter);
  };

  const filteredFeed = feed.filter(item => {
    const matchesType =
      activeFilter === 'all' ||
      (activeFilter === 'friendship' && true) ||
      (activeFilter === 'bar' && item.bar_name?.toLowerCase().includes(searchText.toLowerCase())) ||
      (activeFilter === 'beer' && item.type === 'beer_review');
      
    const matchesSearchText =
      item.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.event_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.beer_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.user_name?.toLowerCase().includes(searchText.toLowerCase());

    return matchesType && matchesSearchText;
  });

  const renderFeedItem = ({ item }) => {
    const formattedDate = new Date(item.created_at).toLocaleString();

    return (
      <View style={styles.post}>
        {item.type === 'event_picture' && (
          <TouchableOpacity onPress={() => router.push(`/events/${item.event_id}`)}>
            <Text style={styles.title}>{item.event_name || 'Unnamed Event'}</Text>
            <View style={styles.userInfo}>
              <Icon name="user" type="feather" size={16} color="#9CA3AF" />
              <Text style={styles.userName}>{item.user_handle}</Text>
            </View>
            {item.image_url && <Image source={{ uri: item.image_url }} style={styles.image} />}
            <Text style={styles.description}>{item.description}</Text>
            <View style={styles.dateContainer}>
              <Icon name="calendar" type="feather" size={16} color="#9CA3AF" />
              <Text style={styles.date}>{formattedDate}</Text>
            </View>
          </TouchableOpacity>
        )}

        {item.type === 'beer_review' && (
          <TouchableOpacity onPress={() => router.push(`/beers/${item.beer_id}`)}>
            <Text style={styles.title}>{item.beer_name || 'Unnamed Beer'}</Text>
            <View style={styles.userInfo}>
              <Icon name="user" type="feather" size={16} color="#9CA3AF" />
              <Text style={styles.userName}>{item.user_name}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Icon name="star" type="feather" size={16} color="#FFA500" />
              <Text style={styles.rating}>{item.rating}</Text>
            </View>
            <Text style={styles.description}>{item.review_text}</Text>
            <View style={styles.dateContainer}>
              <Icon name="clock" type="feather" size={16} color="#9CA3AF" />
              <Text style={styles.date}>{formattedDate}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
          <Icon name="arrow-left" type="feather" size={24} color="#B17457" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Feed</Text>
        <TouchableOpacity onPress={() => toggleFilter()} style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Filtrar</Text>
        </TouchableOpacity>
        <Text style={styles.filterIndicator}>
          Filtro activo: {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
        </Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar en el feed..."
        placeholderTextColor="#9CA3AF"
        value={searchText}
        onChangeText={text => setSearchText(text)}
      />

      <FlatList
        data={filteredFeed}
        renderItem={renderFeedItem}
        keyExtractor={(item, index) => item.id || index.toString()}
        contentContainerStyle={styles.feedContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFA500" />
        }
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(250, 247, 240)',
  },
  header: {
    backgroundColor: 'rgb(250, 247, 240)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#B17457',
  },
  filterButton: {
    backgroundColor: '#B17457',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  filterButtonText: {
    color: 'rgb(250, 247, 240)',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  filterIndicator: {
    color: '#B17457',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#B17457',
    textAlign: 'center',
  },
  searchInput: {
    backgroundColor: 'rgb(250, 247, 240)',
    color: '#B17457',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    margin: 16,
    borderWidth: 1,
    borderColor: '#B17457',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(250, 247, 240)',
  },
  feedContainer: {
    padding: 16,
  },
  post: {
    backgroundColor: 'rgb(250, 247, 240)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#B17457',
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


export default Feed;