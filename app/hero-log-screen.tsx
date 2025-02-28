import { InputKey } from "@/api";
import Camera from "@/components/Camera";
import ScreenView from "@/components/ScreenView";
import IOInterfaceContext from "@/contexts/IOInterfaceContext";
import useSocketEventListeners from "@/hooks/useSocketEventListeners";
import { assert } from "@/utils/utils";
import { useRouter } from "expo-router";
import { useEffect, useState, useContext } from "react";
import { StyleSheet, ActivityIndicator } from "react-native";
import { Button, Text, Card, TextInput } from "react-native-paper";

export const ACTION_INPUT_PLACEHOLDER = 'Choose wisely...';
export const CAMERA_HEADER = 'Show me your new surroundings';
export const START_SCENE_BUTTON = 'Continue adventure';
export const ACTION_BUTTON = 'Take Action';

export default function HeroLogScreen() {
  const [heroInput, setHeroInput] = useState('');
  const {stream: {values, isActive, responseKey}, emit} = useContext(IOInterfaceContext)!;
  const [isWaiting, setIsWaiting] = useState(true);
  const router = useRouter();
  useSocketEventListeners([
    { event: 'exit', callback: () => router.push('/goodbye-screen') },
  ]);
  
  useEffect(() => {
    if (isActive) {
      setIsWaiting(false);
      setHeroInput('');
    }
  }, [isActive]);

  const content = values.join('');

  function sendInput() {
    setIsWaiting(true);
    emit(assert(responseKey), {text: heroInput});
  }

  return (
    <ScreenView>
      <Card>
        {content && (
          <Card.Content testID="card-content" style={styles.center}>
            <Text>{content}</Text>
          </Card.Content>
        )}
        <Card.Actions style={styles.actions}>
          {content && !isActive && !isWaiting && (
            <HeroAction
                inputType={assert(responseKey)}
                heroInput={heroInput}
                setHeroInput={setHeroInput}
                sendInput={sendInput}
            />
          )}
          {isWaiting && <ActivityIndicator testID="activity-indicator" size="large" />}
        </Card.Actions>
      </Card>
      {responseKey === InputKey.NEW_SCENE && !isActive && !isWaiting && (
        <Camera
            headerText={CAMERA_HEADER}
            onRejectPhoto={() => setHeroInput('')}
            onTakePhoto={(b64: string) => setHeroInput(b64)}
        />
      )}
    </ScreenView>
  )
}

interface HeroActionProps {
  inputType: InputKey,
  heroInput: string,
  setHeroInput: (input: string) => void,
  sendInput: () => void,
}
function HeroAction({inputType, heroInput, setHeroInput, sendInput}: HeroActionProps) {
  switch (inputType) {
    case 'action':
      return (
        <>
          <TextInput
            style={styles.textInput}
            contentStyle={styles.textInputContent}
            multiline={true}
            value={heroInput}
            onChangeText={setHeroInput}
            placeholder={ACTION_INPUT_PLACEHOLDER}/>
          <Button onPress={sendInput}>{ACTION_BUTTON}</Button>
        </>
      );
    case 'newScene':
      return (
        <Button mode="contained" disabled={!heroInput} onPress={sendInput}>{START_SCENE_BUTTON}</Button>
      );
  }
}


const styles = StyleSheet.create({
  center: {
    alignSelf: 'center',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'stretch',
    gap: 10,
  },
  textInputContent: {
    flexShrink: 0,
  },
  textInput: {
    alignSelf: 'stretch',
  },
});