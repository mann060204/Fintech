import { View, StyleSheet, FlatList, Share } from 'react-native';
import { Button, Text, Card, FAB, List, Divider } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useAuth } from '../../context/AuthContext';

const GET_GROUP = gql`
  query GetGroup($groupId: ID!) {
    getGroup(groupId: $groupId) {
      id
      name
      members
      expenses {
        id
        description
        amount
        payerId
      }
    }
    getGroupBalances(groupId: $groupId) {
        id
        debtorId
        creditorId
        amount
    }
  }
`;

const SETTLE_DEBT = gql`
  mutation SettleDebt($groupId: ID!, $debtorId: String!, $creditorId: String!, $amount: Float!) {
    settleDebt(groupId: $groupId, debtorId: $debtorId, creditorId: $creditorId, amount: $amount) {
      id
      description
      amount
    }
  }
`;

export default function GroupDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    // Ensure id is a string, handle array case
    const groupId = Array.isArray(id) ? id[0] : id;

    const { data, loading, error, refetch } = useQuery(GET_GROUP, {
        variables: { groupId },
        pollInterval: 5000 // Poll for updates
        // skip: !groupId
    });

    const [settleDebt, { loading: settling }] = useMutation(SETTLE_DEBT, {
        onCompleted: () => {
            alert('Debt settled! An expense has been recorded.');
            refetch();
        },
        onError: (err) => alert(`Error settling debt: ${err.message}`)
    });

    const handleShare = async () => {
        try {
            const result = await Share.share({
                message: `Join my group "${data?.getGroup?.name}"! Group ID: ${groupId}`,
            });
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleSettle = (debtorId: string, creditorId: string, amount: number) => {
        settleDebt({
            variables: { groupId, debtorId, creditorId, amount }
        });
    };

    if (loading && !data) return <View style={styles.center}><Text>Loading...</Text></View>;
    if (error) return <View style={styles.center}><Text>Error: {error.message}</Text></View>;
    if (!data?.getGroup) return <View style={styles.center}><Text>Group not found</Text></View>;

    const group = data.getGroup;
    const balances = data.getGroupBalances || [];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text variant="headlineMedium">{group.name}</Text>
                <Text variant="bodyMedium">{group.members.length} Members</Text>
                <Button icon="share-variant" mode="text" onPress={handleShare}>Invite</Button>
            </View>

            <Divider />

            {balances.length > 0 && (
                <View style={styles.section}>
                    <Text variant="titleMedium" style={{ marginBottom: 10 }}>Balances</Text>
                    {balances.map((balance: any) => (
                        <View key={balance.id} style={styles.balanceCard}>
                            <View style={{ flex: 1 }}>
                                <Text variant="bodyMedium">
                                    {balance.debtorId === user?.id ? "You" : balance.debtorId} owes {balance.creditorId === user?.id ? "You" : balance.creditorId}
                                </Text>
                                <Text variant="titleMedium" style={{ color: 'red' }}>₹{balance.amount}</Text>
                            </View>
                            {balance.debtorId === user?.id && (
                                <Button
                                    mode="contained"
                                    compact
                                    onPress={() => handleSettle(balance.debtorId, balance.creditorId, balance.amount)}
                                    loading={settling}
                                >
                                    Settle
                                </Button>
                            )}
                        </View>
                    ))}
                </View>
            )}

            <Divider />

            <View style={styles.section}>
                <Text variant="titleMedium" style={{ marginBottom: 10 }}>Expenses</Text>
                <FlatList
                    data={group.expenses || []}
                    keyExtractor={(item: any) => item.id}
                    renderItem={({ item }: { item: any }) => (
                        <List.Item
                            title={item.description}
                            description={`Paid by ${item.payerId === user?.id ? 'You' : item.payerId}`}
                            right={() => <Text style={{ alignSelf: 'center', fontWeight: 'bold' }}>₹{item.amount}</Text>}
                        />
                    )}
                    ListEmptyComponent={<Text style={{ padding: 20, textAlign: 'center', color: 'gray' }}>No expenses yet.</Text>}
                />
            </View>

            <FAB
                icon="plus"
                style={styles.fab}
                label="Expense"
                onPress={() => router.push(`/groups/${groupId}/add-expense`)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    section: {
        flex: 1,
        padding: 10,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
    section: {
        marginTop: 20,
    },
    balanceCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#ffebee',
        borderRadius: 5,
        marginBottom: 5,
    }
});
