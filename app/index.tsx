import { useState } from 'react';
import { StyleSheet, Image } from 'react-native';

import { Text, View } from '@/components/Themed';
import CameraScreen from '@/components/CameraScreen';

export default function StartGameWizard() {
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [stage, setStage] = useState(0);

  function handleTakePhoto(b64: string) {
    setPhotoBase64(b64);
    setStage(stage + 1);
  }

  function getScreen() {
    switch (stage) {
      case 0:
        return <CameraScreen onTakePhoto={handleTakePhoto} />;
      case 1:
        return (
          <View>
            <Text>Photo taken!</Text>
            <Image source={{uri: `data:image/jpeg;base64,${photoBase64}`}} style={styles.photo} />
          </View>
        );
    }
  }

  return (
    <View style={styles.container}>
      {getScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  camera: {
    width: 300,
    height: 300,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  message: {
    fontSize: 16,
  },
  photo: {
    width: 300,
    height: 300,
    marginTop: 20,
  },
});