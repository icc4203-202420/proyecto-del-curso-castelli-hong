import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, ActivityIndicator, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Icon, Card } from '@rneui/themed';
import { useRouter } from 'expo-router';
import { NGROK_URL } from '@env';
import * as SecureStore from 'expo-secure-store';
import BackButton from '../components/BackButton';

const BeerSearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [beers, setBeers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredBeers, setFilteredBeers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchBeers();
  }, []);

  const fetchBeers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${NGROK_URL}/api/v1/beers`);
      if (!response.ok) {
        throw new Error('Error fetching beers. Status: ' + response.status);
      }

      const data = await response.json();
      if (!data.beers || !Array.isArray(data.beers)) {
        setBeers([]);
        setFilteredBeers([]);
        return;
      }

      setBeers(data.beers);
      setFilteredBeers(data.beers);
    } catch (error) {
      console.error('Error fetching beers:', error);
      setBeers([]);
      setFilteredBeers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    const results = beers.filter(beer =>
      beer.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredBeers(results);
  }, [searchQuery, beers]);

  return (
    <View style={styles.container}>
      <BackButton />
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar..."
        placeholderTextColor="#9CA3AF"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {loading && <ActivityIndicator size="small" color="#000" />}
      <FlatList
        data={filteredBeers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/beers/${item.id}`)}>
            <Card containerStyle={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>{item.style}</Text>
              </View>
              <View style={styles.cardFooter}>
                <Icon
                  name="right"
                  type="antdesign"
                  color="#674636"
                  size={20}
                />
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading && <Text style={styles.emptyText}>No beers found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  searchInput: {
    backgroundColor: '#F8F8F8', 
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    margin: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  card: {
    backgroundColor: '#F0EDE0',
    borderRadius: 10, 
    padding: 15, 
    marginVertical: 8,
    borderWidth: 0, 
    elevation: 0, // Sin sombra en Android
    shadowColor: 'transparent', // Sin sombra en iOS
  },
  
  cardContent: {
    paddingBottom: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "#674636"
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#674636',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
  },
});

export default BeerSearchScreen;
