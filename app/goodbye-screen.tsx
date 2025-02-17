import { View } from "@/components/Themed";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { Button, Text, Card } from "react-native-paper";

export const GOODBYE_MSG = 'Thanks for playing?'

export default function GoodbyeScreen() {
  const router = useRouter();

  function handleClick() {
    router.push('/');
  }

  return (
    <View style={styles.container}>
      <Card>
        <Card.Content style={styles.center}>
          <Text>{GOODBYE_MSG}</Text>
        </Card.Content>
        <Card.Actions style={styles.actions}>
          <Button onPress={handleClick}>Play again</Button>
        </Card.Actions>
      </Card>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    backgroundColor: 'none',
  },
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