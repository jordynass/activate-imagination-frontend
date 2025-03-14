import { ReactNode } from "react";
import { ScrollView, StyleSheet } from "react-native"

export default function ScreenView({children}: {children: ReactNode}) {
  return (
    <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        contentContainerStyle={styles.scrollViewContent}
        style={styles.scrollView}>
      {children}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: 'none',
  },
  scrollViewContent: {
    height: 'auto',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 10,
    backgroundColor: 'none',
  },
});