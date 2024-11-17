// app/_layout.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Slot } from 'expo-router';
import BackButton from './components/BackButton';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, setNotificationHandler } from '../util/Notifications';
import NotificationListener from '../util/NotificationListener';

// Estilos globales
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF7F0",
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 24,
    fontWeight: "bold",
    color: "rgb(74, 73, 71)",
  },
  inputText: {
    color: "rgb(74, 73, 71)",
  },
  inputContainer: {
    borderBottomColor: "rgb(177, 116, 87)",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  buttonPrimary: {
    backgroundColor: "rgb(177, 116, 87)",
    marginTop: 20,
  },
  buttonSecondary: {
    borderColor: "rgb(177, 116, 87)",
    marginTop: 10,
  },
  buttonTitlePrimary: {
    color: "rgb(250, 247, 240)",
  },
  buttonTitleSecondary: {
    color: "#B17457",
  },
  backButton: {
    // Agrega los estilos para el botón de regreso si es necesario
  }
});

const Tab = createBottomTabNavigator();

const Layout = ({ children }) => {
  const notificationListener = useRef(null);
  const responseListener = useRef(null);

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
      }
    );

    // Cleanup function to remove listeners when the component is unmounted
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    // Registra el dispositivo para recibir notificaciones push y obtiene el token
    registerForPushNotificationsAsync().then((token) => {
      console.log('Push Notification Token:', token);
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <NotificationListener />
      <StatusBar barStyle="light-content" backgroundColor="#A67B5B" />
      <Text style={styles.title}></Text>
      {children} 
      <Slot />
    </SafeAreaView>
  );
};

export default Layout;
