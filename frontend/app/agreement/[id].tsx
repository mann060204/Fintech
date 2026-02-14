import { useLocalSearchParams, Stack } from 'expo-router';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, Button, Card, Divider, Chip, ActivityIndicator, useTheme, TextInput, SegmentedButtons } from 'react-native-paper';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useState } from 'react';

const GET_AGREEMENT = gql`
  query GetAgreement($id: ID!) {
    getAgreement(id: $id) {
      id
      title
      description
      amount
      status
      creatorId
      participantId
    }
  }
`;

const VERIFY_PAYMENT = gql`
  mutation VerifyPayment($agreementId: ID!, $paymentId: String!, $provider: String!) {
    verifyPayment(agreementId: $agreementId, transactionId: $paymentId, provider: $provider) {
      id
      status
    }
  }
`;

export default function AgreementDetailsScreen() {
    const { id } = useLocalSearchParams();
    const theme = useTheme();
    const [transactionId, setTransactionId] = useState('');
    const [provider, setProvider] = useState('RAZORPAY');

    const { data, loading, error, refetch } = useQuery(GET_AGREEMENT, {
        variables: { id },
    });

    const [verifyPayment, { loading: paying }] = useMutation(VERIFY_PAYMENT, {
        onCompleted: () => {
            Alert.alert('Success', 'Payment verified successfully!');
            refetch();
        },
        onError: (err) => {
            Alert.alert('Error', err.message);
        },
    });

    const handlePayment = () => {
        if (!transactionId) {
            Alert.alert('Error', 'Please enter a Transaction ID');
            return;
        }
        verifyPayment({
            variables: {
                agreementId: id,
                paymentId: transactionId,
                provider: provider,
            },
        });
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;
    if (error) return <View style={styles.center}><Text>Error: {error.message}</Text></View>;

    const agreement = data.getAgreement;

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ title: agreement.title || 'Agreement Details' }} />

            <Card style={styles.card}>
                <Card.Title title={agreement.title} subtitle={`ID: ${agreement.id}`} />
                <Card.Content>
                    <View style={styles.row}>
                        <Text variant="titleLarge">₹{agreement.amount}</Text>
                        <Chip icon="information">{agreement.status}</Chip>
                    </View>

                    <Divider style={styles.divider} />

                    <Text variant="bodyMedium" style={styles.label}>Description:</Text>
                    <Text variant="bodyLarge">{agreement.description || 'No description provided.'}</Text>

                    <View style={styles.spacer} />

                    <Text variant="bodyMedium" style={styles.label}>Participants:</Text>
                    <Text>Creator: {agreement.creatorId || 'Unknown'}</Text>
                    <Text>Participant: {agreement.participantId || 'Unknown'}</Text>
                </Card.Content>

                <Card.Actions style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    {(agreement.status === 'CREATED' || agreement.status === 'PENDING') && (
                        <>
                            <TextInput
                                label="Transaction ID (e.g. pay_123 or fail_123)"
                                value={transactionId}
                                onChangeText={setTransactionId}
                                mode="outlined"
                                style={{ marginBottom: 10 }}
                            />
                            <SegmentedButtons
                                value={provider}
                                onValueChange={setProvider}
                                buttons={[
                                    { value: 'RAZORPAY', label: 'Razorpay' },
                                    { value: 'STRIPE', label: 'Stripe' },
                                ]}
                                style={{ marginBottom: 10 }}
                            />
                            <Button
                                mode="contained"
                                onPress={handlePayment}
                                loading={paying}
                                icon="credit-card"
                            >
                                Verify Payment
                            </Button>
                        </>
                    )}
                    {agreement.status === 'COMPLETED' && (
                        <Button mode="outlined" disabled icon="check">
                            Paid
                        </Button>
                    )}
                    {agreement.status === 'MOCK_DISPUTED' && (
                        <Button mode="outlined" disabled icon="alert" textColor="red">
                            Payment Failed/Disputed
                        </Button>
                    )}
                </Card.Actions>
            </Card>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
    },
    divider: {
        marginVertical: 15,
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#666',
    },
    spacer: {
        height: 15,
    },
});
