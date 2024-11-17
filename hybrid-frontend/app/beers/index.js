import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Input, Icon, Card } from '@rneui/themed';
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

  // Fetch all beers once on component mount
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
        setFilteredBeers([]); // Clear filtered beers
        return;
      }

      setBeers(data.beers);
      setFilteredBeers(data.beers); // Initialize filtered beers with all beers
    } catch (error) {
      console.error('Error fetching beers:', error);
      setBeers([]);
      setFilteredBeers([]); // Clear filtered beers on error
    }
    setLoading(false);
  };

  useEffect(() => {
    const results = beers.filter(beer =>
      beer.name.toLowerCase().includes(searchQuery.toLowerCase()) // Filter by beer name
    );
    setFilteredBeers(results);
  }, [searchQuery, beers]); // Filter whenever searchQuery or beers change

  return (
      
      <View style={styles.container}>
        <BackButton />
        <Input
          placeholder="Search for a beer"
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.input}
          leftIcon={<Icon name="search" color="#6F4E37" />}
          placeholderTextColor="#6F4E37"
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
                    color="#808080"
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
  inputContainer: {
    marginBottom: 5,
    marginTop: 40,
  },
  input: {
    backgroundColor: '#A67B5B',
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  cardContent: {
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Alineación del ícono a la derecha
    marginTop: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
  },
});

export default BeerSearchScreen;
