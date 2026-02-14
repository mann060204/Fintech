import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, Card, Title } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { gql, useMutation } from '@apollo/client';

const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $email: String!, $password: String!) {
    register(username: $username, email: $email, password: $password) {
      id
      username
      email
    }
  }
`;

export default function RegisterScreen() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const [register, { loading }] = useMutation(REGISTER_MUTATION, {
        onCompleted: () => {
            Alert.alert('Success', 'Account created! Please login.');
            router.replace('/(auth)/login');
        },
        onError: (error: any) => {
            Alert.alert('Registration Failed', error.message);
        },
    });

    const handleRegister = () => {
        if (!username || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        register({ variables: { username, email, password } });
    };

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Title style={styles.title}>Create Account</Title>
                    <TextInput
                        label="Username"
                        value={username}
                        onChangeText={setUsername}
                        mode="outlined"
                        autoCapitalize="none"
                        style={styles.input}
                    />
                    <TextInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        mode="outlined"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        style={styles.input}
                    />
                    <TextInput
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        mode="outlined"
                        secureTextEntry
                        style={styles.input}
                    />
                    <Button
                        mode="contained"
                        onPress={handleRegister}
                        loading={loading}
                        style={styles.button}
                    >
                        Register
                    </Button>
                    <View style={styles.footer}>
                        <Text>Already have an account? </Text>
                        <Link href="/(auth)/login" asChild>
                            <Button mode="text" compact>Login</Button>
                        </Link>
                    </View>
                </Card.Content>
            </Card>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    card: {
        padding: 10,
    },
    title: {
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 24,
    },
    input: {
        marginBottom: 15,
    },
    button: {
        marginTop: 10,
        paddingVertical: 5,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
});
