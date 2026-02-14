import { Stack, Link } from 'expo-router';
import { ApolloProvider } from '@apollo/client/react';
import { PaperProvider, IconButton } from 'react-native-paper';
import client from './apollo';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
    return (
        <ApolloProvider client={client}>
            <PaperProvider>
                <AuthProvider>
                    <Stack>
                        <Stack.Screen
                            name="index"
                            options={{
                                title: 'Trust Platform',
                                headerRight: () => (
                                    <Link href="/profile" asChild>
                                        <IconButton icon="account-circle" iconColor="black" size={28} />
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
