import ScreenView from "@/components/ScreenView";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { Button, Text, Card } from "react-native-paper";
import { useDispatch } from "react-redux";
import { newGame } from "@/store/slices/game-slice";

export const GOODBYE_MSG = 'Thanks for playing?'

export default function GoodbyeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  function handleClick() {
    dispatch(newGame());
    router.push('/');
  }

  return (
    <ScreenView>
      <Card>
        <Card.Content style={styles.center}>
          <Text>{GOODBYE_MSG}</Text>
        </Card.Content>
        <Card.Actions style={styles.actions}>
          <Button onPress={handleClick}>Play again</Button>
        </Card.Actions>
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