import React, { useState, useContext } from 'react';
import { StyleSheet, Image } from 'react-native';

import Camera from '@/components/Camera';
import { useRouter } from 'expo-router';
import IOInterfaceContext from '@/contexts/IOInterfaceContext';

import { Card, Text, Button, Divider } from 'react-native-paper';
import ScreenView from '@/components/ScreenView';
import { TextInput, View } from '@/components/Themed';


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

  function startQuest() {
    console.log("Starting Quest...");
    emit("newGame", {storyPrompt, photo: photoBase64});
    router.push('/hero-log-screen');
  }

  return (
    <ScreenView>
      {stage === 'INPUT' ? (<>
        <Card>
          <Card.Content style={styles.content}>
            <Text>{STORY_PROMPT}</Text>
          </Card.Content>
          <Card.Actions style={styles.actions}>
            <>
              <TextInput
                  style={styles.textInput}
                  contentStyle={styles.textInputContent}
                  mode="outlined"
                  multiline={true}
                  value={storyPrompt}
                  onChangeText={setStoryPrompt}
                  placeholder={STORY_PLACEHOLDER}/>
              </>
          </Card.Actions>
        </Card>
        <Camera
            headerText={PHOTO_PROMPT}
            onRejectPhoto={() => setPhotoBase64(null)}
            onTakePhoto={b64 => setPhotoBase64(b64)} />
        <Button style={styles.flexEnd} contentStyle={{}} mode="contained" onPress={() => setStage('CONFIRM')}>Confirm</Button>
      </>) : (<>
        <Card>
          <Card.Content style={styles.content}>
            <Text>{CONFIRMATION_PROMPT}</Text>
            <Divider style={styles.divider} />
            <Text style={{ fontStyle: 'italic' }}>"{storyPrompt}"</Text>
            <Image source={{uri: `data:image/jpeg;base64,${photoBase64}`}} style={styles.photo} />
          </Card.Content>
          <Card.Actions style={styles.actions}>
            <View style={styles.buttonRow}>
              <Button mode="outlined" onPress={() => setStage('INPUT')}>Change</Button>
              <Button mode="contained" onPress={startQuest}>Start Quest</Button>
            </View>
          </Card.Actions>
        </Card>
      </>)}
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  photo: {
    width: 300,
    height: 300,
    marginTop: 15,
    alignSelf: 'center',
  },
  center: {
    alignSelf: 'center',
  },
  content: {
    alignSelf: 'center',
    display: 'flex',
    flexDirection: 'column',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'stretch',
    gap: 10,
    padding: 15,
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
  buttonRow: {
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: 10,
    justifyContent: 'space-between',
  },
});