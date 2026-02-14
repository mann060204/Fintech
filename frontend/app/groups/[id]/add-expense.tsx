import { View, StyleSheet, TextInput } from 'react-native';
import { Button, Text, HelperText } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { gql, useMutation } from '@apollo/client';
import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

const ADD_EXPENSE = gql`
  mutation AddExpense($groupId: ID!, $description: String!, $amount: Float!, $payerId: String!, $splits: [SplitInput]!) {
    addExpense(groupId: $groupId, description: $description, amount: $amount, payerId: $payerId, splits: $splits) {
      id
      amount
    }
  }
`;

export default function AddExpenseScreen() {
    const { id } = useLocalSearchParams(); // Group ID is passing as [id]
    const groupId = Array.isArray(id) ? id[0] : id;

    const router = useRouter();
    const { user } = useAuth();

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');

    const [addExpense, { loading, error }] = useMutation(ADD_EXPENSE, {
        onCompleted: () => {
            router.back();
        }
    });

    const handleAdd = () => {
        if (!amount || !description) return;

        // Simplified split: Payer pays all, split equally logic is backend/display concern for now.
        // Or we just send empty splits for MVP and assume equal split among group members implicitly.
        // Based on schema `splits: [SplitInput]!`, we need to provide it.
        // Let's just create a dummy "Self" split or similar for now to satisfy schema.

        const amountFloat = parseFloat(amount);

        addExpense({
            variables: {
                groupId,
                description,
                amount: amountFloat,
                payerId: user?.id,
                splits: [{ userId: user?.id, amount: amountFloat }] // MVP: Payer assumed 100% for now or split logic later
            }
        });
    };

    return (
        <View style={styles.container}>
            <Text variant="headlineSmall" style={styles.title}>Add Expense</Text>

            <TextInput
                style={styles.input}
                placeholder="Description (e.g., Dinner)"
                value={description}
                onChangeText={setDescription}
            />

            <TextInput
                style={styles.input}
                placeholder="Amount (₹)"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
            />

            {error && <HelperText type="error">{error.message}</HelperText>}

            <Button mode="contained" onPress={handleAdd} loading={loading} disabled={loading || !amount || !description}>
                Add Expense
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
