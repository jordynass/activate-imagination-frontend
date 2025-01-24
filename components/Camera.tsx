import { useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StyleSheet } from 'react-native';

import { View } from '@/components/Themed'

import { Text, Button, Card } from 'react-native-paper';

type Props = {
  headerText: string,
  onTakePhoto: (photoBase64: string) => void;
}

export default function Camera({onTakePhoto, headerText}: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);

  if (!permission) {
    return <View />;
  }

  async function takePhoto() {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.2,
      });
      if (photo?.base64) {
        onTakePhoto(photo.base64);
      }
    }
  }

  return (
    <Card>
      <Card.Content style={styles.content}>
        <Text>{headerText}</Text>
        {permission.granted ?
            <CameraView ref={cameraRef} style={styles.camera} /> :
            <Text style={styles.camera}>We need your permission to show the camera</Text>}
      </Card.Content>
      <Card.Actions style={styles.actions}>
        {permission.granted ?
            <Button onPress={takePhoto}>Take Photo</Button> :
            <Button onPress={requestPermission}>Grant Permission</Button>}
      </Card.Actions>
    </Card>
  );
}

const CAMERA_WINDOW = 300;
const CAMERA_TOP_MARGIN = 15;

const styles = StyleSheet.create({
  camera: {
    width: CAMERA_WINDOW,
    height: CAMERA_WINDOW,
    marginTop: CAMERA_TOP_MARGIN,
  },
  permissionRequest: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: CAMERA_WINDOW,
    height: CAMERA_WINDOW,
    marginTop: CAMERA_TOP_MARGIN,
  },
  content: {
    alignSelf: 'center',
    alignItems: 'center',
  },
  actions: {
    alignSelf: 'center',
    alignItems: 'center',
  },
});