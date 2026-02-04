import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { recordsAPI } from '../services/api';

const RECORD_TYPES = [
    { key: 'PRESCRIPTION', label: 'Prescription', emoji: '💊' },
    { key: 'LAB_REPORT', label: 'Lab Report', emoji: '🔬' },
    { key: 'VACCINATION', label: 'Vaccination', emoji: '💉' },
    { key: 'SCAN_XRAY', label: 'Scan/X-Ray', emoji: '🩻' },
    { key: 'DISCHARGE_SUMMARY', label: 'Discharge Summary', emoji: '🏥' },
    { key: 'BILL_INVOICE', label: 'Bill/Invoice', emoji: '🧾' },
    { key: 'OTHER', label: 'Other', emoji: '📄' },
];

export default function UploadRecordScreen({ navigation }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [type, setType] = useState('PRESCRIPTION');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [uploading, setUploading] = useState(false);

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets?.[0]) {
                setSelectedFile(result.assets[0]);
                if (!title) {
                    setTitle(result.assets[0].name.replace(/\.[^/.]+$/, ''));
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets?.[0]) {
                setSelectedFile({
                    uri: result.assets[0].uri,
                    name: `image_${Date.now()}.jpg`,
                    mimeType: 'image/jpeg',
                    size: result.assets[0].fileSize || 0,
                });
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const takePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Camera access is needed to take photos');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets?.[0]) {
                setSelectedFile({
                    uri: result.assets[0].uri,
                    name: `photo_${Date.now()}.jpg`,
                    mimeType: 'image/jpeg',
                    size: result.assets[0].fileSize || 0,
                });
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            Alert.alert('Error', 'Please select a file');
            return;
        }

        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a title');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', {
                uri: selectedFile.uri,
                name: selectedFile.name,
                type: selectedFile.mimeType,
            });
            formData.append('type', type);
            formData.append('title', title);
            if (description) {
                formData.append('description', description);
            }

            await recordsAPI.upload(formData);
            Alert.alert('Success', 'Record uploaded successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to upload record');
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <ScrollView style={styles.container}>
            {/* File Selection */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select File</Text>

                {selectedFile ? (
                    <View style={styles.selectedFile}>
                        <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
                        <Text style={styles.fileSize}>{formatFileSize(selectedFile.size)}</Text>
                        <TouchableOpacity onPress={() => setSelectedFile(null)}>
                            <Text style={styles.removeFile}>✕</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.pickButtons}>
                        <TouchableOpacity style={styles.pickBtn} onPress={pickDocument}>
                            <Text style={styles.pickEmoji}>📄</Text>
                            <Text style={styles.pickLabel}>Browse Files</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.pickBtn} onPress={pickImage}>
                            <Text style={styles.pickEmoji}>🖼️</Text>
                            <Text style={styles.pickLabel}>Gallery</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.pickBtn} onPress={takePhoto}>
                            <Text style={styles.pickEmoji}>📷</Text>
                            <Text style={styles.pickLabel}>Camera</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Record Type */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Record Type</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.typeContainer}
                >
                    {RECORD_TYPES.map((item) => (
                        <TouchableOpacity
                            key={item.key}
                            style={[styles.typeChip, type === item.key && styles.typeChipActive]}
                            onPress={() => setType(item.key)}
                        >
                            <Text style={styles.typeEmoji}>{item.emoji}</Text>
                            <Text style={[styles.typeLabel, type === item.key && styles.typeLabelActive]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Title & Description */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Details</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Title *"
                    placeholderTextColor="#888"
                    value={title}
                    onChangeText={setTitle}
                />
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Description (optional)"
                    placeholderTextColor="#888"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                />
            </View>

            {/* Upload Button */}
            <TouchableOpacity
                style={[styles.uploadBtn, uploading && styles.uploadingBtn]}
                onPress={handleUpload}
                disabled={uploading}
            >
                {uploading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.uploadBtnText}>📤 Upload Record</Text>
                )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f1a',
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
        marginBottom: 16,
    },
    pickButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    pickBtn: {
        flex: 1,
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#333',
        borderStyle: 'dashed',
    },
    pickEmoji: {
        fontSize: 28,
        marginBottom: 8,
    },
    pickLabel: {
        color: '#888',
        fontSize: 12,
        fontWeight: '500',
    },
    selectedFile: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#667eea',
    },
    fileName: {
        flex: 1,
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    fileSize: {
        color: '#888',
        fontSize: 12,
        marginRight: 12,
    },
    removeFile: {
        color: '#ef4444',
        fontSize: 18,
        fontWeight: 'bold',
    },
    typeContainer: {
        gap: 10,
    },
    typeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
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
        fontWeight: '500',
    },
    typeLabelActive: {
        color: '#fff',
    },
    input: {
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontSize: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    uploadBtn: {
        backgroundColor: '#667eea',
        margin: 20,
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
    },
    uploadingBtn: {
        opacity: 0.7,
    },
    uploadBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
