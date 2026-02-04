import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
    RefreshControl,
} from 'react-native';
import { remindersAPI } from '../services/api';

const REMINDER_TYPES = [
    { key: 'MEDICINE', label: 'Medicine', emoji: '💊' },
    { key: 'APPOINTMENT', label: 'Appointment', emoji: '🏥' },
    { key: 'CHECKUP', label: 'Checkup', emoji: '🩺' },
    { key: 'VACCINATION', label: 'Vaccination', emoji: '💉' },
    { key: 'OTHER', label: 'Other', emoji: '⏰' },
];

export default function RemindersScreen() {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [newReminder, setNewReminder] = useState({
        type: 'MEDICINE',
        title: '',
        description: '',
        scheduledAt: new Date().toISOString(),
        recurring: false,
    });

    useEffect(() => {
        loadReminders();
    }, []);

    const loadReminders = async () => {
        try {
            const response = await remindersAPI.getAll({ active: 'true' });
            setReminders(response.data);
        } catch (error) {
            console.log('Load reminders error:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadReminders();
        setRefreshing(false);
    };

    const handleCreateReminder = async () => {
        if (!newReminder.title) {
            Alert.alert('Error', 'Please enter a title');
            return;
        }

        try {
            await remindersAPI.create(newReminder);
            setModalVisible(false);
            setNewReminder({
                type: 'MEDICINE',
                title: '',
                description: '',
                scheduledAt: new Date().toISOString(),
                recurring: false,
            });
            loadReminders();
            Alert.alert('Success', 'Reminder created!');
        } catch (error) {
            Alert.alert('Error', 'Failed to create reminder');
        }
    };

    const handleComplete = async (id) => {
        try {
            await remindersAPI.complete(id);
            loadReminders();
        } catch (error) {
            Alert.alert('Error', 'Failed to complete reminder');
        }
    };

    const handleDelete = async (id) => {
        Alert.alert('Delete Reminder', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await remindersAPI.delete(id);
                        loadReminders();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete reminder');
                    }
                },
            },
        ]);
    };

    const getTypeEmoji = (type) => {
        const found = REMINDER_TYPES.find(t => t.key === type);
        return found ? found.emoji : '⏰';
    };

    const formatDateTime = (date) => {
        const d = new Date(date);
        return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    return (
        <View style={styles.container}>
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Today's Reminders */}
                <Text style={styles.sectionTitle}>Active Reminders</Text>

                {reminders.length === 0 && !loading ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>⏰</Text>
                        <Text style={styles.emptyTitle}>No Reminders</Text>
                        <Text style={styles.emptySubtitle}>
                            Add medicine or appointment reminders
                        </Text>
                    </View>
                ) : (
                    reminders.map((reminder) => (
                        <View key={reminder.id} style={styles.reminderCard}>
                            <View style={styles.reminderHeader}>
                                <Text style={styles.reminderEmoji}>{getTypeEmoji(reminder.type)}</Text>
                                <View style={styles.reminderInfo}>
                                    <Text style={styles.reminderTitle}>{reminder.title}</Text>
                                    <Text style={styles.reminderTime}>{formatDateTime(reminder.scheduledAt)}</Text>
                                </View>
                            </View>

                            {reminder.description && (
                                <Text style={styles.reminderDesc}>{reminder.description}</Text>
                            )}

                            <View style={styles.reminderActions}>
                                <TouchableOpacity
                                    style={styles.completeBtn}
                                    onPress={() => handleComplete(reminder.id)}
                                >
                                    <Text style={styles.completeBtnText}>✓ Done</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.deleteBtn}
                                    onPress={() => handleDelete(reminder.id)}
                                >
                                    <Text style={styles.deleteBtnText}>🗑️</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            {/* Add Reminder Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>New Reminder</Text>

                        {/* Type Selection */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.typeContainer}
                        >
                            {REMINDER_TYPES.map((type) => (
                                <TouchableOpacity
                                    key={type.key}
                                    style={[
                                        styles.typeChip,
                                        newReminder.type === type.key && styles.typeChipActive,
                                    ]}
                                    onPress={() => setNewReminder({ ...newReminder, type: type.key })}
                                >
                                    <Text style={styles.typeEmoji}>{type.emoji}</Text>
                                    <Text style={[
                                        styles.typeLabel,
                                        newReminder.type === type.key && styles.typeLabelActive,
                                    ]}>{type.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TextInput
                            style={styles.input}
                            placeholder="Reminder title"
                            placeholderTextColor="#888"
                            value={newReminder.title}
                            onChangeText={(text) => setNewReminder({ ...newReminder, title: text })}
                        />

                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Description (optional)"
                            placeholderTextColor="#888"
                            value={newReminder.description}
                            onChangeText={(text) => setNewReminder({ ...newReminder, description: text })}
                            multiline
                            numberOfLines={3}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.createBtn}
                                onPress={handleCreateReminder}
                            >
                                <Text style={styles.createBtnText}>Create</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f1a',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        padding: 16,
        paddingBottom: 12,
    },
    reminderCard: {
        backgroundColor: '#1a1a2e',
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 12,
        padding: 16,
    },
    reminderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reminderEmoji: {
        fontSize: 28,
        marginRight: 12,
    },
    reminderInfo: {
        flex: 1,
    },
    reminderTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    reminderTime: {
        fontSize: 13,
        color: '#667eea',
        marginTop: 4,
    },
    reminderDesc: {
        fontSize: 13,
        color: '#888',
        marginTop: 12,
        marginLeft: 40,
    },
    reminderActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 12,
        gap: 8,
    },
    completeBtn: {
        backgroundColor: '#10b981',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    completeBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },
    deleteBtn: {
        backgroundColor: '#333',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    deleteBtnText: {
        fontSize: 14,
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#888',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#667eea',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
    },
    fabText: {
        fontSize: 32,
        color: '#fff',
        marginTop: -2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1a1a2e',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
        textAlign: 'center',
    },
    typeContainer: {
        marginBottom: 20,
    },
    typeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#252542',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
    },
    typeChipActive: {
        backgroundColor: '#667eea',
    },
    typeEmoji: {
        fontSize: 16,
        marginRight: 6,
    },
    typeLabel: {
        color: '#888',
        fontSize: 13,
    },
    typeLabelActive: {
        color: '#fff',
    },
    input: {
        backgroundColor: '#252542',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontSize: 16,
        marginBottom: 12,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    cancelBtn: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#333',
        alignItems: 'center',
    },
    cancelBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
    createBtn: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#667eea',
        alignItems: 'center',
    },
    createBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
});
