import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Image,
} from 'react-native';
import { recordsAPI } from '../services/api';

const RECORD_TYPES = [
    { key: 'ALL', label: 'All', emoji: '📋' },
    { key: 'PRESCRIPTION', label: 'Prescriptions', emoji: '💊' },
    { key: 'LAB_REPORT', label: 'Lab Reports', emoji: '🔬' },
    { key: 'VACCINATION', label: 'Vaccinations', emoji: '💉' },
    { key: 'SCAN_XRAY', label: 'Scans/X-Rays', emoji: '🩻' },
    { key: 'DISCHARGE_SUMMARY', label: 'Discharge', emoji: '🏥' },
    { key: 'OTHER', label: 'Other', emoji: '📄' },
];

export default function RecordsScreen({ navigation }) {
    const [records, setRecords] = useState([]);
    const [selectedType, setSelectedType] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadRecords();
    }, [selectedType]);

    const loadRecords = async () => {
        try {
            const params = selectedType !== 'ALL' ? { type: selectedType } : {};
            const response = await recordsAPI.getAll(params);
            setRecords(response.data);
        } catch (error) {
            console.log('Load records error:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadRecords();
        setRefreshing(false);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getTypeEmoji = (type) => {
        const found = RECORD_TYPES.find(t => t.key === type);
        return found ? found.emoji : '📄';
    };

    return (
        <View style={styles.container}>
            {/* Type Filter */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterContainer}
                contentContainerStyle={styles.filterContent}
            >
                {RECORD_TYPES.map((type) => (
                    <TouchableOpacity
                        key={type.key}
                        style={[
                            styles.filterChip,
                            selectedType === type.key && styles.filterChipActive,
                        ]}
                        onPress={() => setSelectedType(type.key)}
                    >
                        <Text style={styles.filterEmoji}>{type.emoji}</Text>
                        <Text style={[
                            styles.filterLabel,
                            selectedType === type.key && styles.filterLabelActive,
                        ]}>
                            {type.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Records List */}
            <ScrollView
                style={styles.listContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {records.length === 0 && !loading ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>📁</Text>
                        <Text style={styles.emptyTitle}>No Records Found</Text>
                        <Text style={styles.emptySubtitle}>
                            Upload your first medical record to get started
                        </Text>
                        <TouchableOpacity
                            style={styles.uploadButton}
                            onPress={() => navigation.navigate('UploadRecord')}
                        >
                            <Text style={styles.uploadButtonText}>Upload Record</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    records.map((record) => (
                        <TouchableOpacity key={record.id} style={styles.recordCard}>
                            <View style={styles.recordIcon}>
                                <Text style={styles.recordEmoji}>{getTypeEmoji(record.type)}</Text>
                            </View>
                            <View style={styles.recordInfo}>
                                <Text style={styles.recordTitle} numberOfLines={1}>{record.title}</Text>
                                <Text style={styles.recordMeta}>
                                    {formatDate(record.createdAt)} • {formatFileSize(record.fileSize)}
                                </Text>
                            </View>
                            <Text style={styles.recordArrow}>›</Text>
                        </TouchableOpacity>
                    ))
                )}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* FAB - Upload */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('UploadRecord')}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f1a',
    },
    filterContainer: {
        maxHeight: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a2e',
    },
    filterContent: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: '#667eea',
    },
    filterEmoji: {
        fontSize: 14,
        marginRight: 6,
    },
    filterLabel: {
        color: '#888',
        fontSize: 13,
        fontWeight: '500',
    },
    filterLabelActive: {
        color: '#fff',
    },
    listContainer: {
        flex: 1,
        padding: 16,
    },
    recordCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    recordIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#252542',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    recordEmoji: {
        fontSize: 24,
    },
    recordInfo: {
        flex: 1,
    },
    recordTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    recordMeta: {
        fontSize: 12,
        color: '#888',
    },
    recordArrow: {
        fontSize: 24,
        color: '#666',
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 80,
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
        textAlign: 'center',
        marginBottom: 24,
    },
    uploadButton: {
        backgroundColor: '#667eea',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
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
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    fabText: {
        fontSize: 32,
        color: '#fff',
        marginTop: -2,
    },
});
