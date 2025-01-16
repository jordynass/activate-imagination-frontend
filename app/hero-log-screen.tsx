import { Text, TextInput, View } from "@/components/Themed";
import IOInterfaceContext from "@/contexts/IOInterfaceContext";
import { useEffect, useState, useContext } from "react";
import { Button, StyleSheet, ActivityIndicator } from "react-native";

export const ACTION_INPUT_PLACEHOLDER = 'Choose wisely...'

export default function HeroLogScreen() {
  const [heroResponse, setHeroResponse] = useState('');
  const {stream: {values, isActive}, emit} = useContext(IOInterfaceContext)!;
  const [isWaiting, setIsWaiting] = useState(false);
  useEffect(() => {
    if (isActive) {
      setIsWaiting(false);
    }
  }, [isActive]);

  const content = values.join('');

  function handleAction() {
    setIsWaiting(true);
    emit('action', {text: heroResponse});
  }

  return (
    <View style={styles.container}>
      <Text>{content}</Text>
      {(!isActive && !isWaiting && content) && (
        <View>
          <TextInput placeholder={ACTION_INPUT_PLACEHOLDER} multiline={true} value={heroResponse} onChangeText={setHeroResponse} />
          <Button title="Take Action" onPress={handleAction} />
        </View>
      )}
      {isWaiting && <ActivityIndicator testID="activity-indicator" size="large" />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});