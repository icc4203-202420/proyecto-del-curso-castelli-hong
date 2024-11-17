import { NGROK_URL } from '@env';
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { Slider } from '@rneui/themed';
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

// Validation schema for the form
const validationSchema = Yup.object().shape({
  text: Yup.string()
    .required('Requiere de justificación para poder dejar un review')
    .test(
      'minWords',
      'El review debe tener al menos 15 palabras',
      (value) => value && value.split(' ').filter(word => word !== '').length >= 15
    ),
  rating: Yup.number().required('Debe seleccionar una calificación')
});

const BeerReviews = ({ beerId }) => { 
  const [serverError, setServerError] = useState('');
  const [rating, setRating] = useState(1); // Cambiado a 1
  const router = useRouter();
  
  const handleSubmit = async (values, { setSubmitting }) => {
    const userId = await SecureStore.getItemAsync('USER_ID');
    const token = await SecureStore.getItemAsync('authToken');

    console.log("TOKEN:", token);
    console.log("USER ID:", userId);
    console.log("BEER ID:", beerId);

    if (!token || !userId || !beerId) {
      setServerError('No hay un token o usuario disponible para la autenticación o el beerId es inválido.');
      setSubmitting(false);
      return;
    }

    values.rating = rating; // Asegúrate de que el valor de rating sea 1 o más

    try {
      const response = await axios.post(
        `${NGROK_URL}/api/v1/beers/${beerId}/reviews`,
        { 
          review: { 
            rating: values.rating, 
            text: values.text,
          },
          user_id: userId
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'USER_ID': userId
          }
        }
      );
      
      setServerError('');
      router.push("/beers");
    } catch (err) {
      console.log('Error:', err);
      if (err.response) {
        console.log('Server Response:', err.response.data);
        if (err.response.status === 401) {
          setServerError('No autorizado. Verifique su token de autenticación.');
        } else if (err.response.status === 403) {
          setServerError('Acceso prohibido. Verifique sus permisos.');
        } else {
          setServerError('Error en el servidor. Intenta nuevamente más tarde.');
        }
      } else {
        setServerError('Error en la conexión. Verifica tu internet.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{ text: '', rating: 1 }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ handleChange, handleSubmit, values, errors, touched, isSubmitting }) => (
        <View contentContainerStyle={styles.container}>
          <Text style={styles.label}>Calificación (1-5): {rating.toFixed(1)}</Text>
          <Slider
            value={rating * 10}
            onValueChange={(value) => setRating(value / 10)} 
            minimumValue={10}  // Los valores se multiplican por 10
            maximumValue={50}  // Los valores se multiplican por 10
            step={1}  // Usamos pasos enteros
            thumbTintColor="#4E342E"
            minimumTrackTintColor="#6D4C41"
            maximumTrackTintColor="#D7CCC8"
            trackStyle={styles.sliderTrack}
            thumbStyle={styles.sliderThumb}
          />
          {serverError.includes('calificación') && <Text style={styles.error}>{serverError}</Text>}
          <Text style={styles.label}>Comentario:</Text>
          <TextInput
            style={[styles.textArea, serverError.includes('comentario') ? styles.inputError : null]}
            multiline
            numberOfLines={4}
            value={values.text}
            onChangeText={handleChange('text')}
            placeholder="Escribe tu reseña aquí..."
            placeholderTextColor="#8D6E63"
          />
          {touched.text && errors.text && <Text style={styles.error}>{errors.text}</Text>}
          {isSubmitting ? (
            <ActivityIndicator size="large" color="#6D4C41" />
          ) : (
            <Button title="Enviar evaluación" onPress={handleSubmit} color="#AAB396" />
          )}
          {serverError ? (
            <Text style={styles.error}>{serverError}</Text>
          ) : null}
        </View>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F5F3E7',
  },
  label: {
    fontSize: 16,
    color: '#674636', // Dark brown
    marginBottom: 8,
    fontWeight: 'bold',
  },
  sliderTrack: {
    height: 12,
    borderRadius: 6,
  },
  sliderThumb: {
    height: 24,
    width: 24,
    backgroundColor: '#AAB396', // Dark brown for thumb
    borderRadius: 12,
  },
  textArea: {
    borderColor: '#BE9E84',
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
    textAlignVertical: 'top',
    width: '100%',
    backgroundColor: '#fff', // Light beige background
  },
  inputError: {
    borderColor: '#D32F2F', // Red error border
  },
  error: {
    color: '#D32F2F', // Red color for errors
    marginBottom: 10,
  },
});

export default BeerReviews;
