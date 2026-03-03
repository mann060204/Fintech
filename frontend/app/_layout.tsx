import { Stack, Link } from 'expo-router';
import { ApolloProvider } from '@apollo/client/react';
import { PaperProvider, MD3LightTheme, IconButton } from 'react-native-paper';
import client from './apollo';
import { AuthProvider } from '../context/AuthContext';

const finoTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#5f33e1',
        secondary: '#8e8e93',
        background: '#f8f9fe',
        surface: '#ffffff',
        surfaceVariant: '#f2f2f7',
        error: '#B00020',
    },
    roundness: 3, // Multiplier for MD3 border radius to achieve softer, more rounded components
};

export default function RootLayout() {
    return (
        <ApolloProvider client={client}>
            <PaperProvider theme={finoTheme}>
                <AuthProvider>
                    <Stack
                        screenOptions={{
                            headerStyle: {
                                backgroundColor: finoTheme.colors.background,
                            },
                            headerTintColor: '#000',
                            headerShadowVisible: false,
                        }}>
                        <Stack.Screen
                            name="index"
                            options={{
                                title: '',
                                headerRight: () => (
                                    <Link href="/profile" asChild>
                                        <IconButton icon="account-circle" iconColor="#5f33e1" size={32} />
                                    </Link>
                                ),
                            }}
                        />
                        <Stack.Screen name="profile" options={{ title: 'My Profile', presentation: 'modal' }} />
                        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
                        <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
                    </Stack>
                </AuthProvider>
            </PaperProvider>
        </ApolloProvider>
    );
}
