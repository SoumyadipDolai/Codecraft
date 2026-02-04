import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { healthIdAPI, recordsAPI, remindersAPI } from '../services/api';

export default function DashboardScreen({ navigation }) {
    const { user } = useAuth();
    const [healthId, setHealthId] = useState(null);
    const [recordsCount, setRecordsCount] = useState(0);
    const [upcomingReminders, setUpcomingReminders] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [healthIdRes, recordsRes, remindersRes] = await Promise.all([
                healthIdAPI.get().catch(() => ({ data: null })),
                recordsAPI.getByType().catch(() => ({ data: [] })),
                remindersAPI.getUpcoming().catch(() => ({ data: [] })),
            ]);

            setHealthId(healthIdRes.data);
            setRecordsCount(recordsRes.data.reduce((acc, r) => acc + r._count, 0));
            setUpcomingReminders(remindersRes.data.slice(0, 3));
        } catch (error) {
            console.log('Dashboard load error:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const QuickActionCard = ({ emoji, title, subtitle, onPress, color }) => (
        <TouchableOpacity style={[styles.quickAction, { borderLeftColor: color }]} onPress={onPress}>
            <Text style={styles.quickActionEmoji}>{emoji}</Text>
            <View style={styles.quickActionText}>
                <Text style={styles.quickActionTitle}>{title}</Text>
                <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Welcome Header */}
            <View style={styles.header}>
                <Text style={styles.greeting}>Hello, {user?.firstName} 👋</Text>
                <Text style={styles.healthId}>
                    Health ID: <Text style={styles.healthIdCode}>{healthId?.healthCode || 'Loading...'}</Text>
                </Text>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{recordsCount}</Text>
                    <Text style={styles.statLabel}>Records</Text>
                </View>
                <View style={[styles.statCard, styles.statCardHighlight]}>
                    <Text style={styles.statNumber}>{upcomingReminders.length}</Text>
                    <Text style={styles.statLabel}>Today's Tasks</Text>
                </View>
            </View>

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
                <QuickActionCard
                    emoji="📤"
                    title="Upload Record"
                    subtitle="Add prescription/report"
                    color="#667eea"
                    onPress={() => navigation.navigate('UploadRecord')}
                />
                <QuickActionCard
                    emoji="🚨"
                    title="Emergency Card"
                    subtitle="View & share"
                    color="#ef4444"
                    onPress={() => navigation.navigate('Emergency')}
                />
                <QuickActionCard
                    emoji="💊"
                    title="Add Reminder"
                    subtitle="Medicine/Appointment"
                    color="#10b981"
                    onPress={() => navigation.navigate('Reminders')}
                />
                <QuickActionCard
                    emoji="📁"
                    title="My Records"
                    subtitle="View all documents"
                    color="#f59e0b"
                    onPress={() => navigation.navigate('Records')}
                />
            </View>

            {/* Upcoming Reminders */}
            {upcomingReminders.length > 0 && (
                <>
                    <Text style={styles.sectionTitle}>Upcoming Reminders</Text>
                    {upcomingReminders.map((reminder) => (
                        <View key={reminder.id} style={styles.reminderCard}>
                            <Text style={styles.reminderEmoji}>
                                {reminder.type === 'MEDICINE' ? '💊' : reminder.type === 'APPOINTMENT' ? '🏥' : '⏰'}
                            </Text>
                            <View style={styles.reminderInfo}>
                                <Text style={styles.reminderTitle}>{reminder.title}</Text>
                                <Text style={styles.reminderTime}>
                                    {new Date(reminder.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        </View>
                    ))}
                </>
            )}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f1a',
    },
    header: {
        padding: 20,
        paddingTop: 10,
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    healthId: {
        fontSize: 14,
        color: '#888',
    },
    healthIdCode: {
        color: '#667eea',
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 20,
        paddingTop: 0,
        gap: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    statCardHighlight: {
        backgroundColor: '#667eea',
    },
    statNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    statLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 12,
    },
    quickActionsGrid: {
        paddingHorizontal: 20,
    },
    quickAction: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
    },
    quickActionEmoji: {
        fontSize: 28,
        marginRight: 16,
    },
    quickActionText: {
        flex: 1,
    },
    quickActionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    quickActionSubtitle: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    reminderCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 10,
    },
    reminderEmoji: {
        fontSize: 24,
        marginRight: 12,
    },
    reminderInfo: {
        flex: 1,
    },
    reminderTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    reminderTime: {
        fontSize: 12,
        color: '#667eea',
        marginTop: 2,
    },
});
