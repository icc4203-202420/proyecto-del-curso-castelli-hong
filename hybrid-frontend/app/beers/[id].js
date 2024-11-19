import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Button } from '@rneui/themed';
import { Card } from '@rneui/themed';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ReviewForm from './reviewForm';
import Reviews from './reviews';
import { NGROK_URL } from '@env';
import BackButton from '../components/BackButton';

const BeerDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const [beer, setBeer] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchBeerDetails();
    }
  }, [id]);

  const fetchBeerDetails = async () => {
    try {
      const response = await fetch(`${NGROK_URL}/api/v1/beers/${id}`);

      if (!response.ok) {
        throw new Error('Error fetching beer details. Status: ' + response.status);
      }
      const data = await response.json();
      setBeer(data.beer);
    } catch (error) {
      console.error('Error fetching beer details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (review) => {
    console.log('Enviando evaluación:', review);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4B3C31" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!beer) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Beer not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <BackButton />

      <Text style={styles.title}>{beer.name || 'No name available'}</Text>
      <Text style={styles.subtitle}>Brewery: {beer.brewery_name || 'N/A'}</Text>
      <View style={styles.availableAtContainer}>
        <Text style={styles.subtitle}>Available at: </Text>
        {beer.bar_names && beer.bar_names.length > 0 ? (
          beer.bar_names.map((bar, index) => (
            <Text key={index} style={styles.barName}>{bar}</Text>
          ))
        ) : (
          <Text style={styles.noBarsText}>No bars available for this beer.</Text>
        )}
      </View>
      <Card containerStyle={styles.card}>
        <Text style={styles.cardTitle}>Beer Details</Text>
        <Text style={styles.detail}>Style: {beer.style || 'N/A'}</Text>
        <Text style={styles.detail}>Alcohol: {beer.alcohol || 'N/A'}</Text>
        <Text style={styles.detail}>IBU: {beer.ibu || 'N/A'}</Text>
        <Text style={styles.detail}>BLG: {beer.blg || 'N/A'}</Text>
        <Text style={styles.detail}>Yeast: {beer.yeast || 'N/A'}</Text>
        <Text style={styles.detail}>Hop: {beer.hop || 'N/A'}</Text>
        <Text style={styles.detail}>Malts: {beer.malts || 'N/A'}</Text>
      </Card>


      <Card containerStyle={styles.card}>
        <Text style={styles.cardTitle}>Rating</Text>
        <ReviewForm beerId={id} onSubmit={handleReviewSubmit} />
        <Reviews beerId={id} beer={beer} />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F3E7',
  },
  loadingText: {
    color: '#4B3C31',
    fontSize: 18,
    marginTop: 10,
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F3E7',
  },
  errorText: {
    color: '#D9534F',
    fontSize: 18,
  },
  title: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#4B3C31',
    marginTop: 15,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B3C31',
    // marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '100%',
    alignSelf: 'center',
    // shadowColor: '#674636',
    // shadowOffset: { width: 2, height: 2 },
    // shadowOpacity: 0.2,
    // shadowRadius: 5,
    borderWidth: 0, // Sin borde
    elevation: 0, // Sin sombra en Android
    shadowColor: 'transparent', // Sin sombra en iOS
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#B17457',
    marginBottom: 10,
  },
  detail: {
    fontSize: 15,
    color: '#B17457',
    marginBottom: 6,
  },
  barsContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  barsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#B17457',
    marginBottom: 10,
  },
  barName: {
    fontSize: 15,
    color: '#4B3C31',
    marginBottom: 5,
  },
  noBarsText: {
    fontSize: 15,
    color: '#D9534F',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#9C7B4E',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
});

export default BeerDetailsScreen;
