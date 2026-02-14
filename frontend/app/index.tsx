import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Button, Text, Card, FAB, useTheme, Chip } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useState } from 'react';

import * as Location from 'expo-location';
import { useEffect } from 'react';

const LIST_AGREEMENTS = gql`
  query ListAgreements($userId: String!) {
    listAgreements(userId: $userId) {
      id
      title
      amount
      status
      description
    }
    getUserTrustScore(userId: $userId)
  }
`;

const CHECK_CONTEXT = gql`
  mutation CheckContext($latitude: Float!, $longitude: Float!) {
    checkLocationContext(latitude: $latitude, longitude: $longitude) {
      suppress_notifications
      reason
      location_type
    }
  }
`;

export default function HomeScreen() {
    const router = useRouter();
    const theme = useTheme();
    // Mock logged-in user
    const userId = "user1";

    const { data, loading, error, refetch } = useQuery(LIST_AGREEMENTS, {
        variables: { userId },
        onCompleted: (d) => { console.log('Home Data:', JSON.stringify(d, null, 2)); },
        onError: (e) => { console.log('Home Error:', JSON.stringify(e, null, 2)); },
    });

    const [checkContext, { data: contextData }] = useMutation(CHECK_CONTEXT);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            console.log('Location:', location);

            checkContext({
                variables: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                }
            });
        })();
    }, []);

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const renderItem = ({ item }: { item: any }) => (
        <Card style={styles.card} onPress={() => router.push(`/agreement/${item.id}`)}>
            <Card.Title
                title={item.title}
                subtitle={`₹${item.amount}`}
                right={(props) => <Chip mode="outlined" style={styles.chip}>{item.status}</Chip>}
            />
            <Card.Content>
                <Text numberOfLines={2} variant="bodyMedium">{item.description}</Text>
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text variant="headlineMedium" style={styles.title}>My Agreements</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>
                    Trust Score: {data?.getUserTrustScore ?? 'Loading...'}
                    {data?.getUserTrustScore >= 80 ? ' (Excellent)' :
                        data?.getUserTrustScore >= 50 ? ' (Good)' : ' (Needs Work)'}
                </Text>
                <Text variant="bodySmall" style={{ marginTop: 5, color: contextData?.checkLocationContext?.suppress_notifications ? 'red' : 'green' }}>
                    Context: {contextData ? (contextData.checkLocationContext.suppress_notifications ? `Blocked (${contextData.checkLocationContext.location_type})` : 'Active (Safe Zone)') : 'Checking Location...'}
                </Text>
                <Button mode="contained-tonal" icon="account-group" onPress={() => router.push('/groups')} style={{ marginTop: 10 }}>
                    My Groups
                </Button>
            </View>

            {loading && !refreshing ? (
                <View style={styles.center}><Text>Loading...</Text></View>
            ) : error ? (
                <View style={styles.center}><Text>Error: {error.message}</Text><Button onPress={() => refetch()}>Retry</Button></View>
            ) : (
                <FlatList
                    data={data?.listAgreements || []}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text>No agreements found.</Text>
                        </View>
                    }
                />
            )}

            <Link href="/create-agreement" asChild>
                <FAB
                    icon="plus"
                    style={styles.fab}
                    label="New Agreement"
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
    header: {
        padding: 20,
        backgroundColor: '#fff',
        elevation: 2,
    },
    title: {
        fontWeight: 'bold',
    },
    list: {
        padding: 16,
        paddingBottom: 80,
    },
    card: {
        marginBottom: 12,
    },
    chip: {
        marginRight: 16,
    },
    center: {
        padding: 20,
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});
