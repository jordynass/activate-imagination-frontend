import { Text, TextInput, View } from "@/components/Themed";
import useStream from "@/components/useStream";
import socket from "@/utils/network";
import { useState } from "react";
import { Button, StyleSheet } from "react-native";

export default function LogScreen() {
  const [heroResponse, setHeroResponse] = useState('');
  const stream = useStream();

  const content = stream.values.join('');

  function handleAction() {
    socket.emit('action', heroResponse);
  }

  return (
    <View style={styles.container}>
      <Text>{content}</Text>
      {(!stream.isActive && content) && (
        <View>
          <TextInput multiline={true} value={heroResponse} onChangeText={setHeroResponse} />
          <Button title="Take Action" onPress={handleAction} />
        </View>
      )}
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