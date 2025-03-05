import { InputKey } from "@/api";
import Camera from "@/components/Camera";
import ScreenView from "@/components/ScreenView";
import IOInterfaceContext from "@/contexts/IOInterfaceContext";
import useSocketEventListeners from "@/hooks/useSocketEventListeners";
import { assert } from "@/utils/utils";
import { useRouter } from "expo-router";
import { useEffect, useState, useContext, ReactNode } from "react";
import { StyleSheet, ActivityIndicator } from "react-native";
import { Button, Text, Card, TextInput } from "react-native-paper";

export const ACTION_INPUT_PLACEHOLDER = 'Choose wisely...';
export const CAMERA_HEADER = 'Show me your new surroundings';
export const START_SCENE_BUTTON = 'Continue adventure';
export const ACTION_BUTTON = 'Take Action';

export const DEFAULT_ACTION_MESSAGE = 'What will you do next?';
export const DEFAULT_NEW_SCENE_MESSAGE = 'You are entering a new scene...';

export default function HeroLogScreen() {
  const [heroInput, setHeroInput] = useState('');
  const [isWaiting, setIsWaiting] = useState(true);
  const {stream: {values, isActive, responseKey}, emit} = assert(useContext(IOInterfaceContext));
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

  const currentContent = values.join('').trim();
  const emptyResponseFallback = responseKey === InputKey.NEW_SCENE ? DEFAULT_NEW_SCENE_MESSAGE : DEFAULT_ACTION_MESSAGE;
  const defaultText = (isActive || isWaiting) ? null : emptyResponseFallback;
  const content = currentContent || defaultText;

  function sendInput() {
    setIsWaiting(true);
    switch (assert(responseKey)) {
      case InputKey.ACTION:
        emit(assert(responseKey), {text: heroInput});
        break;
      case InputKey.NEW_SCENE:
        emit(assert(responseKey), {photo: heroInput});
        break;
    }
  }

  const needCameraInput = !isActive && !isWaiting && responseKey === InputKey.NEW_SCENE;

  return (
    <ScreenView>
      <Card>
        <Card.Content style={styles.center}>
          {!isWaiting && <Text>{content}</Text>}
        </Card.Content>
        <Card.Actions style={styles.actions}>
          <CardActionsBody isWaiting={isWaiting} showActions={!isActive && !isWaiting && responseKey === InputKey.ACTION}>
            <TextInput
                style={styles.textInput}
                contentStyle={styles.textInputContent}
                multiline={true}
                value={heroInput}
                onChangeText={setHeroInput}
                placeholder={ACTION_INPUT_PLACEHOLDER}/>
            <Button onPress={sendInput}>{ACTION_BUTTON}</Button>
          </CardActionsBody>
        </Card.Actions>
      </Card>
      {needCameraInput && (
        <>
          <Camera
              headerText={CAMERA_HEADER}
              onRejectPhoto={() => setHeroInput('')}
              onTakePhoto={(b64: string) => setHeroInput(b64)}
          />
          <Button
              style={styles.flexEnd}
              mode="contained"
              disabled={!heroInput}
              onPress={sendInput}>
            {START_SCENE_BUTTON}
          </Button>
        </>
      )}
    </ScreenView>
  )
}


interface CardActionsBodyProps {
  children: ReactNode,
  isWaiting: boolean,
  showActions: boolean,
}
function CardActionsBody({children, showActions, isWaiting}: CardActionsBodyProps) {
  if (isWaiting) {
    return <ActivityIndicator testID="activity-indicator" size="large" />;
  }
  if (showActions) {
    return <>{children}</>;
  }
  return null;
}


const styles = StyleSheet.create({
  center: {
    alignSelf: 'center',
    display: 'flex',
    flexDirection: 'column',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'stretch',
    gap: 10,
  },
  textInputContent: {
    paddingBottom: 5,
    paddingTop: 5,
  },
  textInput: {
    alignSelf: 'stretch',
  },
  flexEnd: {
    marginTop: 'auto',
  },
});