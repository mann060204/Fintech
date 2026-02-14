import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, Card, Title } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { gql, useMutation } from '@apollo/client';

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        username
        email
        trust_score
      }
    }
  }
`;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: async (data: any) => {
      await signIn(data.login.token, data.login.user);
    },
    onError: (error: any) => {
      Alert.alert('Login Failed', error.message);
    },
  });

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    login({ variables: { email, password } });
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Welcome Back</Title>
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
            onPress={handleLogin} 
            loading={loading} 
            style={styles.button}
          >
            Login
          </Button>
          <View style={styles.footer}>
            <Text>Don't have an account? </Text>
            <Link href="/(auth)/register" asChild>
              <Button mode="text" compact>Register</Button>
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
