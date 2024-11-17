import * as SecureStore from 'expo-secure-store';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity, FlatList, TextInput, RefreshControl } from 'react-native';
import { Icon } from '@rneui/themed';
import { NGROK_URL } from '@env';
import BackButton from '../components/BackButton';
import FeedItem from './FeedItem';
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
      console.log("FEED/INDEX TOKEN: ", token)
      if (token && userId) {
        const response = await fetch(`${NGROK_URL}/api/v1/feed?user_id=${userId}`, {
          method: 'GET',
          headers: { Authorization: `${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setFeed(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        } else {
          const errorData = await response.json();
          console.error('Error fetching feed:', errorData);
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
    const initializeFeedAndSocket = async () => {
      await fetchFeed();  
      const userId = await SecureStore.getItemAsync('USER_ID'); // Get user_id outside WebSocket initialization
      const socket = new WebSocket(`${NGROK_URL.replace('http', 'ws')}/cable`);
      socket.onopen = () => {
        console.log('WEBSOCKET CONNECTED !');
        socket.send(
          JSON.stringify({
            command: 'subscribe',
            identifier: JSON.stringify({
              channel: 'FeedChannel',
              user_id: userId, 
            }),
          })
        );
      };

      socket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.message && data.message.type === 'new_feed_item') {
          fetchFeed();
        }
      };
      socket.onerror = (e) => {
        console.error('WebSocket error:', e);
      };
      socket.onclose = (e) => {
        console.log('WebSocket closed:', e);
      };
      return () => {
        socket.close();
      };
    };
  
    initializeFeedAndSocket(); 
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackButton />
      <View style={styles.header}>
        {/* Botón de filtrar */}
        <TouchableOpacity onPress={() => toggleFilter()} style={styles.filterButton}>
          <Icon name="filter-list" type="material" color="#FFF" size={20} />
          <Text style={styles.filterButtonText}>Filtrar</Text>
        </TouchableOpacity>
  
        {/* Indicador del filtro activo */}
        <View style={styles.filterIndicator}>
          <Text style={styles.filterIndicatorText}>
            {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
          </Text>
        </View>
      </View>
  
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar en el feed..."
        placeholderTextColor="#9CA3AF"
        value={searchText}
        onChangeText={(text) => setSearchText(text)}
      />
  
      <FlatList
        data={filteredFeed}
        renderItem={({ item }) => <FeedItem item={item} />}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#B17457',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B17457',
    paddingVertical: 8,
    paddingHorizontal: 19,
    borderRadius: 20,
    marginLeft: 15,
  },
  filterButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 5,
  },
  filterIndicator: {
    backgroundColor: '#FFF5E5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#B17457',
  },
  filterIndicatorText: {
    color: '#B17457',
    fontWeight: 'bold',
    fontSize: 14,
  },
  searchInput: {
    backgroundColor: '#F8F8F8',  // Lighter background for better contrast
    color: '#333',  // Darker text for better readability
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,  // More rounded edges for a modern look
    margin: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',  // Lighter border for a more subtle effect
    elevation: 2,  // Adds a subtle shadow for depth on Android
    shadowColor: '#000',  // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },  // Shadow position
    shadowOpacity: 0.1,  // Light shadow
    shadowRadius: 6,  // Soft shadow spread
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
});


export default Feed;