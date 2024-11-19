import React, { useEffect, useReducer } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { NGROK_URL } from '@env';
import { Rating } from '@kolking/react-native-rating';

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
        {/* Avatar with initial */}
        <View style={[styles.avatar]}>
          <Text style={styles.avatarText}>
            {item.user.handle ? item.user.handle[0].toUpperCase() : '?'}
          </Text>
        </View>
        <Text style={styles.userHandle}>{item.user.handle}</Text>
        <View style={styles.ratingContainer}>
          <Rating
            type="star"
            rating={item.rating}
            readonly
            size={15}
            disabled="true"
            fillColor="#FF9500"
            baseColor="#D1D1D6"
          />
          <Text style={styles.reviewRating}>{item.rating}</Text>
        </View>
      </View>
      <Text style={styles.reviewText}>{item.text}</Text>
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
      nestedScrollEnabled
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
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: "#5F6F52",
  },
  avatarText: {
    color: 'white',
    fontSize: 14,
    // fontWeight: 'bold',
  },
  userHandle: {
    fontSize: 16,
    color: '#B17457',
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
    fontSize: 14,
    color: 'gray',
  },
  noReviews: {
    textAlign: 'center',
    color: 'gray',
    marginTop: 20,
    fontSize: 16,
  },
  reviewDate: {
    color: '#B2AFA8',
    marginTop: 15,
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
});

export default Reviews;
