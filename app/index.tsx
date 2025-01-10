import { useState } from 'react';
import { StyleSheet, Image, Button } from 'react-native';

import { Text, View, TextInput } from '@/components/Themed';
import Camera from '@/components/Camera';
import socket from '@/utils/network';
import { useRouter } from 'expo-router';

export const STORY_PROMPT = 'What are you doing on your quest?';
export const PHOTO_PROMPT = 'Show me your point of departure';
export const CONFIRMATION_PROMPT = 'If this is the quest you seek, continue... at your own risk!';

export const STORY_PLACEHOLDER = 'I am the swashbuckling captain of the SS Loopadoop searching for the lost jewels of La Joya';

export default function StartScreen() {
  const [storyPrompt, setStoryPrompt] = useState<string>('');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [stage, setStage] = useState(0);
  const router = useRouter();

  function handleTakePhoto(b64: string) {
    setPhotoBase64(b64);
  }

  function startQuest() {
    console.log("Starting Quest...");
    socket.emit("newGame", {storyPrompt, photo: photoBase64});
    router.push('/hero-log-screen');
  }

  function getScreen() {
    switch (stage) {
      case 0:
        return (
          <View key={stage}>
            <Text>{STORY_PROMPT}</Text>
            <TextInput multiline={true} value={storyPrompt} onChangeText={setStoryPrompt} placeholder={STORY_PLACEHOLDER}/>
          </View>);
      case 1:
        return (
          <View key={stage}>
            <Text>{PHOTO_PROMPT}</Text>
            <Camera onTakePhoto={handleTakePhoto} />
          </View>);
      case 2:
        // TODO: Replace with ConfirmationScreen to handle missing data.
        return (
          <View key={stage}>
            <Text>If this is the quest you seek, continue... at your own risk!</Text>
            <Text>"{storyPrompt}"</Text>
            <Image source={{uri: `data:image/jpeg;base64,${photoBase64}`}} style={styles.photo} />
          </View>);
    }
  }

  return (
    <View style={styles.container}>
      {getScreen()}
      <Button title="Back" disabled={stage === 0} onPress={() => setStage(stage - 1)} />
      {/* TODO: Disable "Next" button if no storyPrompt or photoBase64 is set (depending on the stage). */}
      {stage < 2 ?
        <Button title="Next" onPress={() => setStage(stage + 1)} /> :
        <Button title="Start quest" onPress={startQuest} />}
    </View>
  );
}

function ConfirmationScreen({storyPrompt, photoBase64}: {storyPrompt: string, photoBase64: string}) {
  const missing = [];
  if (!storyPrompt) {
    missing.push("story prompt");
  }
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