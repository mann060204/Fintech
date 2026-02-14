import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Button, Text, Card, FAB, useTheme } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { gql, useQuery } from '@apollo/client';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const LIST_GROUPS = gql`
  query ListGroups($userId: String!) {
    listGroups(userId: $userId) {
      id
      name
      creatorId
      createdAt
    }
  }
`;

export default function GroupsScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const userId = user?.id || "";

    const { data, loading, error, refetch } = useQuery(LIST_GROUPS, {
        variables: { userId },
        skip: !userId
    });

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const renderItem = ({ item }: { item: any }) => (
        <Card style={styles.card} onPress={() => router.push(`/groups/${item.id}`)}>
            <Card.Title
                title={item.name}
                subtitle={`Created by: ${item.creatorId === userId ? 'You' : item.creatorId}`}
                left={(props) => <Card.Cover source={{ uri: `https://ui-avatars.com/api/?name=${item.name}` }} style={{ width: 40, height: 40, borderRadius: 20 }} />}
            />
        </Card>
    );

    return (
        <View style={styles.container}>
            {loading && !refreshing ? (
                <View style={styles.center}><Text>Loading Groups...</Text></View>
            ) : error ? (
                <View style={styles.center}><Text>Error loading groups: {error.message}</Text></View>
            ) : (
                <FlatList
                    data={data?.listGroups || []}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text>No groups found. Create one to split expenses!</Text>
                        </View>
                    }
                />
            )}

            <Link href="/groups/join" asChild>
                <FAB
                    icon="account-plus"
                    style={[styles.fab, { bottom: 80 }]}
                    label="Join Group"
                />
            </Link>

            <Link href="/groups/create" asChild>
                <FAB
                    icon="plus"
                    style={styles.fab}
                    label="New Group"
                />
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    list: {
        padding: 16,
    },
    card: {
        marginBottom: 12,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});
