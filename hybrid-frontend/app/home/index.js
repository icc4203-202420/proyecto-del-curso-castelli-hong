import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button } from '@rneui/themed';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { NGROK_URL } from '@env';

const HomeScreen = () => {
  const router = useRouter();
  const [userId, setUserId] = useState(null); // Inicializa userId en null
  const [userFirstName, setUserFirstName] = useState(''); // Estado para el nombre del usuario

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await SecureStore.getItemAsync('USER_ID'); // Obtiene el USER_ID de Secure Store
        setUserId(id); // Establece el userId en el estado

        if (id) {
          // Suponiendo que tienes una API que devuelve los detalles del usuario
          const response = await fetch(`${NGROK_URL}/api/v1/users/${id}`); // Reemplaza con tu URL de API
          const userData = await response.json();
          setUserFirstName(userData.first_name); // Establece el nombre del usuario
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'No se pudo obtener el ID de usuario.');
      }
    };

    fetchUserId(); // Llama a la función para obtener el userId y el nombre del usuario
  }, []);

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('authToken'); // Elimina el token de Secure Store
      await SecureStore.deleteItemAsync('USER_ID');
      console.log('Token removed, logging out');
      router.push('/'); // Redirige a la pantalla de inicio
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Could not log out. Please try again.');
    }
  };

  return (
      <View style={styles.container}>
        {userFirstName ? (
          <Text style={styles.text}>Welcome, {userFirstName}!</Text> // Mostrar el nombre del usuario
        ) : (
          <Text style={styles.text}>Welcome</Text>
        )}

        <Button
          title="Beer"
          onPress={() => router.push('/beers')}
          buttonStyle={styles.linkButton}
          titleStyle={styles.buttonTitle}
        />
        <Button
          title="Users"
          onPress={() => router.push('/users')}
          buttonStyle={styles.linkButton}
          titleStyle={styles.buttonTitle}
        />
        <Button
          title="Event"
          onPress={() => router.push('/events')}
          buttonStyle={styles.linkButton}
          titleStyle={styles.buttonTitle}
        />
        <Button
          title="Feed"
          onPress={() => router.push('/feed')}
          buttonStyle={styles.linkButton}
          titleStyle={styles.buttonTitle}
        />

        {userId && (
          <Button
            title="Your Profile"
            onPress={() => router.push(`/users/${userId}`)}
            buttonStyle={styles.linkButton}
            titleStyle={styles.buttonTitle}
          />
        )}

        <Button
          title="Logout"
          onPress={handleLogout}
          buttonStyle={styles.logoutButton} // Estilo especial para el botón de Logout
          titleStyle={styles.logoutButtonTitle} // Estilo especial para el texto del botón de Logout
        />
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Centrar verticalmente
    alignItems: 'center', // Centrar horizontalmente
    padding: 20,
  },
  text: {
    fontSize: 40,
    marginBottom: 20,
    textAlign: 'center',
    color: "#6F4E37",  // Color de texto para el Welcome
    fontWeight: 'bold', // Texto en negrita
  },
  linkButton: {
    marginBottom: 20,
    backgroundColor: "#A67B5B",  // Fondo de los botones
    borderRadius: 20,  // Bordes redondeados
    width: 230,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonTitle: {
    // fontWeight: 'bold', // Texto en negrita dentro del botón
    color: "white",  // Texto blanco
  },
  logoutButton: {
    marginTop: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#503C3C",  // Color de fondo específico para Logout
    width: 230,
    borderRadius: 20, 
  },
  logoutButtonTitle: {
    fontWeight: 'bold',
    color: "white",  // Texto blanco en el botón de logout
  },
});

export default HomeScreen;
