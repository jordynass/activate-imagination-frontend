import { Text, TextInput, View } from "@/components/Themed";
import useStream from "@/hooks/useStream";
import socket from "@/utils/network";
import { useEffect, useState } from "react";
import { Button, StyleSheet, ActivityIndicator } from "react-native";

export default function HeroLogScreen() {
  const [heroResponse, setHeroResponse] = useState('');
  const {values, isActive} = useStream();
  const [isWaiting, setIsWaiting] = useState(false);
  useEffect(() => {
    if (isActive) {
      setIsWaiting(false);
    }
  })

  const content = values.join('');

  function handleAction() {
    setIsWaiting(true);
    socket.emit('action', heroResponse);
  }

  return (
    <View style={styles.container}>
      <Text>{content}</Text>
      {(!isActive && !isWaiting && content) && (
        <View>
          <TextInput multiline={true} value={heroResponse} onChangeText={setHeroResponse} />
          <Button title="Take Action" onPress={handleAction} />
        </View>
      )}
      {isWaiting && <ActivityIndicator size="large" />}
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