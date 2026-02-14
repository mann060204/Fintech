import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Headline } from 'react-native-paper';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'expo-router';

// Define Mutation
const CREATE_AGREEMENT = gql`
  mutation CreateAgreement($title: String!, $amount: Float!, $description: String, $creatorId: String!, $participantId: String!) {
    createAgreement(title: $title, amount: $amount, description: $description, creatorId: $creatorId, participantId: $participantId) {
      id
      status
    }
  }
`;

export default function CreateAgreementScreen() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [participantId, setParticipantId] = useState('');

    const [createAgreement, { loading }] = useMutation(CREATE_AGREEMENT, {
        onCompleted: () => {
            Alert.alert('Success', 'Agreement created successfully!');
            router.back();
        },
        onError: (error) => {
            Alert.alert('Error', error.message);
        },
    });

    const handleSubmit = () => {
        if (!title || !amount || !participantId) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        createAgreement({
            variables: {
                title,
                amount: parseFloat(amount),
                description,
                creatorId: "user1", // Mocked logged-in user
                participantId,
            },
        });
    };

    return (
        <View style={styles.container}>
            <Headline style={styles.header}>New Agreement</Headline>

            <TextInput
                label="Title"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
                mode="outlined"
            />

            <TextInput
                label="Amount (INR)"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
            />

            <TextInput
                label="Description"
                value={description}
                onChangeText={setDescription}
                style={styles.input}
                mode="outlined"
                multiline
            />

            <TextInput
                label="Participant ID (e.g., user2)"
                value={participantId}
                onChangeText={setParticipantId}
                style={styles.input}
                mode="outlined"
            />

            <Button
                mode="contained"
                onPress={handleSubmit}
                loading={loading}
                style={styles.button}
            >
                Create Agreement
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
    header: {
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        marginBottom: 15,
    },
    button: {
        marginTop: 10,
        paddingVertical: 5,
    },
});
