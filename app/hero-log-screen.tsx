import ScreenView from "@/components/ScreenView";
import IOInterfaceContext from "@/contexts/IOInterfaceContext";
import useSocketEventListeners from "@/hooks/useSocketEventListeners";
import { useRouter } from "expo-router";
import { useEffect, useState, useContext } from "react";
import { StyleSheet, ActivityIndicator } from "react-native";
import { Button, Text, Card, TextInput } from "react-native-paper";

export const ACTION_INPUT_PLACEHOLDER = 'Choose wisely...'

export default function HeroLogScreen() {
  const [heroResponse, setHeroResponse] = useState('');
  const {stream: {values, isActive}, emit} = useContext(IOInterfaceContext)!;
  const [isWaiting, setIsWaiting] = useState(false);
  const router = useRouter();
  useSocketEventListeners([
    { event: 'exit', callback: () => router.push('/goodbye-screen')}
  ]);
  
  useEffect(() => {
    if (isActive) {
      setHeroResponse('');
      setIsWaiting(false);
    }
  }, [isActive]);

  const content = values.join('');

  function handleAction() {
    setIsWaiting(true);
    emit('action', {text: heroResponse});
  }

  return (
    <ScreenView>
      <Card>
        <Card.Content style={styles.center}>
          <Text>{content}</Text>
        </Card.Content>
        {(!isActive && !isWaiting && content) && (<Card.Actions style={styles.actions}>
          <TextInput
              style={styles.textInput}
              contentStyle={styles.textInputContent}
              multiline={true}
              value={heroResponse}
              onChangeText={setHeroResponse}
              placeholder={ACTION_INPUT_PLACEHOLDER}/>
          <Button onPress={handleAction}>Take Action</Button>
        </Card.Actions>)}
        {isWaiting && <ActivityIndicator testID="activity-indicator" size="large" />}
      </Card>
    </ScreenView>
  )
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
    paddingBottom: 5,
    paddingTop: 5,
    flexShrink: 0,
  },
  textInput: {
    alignSelf: 'stretch',
  },
});