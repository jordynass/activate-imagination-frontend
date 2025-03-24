import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { store } from '@/store/store';
import { Provider as ReduxProvider } from 'react-redux';
import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

import { useColorScheme } from '@/hooks/boilerplate/useColorScheme';
import IOInterfaceProvider from '@/components/IOProvider';
import { ImageBackground, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('@/assets/fonts/SpaceMono-Regular.ttf'),
    IMFellDWPica: require('@/assets/fonts/IMFellDWPica-Regular.ttf'),
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}>
      <ImageBackground style={styles.background} source={require('@/assets/images/old_paper.jpg')}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} translucent backgroundColor="transparent" />
        <PaperProvider theme={paperTheme}>
          <ThemeProvider value={navigationTheme}>
            <ReduxProvider store={store}>
              <IOInterfaceProvider>
                <Stack screenOptions={{
                    headerTitleAlign: 'center',
                    headerShadowVisible: false,
                    headerBackVisible: false,
                    gestureEnabled: false,
                    headerLeft: () => null,
                    headerStyle: {
                      backgroundColor: 'transparent',
                    },
                    headerTitleStyle: {
                      fontFamily: 'IMFellDWPica',
                      fontSize: 24,
                    },
                    contentStyle: {
                      backgroundColor: 'transparent',
                      padding: '5%',
                      paddingTop: 0,
                    },
                    animation: 'none', // Prevents white flash during navigation
                }}>
                  <Stack.Screen name="index" options={{ title: 'Welcome to the Hunt' }} />
                  <Stack.Screen name="hero-log-screen" options={{ title: "Hero's Log" }} />
                  <Stack.Screen name="goodbye-screen" options={{ title: 'Thanks for playing' }} />
                </Stack>
              </IOInterfaceProvider>
            </ReduxProvider>
          </ThemeProvider>
        </PaperProvider>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});