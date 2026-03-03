import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Button, Text, Card, FAB, useTheme, Chip, IconButton } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { LinearGradient } from 'expo-linear-gradient';

import * as Location from 'expo-location';

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
            <View style={styles.topSection}>
                <View style={styles.headerRow}>
                    <View>
                        <Text variant="titleMedium" style={{ color: theme.colors.secondary }}>Welcome back,</Text>
                        <Text variant="headlineSmall" style={styles.greetingName}>User1 👋</Text>
                    </View>
                </View>

                {/* Main Dashboard Card */}
                <LinearGradient
                    colors={['#5f33e1', '#3b1c9e']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.scoreCard}
                >
                    <View style={styles.scoreHeader}>
                        <Text style={styles.scoreTitle}>Total Trust Score</Text>
                        <Chip
                            textStyle={{ color: '#fff', fontSize: 12 }}
                            style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16 }}
                        >
                            {contextData?.checkLocationContext?.suppress_notifications ? 'Blocked' : 'Active'}
                        </Chip>
                    </View>

                    <View style={styles.scoreBody}>
                        <Text style={styles.scoreValue}>
                            {data?.getUserTrustScore ?? '--'}
                        </Text>
                        <Text style={styles.scoreLabel}>
                            / 100
                        </Text>
                    </View>

                    <Text style={styles.scoreStatus}>
                        {data && data.getUserTrustScore >= 80 ? 'Excellent Standing ✨' :
                            data && data.getUserTrustScore >= 50 ? 'Good Standing 👍' : 'Needs Improvement ⚠️'}
                    </Text>
                </LinearGradient>

                {/* Quick Actions */}
                <View style={styles.actionsRow}>
                    <View style={styles.actionItem}>
                        <IconButton
                            icon="account-group"
                            iconColor={theme.colors.primary}
                            containerColor={theme.colors.surfaceVariant}
                            size={28}
                            onPress={() => router.push('/groups')}
                        />
                        <Text style={styles.actionText}>Groups</Text>
                    </View>
                    <View style={styles.actionItem}>
                        <IconButton
                            icon="file-document-edit"
                            iconColor={theme.colors.primary}
                            containerColor={theme.colors.surfaceVariant}
                            size={28}
                            onPress={() => router.push('/create-agreement')}
                        />
                        <Text style={styles.actionText}>Draft Edit</Text>
                    </View>
                    <View style={styles.actionItem}>
                        <Link href="/create-agreement" asChild>
                            <IconButton
                                icon="plus"
                                iconColor={'#fff'}
                                containerColor={theme.colors.primary}
                                size={28}
                                style={styles.primaryActionBtn}
                            />
                        </Link>
                        <Text style={styles.actionText}>New</Text>
                    </View>
                </View>
            </View>

            <View style={styles.listSection}>
                <Text variant="titleMedium" style={styles.sectionTitle}>Recent Activity</Text>

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
                                <Text style={{ color: theme.colors.secondary }}>No agreements found.</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fe', // Fino off-white
    },
    topSection: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: '#f8f9fe',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    greetingName: {
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    scoreCard: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#5f33e1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
    },
    scoreHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    scoreTitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '500',
    },
    scoreBody: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    scoreValue: {
        color: '#fff',
        fontSize: 48,
        fontWeight: 'bold',
    },
    scoreLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 18,
        marginLeft: 4,
        fontWeight: '500',
    },
    scoreStatus: {
        color: '#fff',
        fontSize: 14,
        opacity: 0.9,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    actionItem: {
        alignItems: 'center',
    },
    actionText: {
        marginTop: 4,
        fontSize: 12,
        fontWeight: '500',
        color: '#1a1a1a',
    },
    primaryActionBtn: {
        shadowColor: '#5f33e1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    listSection: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 5,
    },
    sectionTitle: {
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 16,
    },
    list: {
        paddingBottom: 40,
    },
    card: {
        marginBottom: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    chip: {
        marginRight: 0,
        backgroundColor: '#f2f2f7',
    },
    center: {
        padding: 20,
        alignItems: 'center',
    },
});
