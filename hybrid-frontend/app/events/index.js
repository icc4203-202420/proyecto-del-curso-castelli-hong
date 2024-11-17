import React, { useState, useEffect } from 'react';
import { View, StatusBar, FlatList, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import axios from 'axios';
import { NGROK_URL } from '@env';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const EventIndex = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${NGROK_URL}/api/v1/events`);
      setEvents(response.data.events);
    } catch (error) {
      console.error('Error fetching events:', error);

    } finally {
      setLoading(false);
    }
  };

  return (
      <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#A67B5B" />
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
        {loading ? (
          <Text style={styles.loadingText}>Loading events...</Text>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => router.push(`/events/${item.id}`)}>
                <View style={styles.eventCard}>
                  <Text style={styles.eventTitle}>{item.name}</Text>
                  <Text style={styles.date}>
                    {new Date(item.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                  <Text style={styles.eventDescription}>{item.description}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No events found.</Text>}
          />
        )}
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: 10,
    marginBottom: 10,
    marginRight: 10,
  },
  eventCard: {
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#D5C0AB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: "#70492C",
  },
  date: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  hostedBy: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  eventDescription: {
    fontSize: 14,
    color: '#333',
    marginTop: 10,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
  },
});

export default EventIndex;
