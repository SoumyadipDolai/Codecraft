import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Share,
    Alert,
} from 'react-native';
import { emergencyAPI, healthIdAPI } from '../services/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function EmergencyScreen({ navigation }) {
    const [emergencyData, setEmergencyData] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEmergencyData();
    }, []);

    const loadEmergencyData = async () => {
        try {
            const [cardRes, qrRes] = await Promise.all([
                emergencyAPI.getCard(),
                healthIdAPI.getWithQR(),
            ]);
            setEmergencyData(cardRes.data);
            setQrCode(qrRes.data);
        } catch (error) {
            console.log('Load emergency data error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        try {
            const message = `
🚨 EMERGENCY MEDICAL INFO 🚨

Name: ${emergencyData?.name}
Health ID: ${qrCode?.healthCode}
Blood Group: ${emergencyData?.bloodGroup || 'Not set'}

Allergies: ${(emergencyData?.allergies || []).join(', ') || 'None recorded'}

Emergency Contacts:
${(emergencyData?.emergencyContacts || []).map(c => `• ${c.name}: ${c.phone}`).join('\n') || 'None recorded'}

Powered by HealthVault
      `.trim();

            await Share.share({ message });
        } catch (error) {
            Alert.alert('Error', 'Failed to share emergency info');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Emergency Card */}
            <View style={styles.emergencyCard}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardEmoji}>🆘</Text>
                    <Text style={styles.cardTitle}>Emergency Card</Text>
                </View>

                <View style={styles.cardBody}>
                    <Text style={styles.patientName}>{emergencyData?.name}</Text>
                    <Text style={styles.healthCode}>{qrCode?.healthCode}</Text>

                    {/* Blood Group */}
                    <View style={styles.bloodGroupContainer}>
                        <Text style={styles.bloodGroupLabel}>Blood Group</Text>
                        <View style={styles.bloodGroupBadge}>
                            <Text style={styles.bloodGroupText}>
                                {emergencyData?.bloodGroup || '?'}
                            </Text>
                        </View>
                    </View>

                    {/* Allergies */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>⚠️ Allergies</Text>
                        <View style={styles.tagContainer}>
                            {(emergencyData?.allergies || []).length > 0 ? (
                                emergencyData.allergies.map((allergy, index) => (
                                    <View key={index} style={styles.allergyTag}>
                                        <Text style={styles.allergyText}>{allergy}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.noDataText}>No allergies recorded</Text>
                            )}
                        </View>
                    </View>

                    {/* Chronic Diseases */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>🩺 Chronic Conditions</Text>
                        <View style={styles.tagContainer}>
                            {(emergencyData?.chronicDiseases || []).length > 0 ? (
                                emergencyData.chronicDiseases.map((disease, index) => (
                                    <View key={index} style={styles.conditionTag}>
                                        <Text style={styles.conditionText}>{disease}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.noDataText}>None recorded</Text>
                            )}
                        </View>
                    </View>

                    {/* Emergency Contacts */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>📞 Emergency Contacts</Text>
                        {(emergencyData?.emergencyContacts || []).length > 0 ? (
                            emergencyData.emergencyContacts.map((contact, index) => (
                                <View key={index} style={styles.contactCard}>
                                    <Text style={styles.contactName}>{contact.name}</Text>
                                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                                    <Text style={styles.contactRelation}>{contact.relation}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noDataText}>No emergency contacts</Text>
                        )}
                    </View>
                </View>

                {/* QR Code Area */}
                <View style={styles.qrSection}>
                    <View style={styles.qrPlaceholder}>
                        <Text style={styles.qrText}>📱 QR Code</Text>
                        <Text style={styles.qrSubtext}>Scan to view emergency info</Text>
                    </View>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
                <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                    <Text style={styles.shareButtonText}>📤 Share Emergency Info</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Text style={styles.editButtonText}>✏️ Edit Information</Text>
                </TouchableOpacity>
            </View>

            {/* Info Note */}
            <View style={styles.infoNote}>
                <Text style={styles.infoNoteText}>
                    💡 This card can be shown to emergency responders or medical staff.
                    Keep your information updated for accurate emergency assistance.
                </Text>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f1a',
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#0f0f1a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#888',
        fontSize: 16,
    },
    emergencyCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#ef4444',
    },
    cardHeader: {
        backgroundColor: '#ef4444',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    cardEmoji: {
        fontSize: 24,
        marginRight: 8,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    cardBody: {
        padding: 20,
    },
    patientName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    healthCode: {
        fontSize: 14,
        color: '#667eea',
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 20,
    },
    bloodGroupContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    bloodGroupLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 8,
    },
    bloodGroupBadge: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#ef4444',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bloodGroupText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    section: {
        marginBottom: 20,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 10,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    allergyTag: {
        backgroundColor: '#fef2f2',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    allergyText: {
        color: '#dc2626',
        fontSize: 13,
        fontWeight: '500',
    },
    conditionTag: {
        backgroundColor: '#fef3c7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    conditionText: {
        color: '#d97706',
        fontSize: 13,
        fontWeight: '500',
    },
    noDataText: {
        color: '#666',
        fontSize: 13,
        fontStyle: 'italic',
    },
    contactCard: {
        backgroundColor: '#252542',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    contactName: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    contactPhone: {
        color: '#667eea',
        fontSize: 14,
        marginTop: 2,
    },
    contactRelation: {
        color: '#888',
        fontSize: 12,
        marginTop: 2,
    },
    qrSection: {
        padding: 20,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    qrPlaceholder: {
        width: 150,
        height: 150,
        backgroundColor: '#252542',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qrText: {
        fontSize: 24,
        color: '#fff',
    },
    qrSubtext: {
        fontSize: 11,
        color: '#888',
        marginTop: 8,
        textAlign: 'center',
    },
    actions: {
        marginTop: 20,
        gap: 12,
    },
    shareButton: {
        backgroundColor: '#667eea',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    shareButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    editButton: {
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    editButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    infoNote: {
        marginTop: 20,
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 16,
    },
    infoNoteText: {
        color: '#888',
        fontSize: 13,
        lineHeight: 20,
    },
});
