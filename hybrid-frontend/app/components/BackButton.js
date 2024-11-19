import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';  // Asegúrate de que estás importando 'Text'
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const BackButton = () => {
  const router = useRouter();

  return (
    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
      <MaterialIcons name="arrow-back" size={24} color="#333" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    // top: 40,
    // left: 10,
    paddingLeft: 10,
    zIndex: 10,
  },
});

export default BackButton;
