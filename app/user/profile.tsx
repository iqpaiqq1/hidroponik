import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    ScrollView,
    TextInput,
    Alert,
    ActivityIndicator,
} from "react-native";
import { API_URLS } from "../api/apiConfig";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        profile_picture: null,
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: "",
        email: "",
    });
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);
    const [token, setToken] = useState("");

    // ✅ AMBIL USER DATA DARI ASYNC STORAGE
    const getUserData = async () => {
        try {
            const user = await AsyncStorage.getItem("user");
            console.log('🟡 RAW USER DATA:', user);
            
            if (user) {
                const parsedUser = JSON.parse(user);
                console.log('🟡 PARSED USER:', parsedUser);
                
                // Cari ID yang benar (id_user atau id)
                const userID = parsedUser.id_user || parsedUser.id;
                console.log('🟡 USER ID:', userID);
                
                setUserId(userID);
                setToken(parsedUser.token || "");
                
                // Set profile dari AsyncStorage
                setProfile({
                    name: parsedUser.nama || "",
                    email: parsedUser.gmail || "",
                    profile_picture: parsedUser.profile_picture || null,
                });
                setEditData({
                    name: parsedUser.nama || "",
                    email: parsedUser.gmail || "",
                });
            } else {
                console.log('🔴 No user data in storage');
            }
        } catch (error) {
            console.log("🔴 GET USER DATA ERROR:", error);
        }
    };

    // ✅ FETCH PROFILE DARI API
    const getProfile = async () => {
        if (!userId) {
            console.log('🔴 No user ID available');
            return;
        }
        
        try {
            setLoading(true);
            console.log('🟡 FETCHING PROFILE:', `${API_URLS.USER}/${userId}`);
            
            const res = await fetch(`${API_URLS.USER}/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            console.log('🟡 RESPONSE STATUS:', res.status);
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            console.log('🟡 API RESPONSE:', data);
            
            // Handle different response structures
            const user = data.data ? data.data : data;
            console.log('🟡 USER DATA:', user);

            setProfile({
                name: user.nama || user.name || "",
                email: user.gmail || user.email || "",
                profile_picture: user.profile_picture || null,
            });
            setEditData({
                name: user.nama || user.name || "",
                email: user.gmail || user.email || "",
            });
        } catch (err) {
            console.log("🔴 GET PROFILE ERROR:", err);
            Alert.alert("Error", "Gagal memuat data profile");
        } finally {
            setLoading(false);
        }
    };

    // ✅ FUNGSI UPDATE PROFILE (INI YANG PENTING!)
    const updateProfile = async () => {
        // Validasi input
        if (!editData.name.trim() || !editData.email.trim()) {
            Alert.alert("Error", "Nama dan email tidak boleh kosong!");
            return;
        }

        // Validasi email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(editData.email.trim())) {
            Alert.alert("Error", "Format email tidak valid!");
            return;
        }

        if (!userId) {
            Alert.alert("Error", "User ID tidak ditemukan");
            return;
        }

        try {
            setLoading(true);
            
            // Data yang akan dikirim ke API
            const updateData = {
                nama: editData.name.trim(),
                gmail: editData.email.trim(),
            };

            console.log('🟢 ===== UPDATE PROFILE =====');
            console.log('URL:', `${API_URLS.USER}/${userId}`);
            console.log('User ID:', userId);
            console.log('Token:', token ? 'Available' : 'Missing');
            console.log('Data:', updateData);

            const res = await fetch(`${API_URLS.USER}/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updateData),
            });

            console.log('🟢 RESPONSE STATUS:', res.status);

            // Baca response sebagai text dulu
            const responseText = await res.text();
            console.log('🟢 RAW RESPONSE:', responseText);

            // Parse JSON
            let result;
            try {
                result = responseText ? JSON.parse(responseText) : {};
                console.log('🟢 PARSED RESPONSE:', result);
            } catch (parseError) {
                console.log('🔴 JSON PARSE ERROR:', parseError);
                result = { success: false, message: 'Invalid server response' };
            }

            // Cek apakah berhasil
            if (res.ok) {
                console.log('🟢 ===== UPDATE SUCCESS =====');
                
                // Update state lokal
                const updatedProfile = {
                    name: editData.name.trim(),
                    email: editData.email.trim(),
                    profile_picture: profile.profile_picture,
                };
                
                setProfile(updatedProfile);
                setIsEditing(false);
                
                // Update AsyncStorage
                try {
                    const currentUser = await AsyncStorage.getItem("user");
                    if (currentUser) {
                        const parsedUser = JSON.parse(currentUser);
                        const updatedUser = {
                            ...parsedUser,
                            nama: editData.name.trim(),
                            gmail: editData.email.trim(),
                        };
                        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
                        console.log('🟢 ASYNC STORAGE UPDATED:', updatedUser);
                    }
                } catch (storageError) {
                    console.log('🔴 STORAGE UPDATE ERROR:', storageError);
                }

                Alert.alert(
                    "Berhasil! ✅", 
                    "Profile berhasil diupdate!",
                    [{ text: "OK" }]
                );
            } else {
                // Gagal update
                console.log('🔴 UPDATE FAILED:', result);
                const errorMsg = result.message || result.error || `Server error: ${res.status}`;
                Alert.alert("Error ❌", errorMsg);
            }
        } catch (err) {
            console.log("🔴 ===== UPDATE ERROR =====");
            console.log("Error:", err);
            Alert.alert(
                "Error ❌", 
                "Gagal update profile. Cek koneksi internet kamu!"
            );
        } finally {
            setLoading(false);
        }
    };

    // ✅ HANDLE CANCEL EDIT
    const handleCancelEdit = () => {
        setEditData({
            name: profile.name,
            email: profile.email,
        });
        setIsEditing(false);
    };

    // ✅ LOAD DATA SAAT COMPONENT MOUNT
    useEffect(() => {
        getUserData();
    }, []);

    useEffect(() => {
        if (userId && token) {
            getProfile();
        }
    }, [userId, token]);

    // ✅ LOADING SCREEN
    if (loading && !profile.name) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4a2f1a" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => router.back()} 
                    style={styles.backButton}
                >
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Your Profile</Text>
                <View style={styles.headerPlaceholder} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.card}>
                    {/* PROFILE IMAGE */}
                    <Image
                        source={
                            profile.profile_picture
                                ? { uri: profile.profile_picture }
                                : { uri: "https://via.placeholder.com/120/cccccc/666666?text=User" }
                        }
                        style={styles.profileImage}
                    />

                    {/* NAMA FIELD */}
                    <Text style={styles.label}>Nama</Text>
                    {isEditing ? (
                        <TextInput
                            style={styles.textInput}
                            value={editData.name}
                            onChangeText={(text) => setEditData({...editData, name: text})}
                            placeholder="Masukkan nama Anda"
                            autoCapitalize="words"
                        />
                    ) : (
                        <Text style={styles.value}>{profile.name || "Belum ada nama"}</Text>
                    )}

                    {/* EMAIL FIELD */}
                    <Text style={styles.label}>Email</Text>
                    {isEditing ? (
                        <TextInput
                            style={styles.textInput}
                            value={editData.email}
                            onChangeText={(text) => setEditData({...editData, email: text})}
                            placeholder="Masukkan email Anda"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    ) : (
                        <Text style={styles.value}>{profile.email || "Belum ada email"}</Text>
                    )}

                    {/* BUTTONS */}
                    <View style={styles.buttonContainer}>
                        {isEditing ? (
                            <View style={styles.editButtons}>
                                <TouchableOpacity
                                    style={[styles.button, styles.saveButton]}
                                    onPress={updateProfile}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.buttonText}>💾 Save</Text>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={handleCancelEdit}
                                    disabled={loading}
                                >
                                    <Text style={styles.buttonText}>✖ Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={[styles.button, styles.editButton]}
                                onPress={() => setIsEditing(true)}
                            >
                                <Text style={styles.buttonText}>✏️ Edit Profile</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    backButton: {
        padding: 5,
    },
    backText: {
        fontSize: 16,
        color: '#4a2f1a',
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4a2f1a',
    },
    headerPlaceholder: {
        width: 40,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    card: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
        alignItems: "center",
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 20,
        backgroundColor: "#ddd",
        borderWidth: 3,
        borderColor: '#4a2f1a',
    },
    label: {
        fontSize: 15,
        fontWeight: "700",
        marginTop: 10,
        color: "#4a2f1a",
        alignSelf: "flex-start",
        marginBottom: 5,
    },
    value: {
        fontSize: 16,
        marginBottom: 10,
        color: "#333",
        alignSelf: "flex-start",
        paddingVertical: 5,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 10,
        width: '100%',
        backgroundColor: '#f9f9f9',
    },
    buttonContainer: {
        marginTop: 20,
        width: '100%',
    },
    editButtons: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'space-between',
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    editButton: {
        backgroundColor: "#4a2f1a",
    },
    saveButton: {
        backgroundColor: '#28a745',
    },
    cancelButton: {
        backgroundColor: '#6c757d',
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#4a2f1a",
        fontWeight: '500',
    },
});