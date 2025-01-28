import React, { useState, useContext } from 'react';
import { StyleSheet, Image } from 'react-native';

import { View } from '@/components/Themed';
import Camera from '@/components/Camera';
import { useRouter } from 'expo-router';
import IOInterfaceContext from '@/contexts/IOInterfaceContext';

import { Card, Text, TextInput, Button, Divider } from 'react-native-paper';
import { useFonts } from 'expo-font';


export const STORY_PROMPT = `Welcome to a quest where the only limit is your imagination!

What would you like to do? Search for cursed gold in an ancient and long forgotten temple? \
Explore a haunted mansion to discover a priceless painting guarded by spirits of the beyond?

The choice is yours and yours alone, brave hero.`;
export const PHOTO_PROMPT = 'Show me where your quest begins.';
export const CONFIRMATION_PROMPT = 'If this is the quest you seek, continue... at your own risk!';

export const STORY_PLACEHOLDER = 'I am the swashbuckling captain of the SS Loopadoop searching for the lost jewels of La Joya';

export default function StartScreen() {
  const [storyPrompt, setStoryPrompt] = useState<string>('');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [stage, setStage] = useState<'INPUT'|'CONFIRM'>('INPUT');
  const router = useRouter();
  const { emit } = useContext(IOInterfaceContext)!;
  const [loaded] = useFonts({
    'IMFellDWPica': {
      uri: 'https://fonts.gstatic.com/s/imfelldwpica/v16/2sDGZGRQotv9nbn2qSl0TxXVYNw9ZA.ttf'
    }
  });

  function handleTakePhoto(b64: string) {
    setPhotoBase64(b64);
  }

  function startQuest() {
    console.log("Starting Quest...");
    emit("newGame", {storyPrompt, photo: photoBase64});
    router.push('/hero-log-screen');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to the Hunt</Text>
      {stage === 'INPUT' ? (<>
        <Card>
          <Card.Content style={styles.actions}>
            <Text>{STORY_PROMPT}</Text>
          </Card.Content>
          <Card.Actions style={styles.actions}>
            <TextInput style={styles.textInput} contentStyle={styles.textInputContent} multiline={true} value={storyPrompt} onChangeText={setStoryPrompt} placeholder={STORY_PLACEHOLDER}/>
          </Card.Actions>
        </Card>
        <Camera headerText={PHOTO_PROMPT} onTakePhoto={handleTakePhoto} />
        <Button style={styles.flexEnd} mode="contained" onPress={() => setStage('CONFIRM')}>Confirm</Button>
      </>) : (<>
        <Card>
          <Card.Content style={{alignSelf: 'center'}}>
            <Text>{CONFIRMATION_PROMPT}</Text>
            <Divider style={styles.divider} />
            <Text style={{ fontStyle: 'italic' }}>"{storyPrompt}"</Text>
            <Image source={{uri: `data:image/jpeg;base64,${photoBase64}`}} style={styles.photo} />
          </Card.Content>
          <Card.Actions style={styles.actions}>
            <Button mode="outlined" onPress={() => setStage('INPUT')}>Change</Button>
            <Button mode="contained" onPress={startQuest}>Start Quest</Button>
          </Card.Actions>
        </Card>
      </>)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: '5%',
    gap: '2%',
    backgroundColor: 'none',
  },
  header: {
    backgroundColor: 'transparent',
    fontFamily: 'IMFellDWPica',
    textAlign: 'center',
    fontSize: 24
  },
  photo: {
    width: 300,
    height: 300,
    marginTop: 20,
  },
  actions: {
    alignSelf: 'center',
  },
  textInputContent: {
    paddingBottom: 5,
    paddingTop: 5,
  },
  textInput: {
    alignSelf: 'stretch',
  },
  divider: {
    marginTop: 15,
    marginBottom: 15,
  },
  flexEnd: {
    marginTop: 'auto',
  },
});