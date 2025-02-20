import { MutableRefObject, useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StyleSheet } from 'react-native';

import { View } from '@/components/Themed'

import { Text, Button, Card } from 'react-native-paper';

const DisplayStrings = {
  NEED_PERMISSION: 'I need your permission to show the camera',
  TAKE_PHOTO: 'Take Photo',
  GRANT_PERMISSION: 'Grant Permission'
};

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
        <CameraBox hasPermission={permission.granted} cameraRef={cameraRef} />
      </Card.Content>
      <Card.Actions style={styles.actions}>
        <CameraActions hasPermission={permission.granted} onTakePhoto={takePhoto} onRequestPermission={requestPermission}/>
      </Card.Actions>
    </Card>
  );
}


interface CameraBoxProps {
  hasPermission: boolean;
  cameraRef: MutableRefObject<CameraView | null>;
}

function CameraBox({hasPermission, cameraRef}: CameraBoxProps) {
  if (hasPermission) {
    return <CameraView style={styles.camera} ref={cameraRef} />;
  }
  return <Text style={styles.camera}>{DisplayStrings.NEED_PERMISSION}</Text>;
}


interface CameraActionsProps {
  hasPermission: boolean;
  onTakePhoto: () => void;
  onRequestPermission: () => void;
}

function CameraActions({hasPermission, onTakePhoto, onRequestPermission}: CameraActionsProps) {
  if (hasPermission) {
    return <Button onPress={onTakePhoto}>{DisplayStrings.TAKE_PHOTO}</Button>;
  }
  return <Button onPress={onRequestPermission}>{DisplayStrings.GRANT_PERMISSION}</Button>;
}


const CAMERA_WINDOW = 300;
const CAMERA_TOP_MARGIN = 15;

const styles = StyleSheet.create({
  camera: {
    width: CAMERA_WINDOW,
    height: CAMERA_WINDOW,
    marginTop: CAMERA_TOP_MARGIN,
    alignSelf: 'center',
    textAlignVertical: 'center',
    color: 'red',
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

export const TEST_ONLY = {DisplayStrings};