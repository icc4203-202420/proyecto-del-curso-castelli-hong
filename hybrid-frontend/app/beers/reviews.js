import React, { useEffect, useReducer } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { NGROK_URL } from '@env';
import { FontAwesome } from '@expo/vector-icons';
import { Rating } from 'react-native-ratings';

const initialState = {
  loading: true,
  error: '',
  reviews: [],
  averageRating: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true };
    case 'SUCCESS':
      return {
        ...state,
        loading: false,
        reviews: action.payload.reviews,
        averageRating: action.payload.averageRating,
      };
    case 'ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

const Reviews = ({ beerId, beer }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const fetchReviews = async () => {
      dispatch({ type: 'LOADING' });
      try {
        const token = await SecureStore.getItemAsync('authToken');
        const response = await axios.get(`${NGROK_URL}/api/v1/beers/${beerId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        dispatch({ type: 'SUCCESS', payload: { reviews: response.data.reviews || [], averageRating: response.data.averageRating } });
      } catch (error) {
        dispatch({ type: 'ERROR', payload: error.message });
      }
    };
    fetchReviews();
  }, [beerId]);

  // const formatDate = (dateString) => {
  //   const options = { year: 'numeric', month: 'long', day: 'numeric' };
  //   return new Date(dateString).toLocaleDateString(undefined, options);
  // };
  const formatDate = (dateString) => {
    if (!dateString) return 'No date available';
    const date = new Date(dateString);
    if (isNaN(date)) {
      return 'Invalid Date';
    }
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };
  

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.averageRating}>Average Rating: {parseFloat(beer.avg_rating).toFixed(2) || 'N/A'}</Text>
      {state.error && <Text style={styles.error}>{state.error}</Text>}
    </View>
  );

  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewContainer}>
      <View style={styles.userInfo}>
        <FontAwesome name="user" size={24} color="black" />
        <Text style={styles.userHandle}>{item.user.handle}</Text>
        <View style={styles.ratingContainer}>
          <Rating
            startingValue={item.rating}
            readonly
            imageSize={20}
            style={styles.rating}
          />
          <Text style={styles.reviewRating}>{item.rating}</Text>
        </View>
      </View>
      <Text style={styles.reviewText}>{item.text}</Text>
      {/* Display the review date */}
      <Text style={styles.reviewDate}>{formatDate(item.created_at)}</Text>
    </View>
  );
  

  if (state.loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <FlatList
      data={state.reviews}
      keyExtractor={(item) => (item.id ? item.id.toString() : Math.random().toString())}
      renderItem={renderReviewItem}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={<Text style={styles.noReviews}>No hay evaluaciones.</Text>}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  headerContainer: {
    marginBottom: 10,
  },
  averageRating: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewContainer: {
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  userHandle: {
    fontSize: 16,
    color: 'black',
    marginLeft: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  reviewRating: {
    fontSize: 14,
    color: 'gray',
    marginLeft: 5,
  },
  reviewText: {
    fontSize: 16,
    color: 'gray',
  },
  noReviews: {
    textAlign: 'center',
    color: 'gray',
    marginTop: 20,
    fontSize: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
});

export default Reviews;
