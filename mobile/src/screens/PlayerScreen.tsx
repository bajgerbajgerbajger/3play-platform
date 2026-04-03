import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  StatusBar
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';

export default function PlayerScreen({ route, navigation }: { route: any, navigation: any }) {
  const { movie } = route.params;

  return (
    <View style={styles.playerContainer}>
      <StatusBar hidden />
      <Video
        source={{ uri: movie.videoUrl || '' }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        useNativeControls
        style={styles.video}
        onFullscreenUpdate={({fullscreenUpdate}) => {
          if (fullscreenUpdate === 3) navigation.goBack();
        }}
      />
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Zpět</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  playerContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  video: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});
