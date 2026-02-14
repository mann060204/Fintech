import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useRouter, useSegments } from 'expo-router';

// Define the shape of the context
interface AuthContextType {
    user: any | null;
    token: string | null;
    isLoading: boolean;
    signIn: (token: string, userData: any) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    isLoading: true,
    signIn: async () => { },
    signOut: async () => { },
});

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();

    // Check for stored token on mount
    useEffect(() => {
        const loadToken = async () => {
            try {
                const storedToken = await SecureStore.getItemAsync('userToken');
                const storedUser = await SecureStore.getItemAsync('userData');

                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                }
            } catch (e) {
                console.error("Failed to load token", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadToken();
    }, []);

    // Handle navigation based on auth state
    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!user && !inAuthGroup) {
            // Redirect to login if not authenticated and not in auth group
            router.replace('/(auth)/login');
        } else if (user && inAuthGroup) {
            // Redirect to home if authenticated and in auth group
            router.replace('/');
        }
    }, [user, segments, isLoading]);

    const signIn = async (newToken: string, userData: any) => {
        try {
            await SecureStore.setItemAsync('userToken', newToken);
            await SecureStore.setItemAsync('userData', JSON.stringify(userData));
            setToken(newToken);
            setUser(userData);
            router.replace('/');
        } catch (e) {
            console.error("Sign in failed", e);
        }
    };

    const signOut = async () => {
        try {
            await SecureStore.deleteItemAsync('userToken');
            await SecureStore.deleteItemAsync('userData');
            setToken(null);
            setUser(null);
            router.replace('/(auth)/login');
        } catch (e) {
            console.error("Sign out failed", e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
