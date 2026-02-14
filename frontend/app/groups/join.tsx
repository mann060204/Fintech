import { View, StyleSheet, TextInput } from 'react-native';
import { Button, Text, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { gql, useMutation } from '@apollo/client';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const JOIN_GROUP = gql`
  mutation AddMemberToGroup($groupId: ID!, $userId: String!) {
    addMemberToGroup(groupId: $groupId, userId: $userId) {
      id
      name
      members
    }
  }
`;

export default function JoinGroupScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [groupId, setGroupId] = useState('');
    const [joinGroup, { loading, error }] = useMutation(JOIN_GROUP, {
        onCompleted: () => {
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/groups');
            }
        },
        refetchQueries: ['ListGroups'],
        onError: (err) => {
            // alert(`Error joining group: ${err.message}`);
        }
    });

    const handleJoin = () => {
        if (!groupId) return;
        joinGroup({ variables: { groupId, userId: user?.id } });
    };

    return (
        <View style={styles.container}>
            <Text variant="headlineSmall" style={styles.title}>Join a Group</Text>
            <Text variant="bodyMedium" style={{ marginBottom: 20 }}>
                Enter the Group ID shared by your friend to join the expense group.
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Group ID (e.g., 123e4567-e89b...)"
                value={groupId}
                onChangeText={setGroupId}
                autoCapitalize="none"
            />

            {error && <HelperText type="error">{error.message}</HelperText>}

            <Button mode="contained" onPress={handleJoin} loading={loading} disabled={loading || !groupId}>
                Join Group
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
        marginBottom: 10,
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
