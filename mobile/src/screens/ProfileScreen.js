import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Switch,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { emergencyAPI } from '../services/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function ProfileScreen() {
    const { user, logout, refreshUser } = useAuth();
    const [emergencyInfo, setEmergencyInfo] = useState({
        bloodGroup: '',
        allergies: [],
        chronicDiseases: [],
        emergencyContacts: [],
        organDonor: false,
    });
    const [newAllergy, setNewAllergy] = useState('');
    const [newDisease, setNewDisease] = useState('');
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadEmergencyInfo();
    }, []);

    const loadEmergencyInfo = async () => {
        try {
            const response = await emergencyAPI.get();
            setEmergencyInfo(response.data);
        } catch (error) {
            console.log('Load emergency info error:', error);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await emergencyAPI.update(emergencyInfo);
            Alert.alert('Success', 'Information updated!');
            setEditing(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const addAllergy = () => {
        if (newAllergy.trim()) {
            setEmergencyInfo({
                ...emergencyInfo,
                allergies: [...(emergencyInfo.allergies || []), newAllergy.trim()],
            });
            setNewAllergy('');
        }
    };

    const removeAllergy = (index) => {
        const allergies = [...emergencyInfo.allergies];
        allergies.splice(index, 1);
        setEmergencyInfo({ ...emergencyInfo, allergies });
    };

    const addDisease = () => {
        if (newDisease.trim()) {
            setEmergencyInfo({
                ...emergencyInfo,
                chronicDiseases: [...(emergencyInfo.chronicDiseases || []), newDisease.trim()],
            });
            setNewDisease('');
        }
    };

    const removeDisease = (index) => {
        const chronicDiseases = [...emergencyInfo.chronicDiseases];
        chronicDiseases.splice(index, 1);
        setEmergencyInfo({ ...emergencyInfo, chronicDiseases });
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout },
        ]);
    };

    return (
        <ScrollView style={styles.container}>
            {/* User Info */}
            <View style={styles.profileHeader}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </Text>
                </View>
                <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                <Text style={styles.healthCode}>{user?.healthCode}</Text>
            </View>

            {/* Blood Group */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Blood Group</Text>
                <View style={styles.bloodGroupGrid}>
                    {BLOOD_GROUPS.map((bg) => (
                        <TouchableOpacity
                            key={bg}
                            style={[
                                styles.bloodGroupBtn,
                                emergencyInfo.bloodGroup === bg && styles.bloodGroupBtnActive,
                            ]}
                            onPress={() => editing && setEmergencyInfo({ ...emergencyInfo, bloodGroup: bg })}
                            disabled={!editing}
                        >
                            <Text style={[
                                styles.bloodGroupText,
                                emergencyInfo.bloodGroup === bg && styles.bloodGroupTextActive,
                            ]}>{bg}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Allergies */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Allergies</Text>
                <View style={styles.tagContainer}>
                    {(emergencyInfo.allergies || []).map((allergy, index) => (
                        <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{allergy}</Text>
                            {editing && (
                                <TouchableOpacity onPress={() => removeAllergy(index)}>
                                    <Text style={styles.tagRemove}>×</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>
                {editing && (
                    <View style={styles.addRow}>
                        <TextInput
                            style={styles.addInput}
                            placeholder="Add allergy"
                            placeholderTextColor="#888"
                            value={newAllergy}
                            onChangeText={setNewAllergy}
                        />
                        <TouchableOpacity style={styles.addBtn} onPress={addAllergy}>
                            <Text style={styles.addBtnText}>+</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Chronic Diseases */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Chronic Conditions</Text>
                <View style={styles.tagContainer}>
                    {(emergencyInfo.chronicDiseases || []).map((disease, index) => (
                        <View key={index} style={[styles.tag, styles.diseaseTag]}>
                            <Text style={styles.tagText}>{disease}</Text>
                            {editing && (
                                <TouchableOpacity onPress={() => removeDisease(index)}>
                                    <Text style={styles.tagRemove}>×</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>
                {editing && (
                    <View style={styles.addRow}>
                        <TextInput
                            style={styles.addInput}
                            placeholder="Add condition"
                            placeholderTextColor="#888"
                            value={newDisease}
                            onChangeText={setNewDisease}
                        />
                        <TouchableOpacity style={styles.addBtn} onPress={addDisease}>
                            <Text style={styles.addBtnText}>+</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Organ Donor */}
            <View style={styles.section}>
                <View style={styles.switchRow}>
                    <View>
                        <Text style={styles.sectionTitle}>Organ Donor</Text>
                        <Text style={styles.switchSubtitle}>Display on emergency card</Text>
                    </View>
                    <Switch
                        value={emergencyInfo.organDonor}
                        onValueChange={(val) => editing && setEmergencyInfo({ ...emergencyInfo, organDonor: val })}
                        trackColor={{ false: '#333', true: '#667eea' }}
                        thumbColor={emergencyInfo.organDonor ? '#fff' : '#ccc'}
                        disabled={!editing}
                    />
                </View>
            </View>

            {/* Edit / Save Button */}
            <View style={styles.actions}>
                {editing ? (
                    <>
                        <TouchableOpacity
                            style={[styles.saveBtn, saving && styles.savingBtn]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={() => {
                                setEditing(false);
                                loadEmergencyInfo();
                            }}
                        >
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => setEditing(true)}
                    >
                        <Text style={styles.editBtnText}>✏️ Edit Information</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutBtnText}>🚪 Logout</Text>
            </TouchableOpacity>

            <View style={{ height: 60 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f1a',
    },
    profileHeader: {
        alignItems: 'center',
        padding: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a2e',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#667eea',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    email: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
    },
    healthCode: {
        fontSize: 13,
        color: '#667eea',
        marginTop: 8,
        fontWeight: '600',
    },
    section: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a2e',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 12,
    },
    bloodGroupGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    bloodGroupBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#1a1a2e',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#333',
    },
    bloodGroupBtnActive: {
        borderColor: '#ef4444',
        backgroundColor: '#ef4444',
    },
    bloodGroupText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#888',
    },
    bloodGroupTextActive: {
        color: '#fff',
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef2f2',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
    },
    diseaseTag: {
        backgroundColor: '#fef3c7',
    },
    tagText: {
        color: '#dc2626',
        fontSize: 13,
        fontWeight: '500',
    },
    tagRemove: {
        color: '#dc2626',
        fontSize: 18,
        marginLeft: 8,
        fontWeight: 'bold',
    },
    addRow: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 8,
    },
    addInput: {
        flex: 1,
        backgroundColor: '#1a1a2e',
        borderRadius: 8,
        padding: 12,
        color: '#fff',
        fontSize: 14,
    },
    addBtn: {
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: '#667eea',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addBtnText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: -2,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    switchSubtitle: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    actions: {
        padding: 20,
        gap: 12,
    },
    editBtn: {
        backgroundColor: '#667eea',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    editBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    saveBtn: {
        backgroundColor: '#10b981',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    savingBtn: {
        opacity: 0.7,
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelBtn: {
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    cancelBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    logoutBtn: {
        marginHorizontal: 20,
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ef4444',
    },
    logoutBtnText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: '600',
    },
});
