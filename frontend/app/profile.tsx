import { View, StyleSheet } from 'react-native';
import { Button, Text, Card, Avatar, List, Divider } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Avatar.Text size={80} label={user?.username?.substring(0, 2).toUpperCase() || "U"} />
                <Text variant="headlineMedium" style={styles.username}>{user?.username || "User"}</Text>
                <Text variant="bodyMedium" style={styles.email}>{user?.email || "email@example.com"}</Text>
            </View>

            <Card style={styles.card}>
                <Card.Content>
                    <List.Section>
                        <List.Subheader>Account Settings</List.Subheader>
                        <List.Item
                            title="Trust Score"
                            description={`${user?.trust_score ?? 50}`}
                            left={props => <List.Icon {...props} icon="shield-check" />}
                        />
                        <Divider />
                        <List.Item
                            title="Notifications"
                            description="Manage preferences"
                            left={props => <List.Icon {...props} icon="bell" />}
                        />
                        <Divider />
                        <List.Item
                            title="Privacy & Security"
                            left={props => <List.Icon {...props} icon="lock" />}
                        />
                    </List.Section>
                </Card.Content>
            </Card>

            <Button
                mode="contained"
                buttonColor="#ff4d4d"
                style={styles.logoutButton}
                icon="logout"
                onPress={handleLogout}
            >
                Logout
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 20,
    },
    username: {
        marginTop: 10,
        fontWeight: 'bold',
    },
    email: {
        color: 'gray',
    },
    card: {
        marginBottom: 30,
    },
    logoutButton: {
        paddingVertical: 6,
    }
});
