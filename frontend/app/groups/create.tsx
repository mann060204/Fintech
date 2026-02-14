import { View, StyleSheet, TextInput } from 'react-native';
import { Button, Text, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { gql, useMutation } from '@apollo/client';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const CREATE_GROUP = gql`
  mutation CreateGroup($name: String!, $creatorId: String!) {
    createGroup(name: $name, creatorId: $creatorId) {
      id
      name
    }
  }
`;

export default function CreateGroupScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [createGroup, { loading, error }] = useMutation(CREATE_GROUP, {
        onCompleted: () => {
            // Dismiss the screen to go back to the list
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/groups');
            }
        },
        refetchQueries: ['ListGroups'], // Ensure the list updates
        onError: (err) => {
            alert(`Error creating group: ${err.message}`);
        }
    });

    const handleCreate = () => {
        if (!name) return;
        createGroup({ variables: { name, creatorId: user?.id } });
    };

    return (
        <View style={styles.container}>
            <Text variant="headlineSmall" style={styles.title}>Create a New Group</Text>

            <TextInput
                style={styles.input}
                placeholder="Group Name (e.g., Goa Trip)"
                value={name}
                onChangeText={setName}
            />

            {error && <HelperText type="error">{error.message}</HelperText>}

            <Button mode="contained" onPress={handleCreate} loading={loading} disabled={loading || !name}>
                Create Group
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
        fontSize: 16,
    },
});
