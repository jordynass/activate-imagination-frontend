import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/boilerplate/useColorScheme';
import IOInterfaceProvider from '@/components/IOProvider';
import { ImageBackground, StyleSheet } from 'react-native';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const paperTheme = colorScheme === 'dark' 
    ? { ...MD3DarkTheme, colors: { ...MD3DarkTheme.colors, ...DarkTheme.colors } }
    : { ...MD3LightTheme, colors: { ...MD3LightTheme.colors, ...DefaultTheme.colors } };
  const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ImageBackground style={styles.background} source={require('@/assets/images/old_paper.jpg')}>
      <PaperProvider theme={paperTheme}>
        <ThemeProvider value={navigationTheme}>
          <IOInterfaceProvider>
            <Stack screenOptions={{
                contentStyle: { backgroundColor: 'transparent' },
                animation: 'none', // Prevents white flash during navigation
            }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="hero-log-screen" options={{ headerShown: false }} />
            </Stack>
          </IOInterfaceProvider>
        </ThemeProvider>
      </PaperProvider>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});