import { ForwardedRef, forwardRef, useRef, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StyleSheet, Image } from 'react-native';

import { View } from '@/components/Themed'

import { Text, Button, Card } from 'react-native-paper';

const DisplayStrings = {
  NEED_PERMISSION: 'I need your permission to show the camera',
  TAKE_PHOTO: 'Take Photo',
  GRANT_PERMISSION: 'Grant Permission',
  RETAKE_PHOTO: 'Retake',
  SNAPSHOT_ALT: 'Captured photo'
};

interface Props {
  headerText: string;
  onRejectPhoto: () => void;
  onTakePhoto: (photoBase64: string) => void;
}

export default function Camera({headerText, onTakePhoto, onRejectPhoto}: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const cameraRef = useRef<CameraView | null>(null);

  if (!permission) {
    return <View />;
  }

  async function handleTakePhoto() {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.2,
      });
      if (photo?.base64) {
        onTakePhoto(photo.base64);
        setPhotoBase64(photo.base64);
      }
    }
  }

  function handleRejectPhoto() {
    setPhotoBase64(null);
    onRejectPhoto();
  }

  return (
    <Card>
      <Card.Content style={styles.content}>
        <Text>{headerText}</Text>
        <CameraBox
            hasPermission={permission.granted}
            ref={cameraRef}
            photoBase64={photoBase64} />
      </Card.Content>
      <Card.Actions style={styles.actions}>
        <CameraActions
            hasSavedPhoto={!!photoBase64}
            hasPermission={permission.granted}
            onRejectPhoto={handleRejectPhoto}
            onTakePhoto={handleTakePhoto}
            onRequestPermission={requestPermission}/>
      </Card.Actions>
    </Card>
  );
}


interface CameraBoxProps {
  hasPermission: boolean;
  photoBase64: string | null;
}
const CameraBox = forwardRef(
    ({hasPermission, photoBase64}: CameraBoxProps, ref: ForwardedRef<CameraView | null>) => {
  if (photoBase64) {
    return (
      <Image
          alt={DisplayStrings.SNAPSHOT_ALT}
          role="img"
          source={{uri: `data:image/jpeg;base64,${photoBase64}`}}
          style={styles.camera} />);
  }
  if (hasPermission) {
    return <CameraView style={styles.camera} ref={ref} />;
  }
  return <Text style={styles.camera}>{DisplayStrings.NEED_PERMISSION}</Text>;
})


interface CameraActionsProps {
  hasSavedPhoto: boolean;
  hasPermission: boolean;
  onRejectPhoto: () => void;
  onTakePhoto: () => void;
  onRequestPermission: () => void;
}
function CameraActions({
  hasSavedPhoto,
  hasPermission,
  onRejectPhoto,
  onTakePhoto,
  onRequestPermission,
}: CameraActionsProps) {
  if (hasSavedPhoto) {
    return <Button mode="contained-tonal" onPress={onRejectPhoto}>{DisplayStrings.RETAKE_PHOTO}</Button>;
  }
  if (hasPermission) {
    return <Button mode="outlined" onPress={onTakePhoto}>{DisplayStrings.TAKE_PHOTO}</Button>;
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
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 10,
    borderStyle: 'solid',
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