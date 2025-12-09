import { Image } from 'expo-image';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Welcome!</Text>
      </View>
      <View style={styles.stepContainer}>
        <Text style={styles.subtitle}>Step 1: Try it</Text>
        <Text>
          Edit app/(tabs)/index.tsx to see changes.
          Press{' '}
          {Platform.select({
            ios: 'cmd + d',
            android: 'cmd + m',
            web: 'F12',
          })}{' '}
          to open developer tools.
        </Text>
      </View>
      <View style={styles.stepContainer}>
        <Text style={styles.subtitle}>Step 2: Explore</Text>
        <Text>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </Text>
      </View>
      <View style={styles.stepContainer}>
        <Text style={styles.subtitle}>Step 3: Get a fresh start</Text>
        <Text>
          {`When you're ready, run `}
          npm run reset-project to get a fresh app directory. This will move the current app to app-example.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  stepContainer: {
    gap: 8,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
  },
});
