import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar, View, Platform, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import AppInitializer from './src/components/AppInitializer';
import { getColors } from './src/theme';
import { useThemeStore } from './src/store/themeStore';

export default function App() {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);

    return (
        <View style={styles.container}>
            <SafeAreaProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <StatusBar
                        barStyle={isDark ? "light-content" : "dark-content"}
                        backgroundColor={C.bg}
                        translucent
                    />
                    <AppInitializer>
                        <AppNavigator />
                    </AppInitializer>
                </GestureHandlerRootView>
            </SafeAreaProvider>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000', // Safe fall-back
        // On web, we need to ensure the root takes full height
        ...Platform.select({
            web: {
                height: '100vh',
                width: '100vw',
                overflow: 'hidden',
            },
            default: {
                height: '100%',
            }
        })
    }
});
