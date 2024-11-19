import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Video } from 'expo-av';

const VideoPlayer = ({ route }) => {
  const { videoUri } = route.params;
  const videoRef = useRef(null);

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        style={styles.video}
        source={{ uri: videoUri }}
        useNativeControls
        resizeMode="contain"
        shouldPlay
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});

export default VideoPlayer;