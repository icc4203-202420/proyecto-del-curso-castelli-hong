import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { NGROK_URL } from '@env';
import { Tab, TabView } from '@rneui/themed';
import FriendsTab from '../components/FriendsTab';
import FriendRequestsTab from '../components/FriendRequestsTab';
import BackButton from '../components/BackButton';

const UserProfileScreen = () => {
  const { id: userId } = useLocalSearchParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${NGROK_URL}/api/v1/users/${userId}`);
        if (response.status === 200) {
          setUser(response.data);
        } else {
          console.error('Failed to fetch user data:', response.data);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    } else {
      console.error('No user ID found');
      setLoading(false);
    }
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A67B5B" />
        <Text style={styles.loadingText}>Loading user profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#A67B5B" />
      <BackButton />
      {user ? (
        <>
          <Text style={styles.title}>{user.handle}</Text>
          <Text style={styles.subtitle}>
            {user.first_name} {user.last_name}
          </Text>

          <Tab
            value={index}
            onChange={setIndex}
            indicatorStyle={styles.indicator}
            containerStyle={styles.tabContainer}
            variant="default"
          >
            <Tab.Item
              title="Friends"
              titleStyle={index === 0 ? styles.activeTabTitle : styles.inactiveTabTitle}
            />
            <Tab.Item
              title="Friend Requests"
              titleStyle={index === 1 ? styles.activeTabTitle : styles.inactiveTabTitle}
            />
          </Tab>

          <TabView value={index} onChange={setIndex} animationType="spring" style={styles.tabView}>
            <TabView.Item style={styles.tabViewContent}>
              <FriendsTab userId={userId} />
            </TabView.Item>
            <TabView.Item style={styles.tabViewContent}>
              <FriendRequestsTab userId={userId} />
            </TabView.Item>
          </TabView>
        </>
      ) : (
        <Text style={styles.noUserText}>No user information found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgb(250, 247, 240)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(250, 247, 240)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#555',
    marginBottom: 20,
  },
  tabContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 5,
    elevation: 1,
  },
  indicator: {
    backgroundColor: '#A67B5B',
    height: 3,
  },
  activeTabTitle: {
    color: '#A67B5B',
    fontWeight: 'bold',
  },
  inactiveTabTitle: {
    color: '#6c757d',
  },
  tabView: {
    flex: 1,
    marginTop: 10,
  },
  tabViewContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
  },
  noUserText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default UserProfileScreen;