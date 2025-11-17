import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    ScrollView,
} from "react-native";
import { API_URLS } from "../api/apiConfig";
import { router } from "expo-router";

export default function EditProfileScreen() {
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        profile_picture: null,
    });

    const userId = 1; // nanti ambil dari AsyncStorage
    const token = "TOKEN_KAMU_DI_SINI";

    // === GET PROFILE ===
    const getProfile = async () => {
        try {
            const res = await fetch(`${API_URLS.USER}/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            const user = data.data ? data.data : data;

            setProfile({
                name: user.nama,
                email: user.gmail,
                profile_picture: user.profile_picture,
            });
        } catch (err) {
            console.log("GET PROFILE ERROR:", err);
        }
    };

    // === UPDATE PROFILE ===
    const updateProfile = async () => {
        try {
            const res = await fetch(`${API_URLS.USER}/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    nama: profile.name,
                    gmail: profile.email,
                    profile_picture: profile.profile_picture,
                }),
            });

            const data = await res.json();
            console.log("UPDATE RESPONSE:", data);

            router.back(); // balik ke ProfileScreen
        } catch (error) {
            console.log("UPDATE ERROR:", error);
        }
    };

    useEffect(() => {
        getProfile();
    }, []);

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content}>
                <Text style={styles.title}>Edit Profile</Text>

                <View style={styles.card}>
                    <Image
                        source={
                            profile.profile_picture
                                ? { uri: profile.profile_picture }
                                : { uri: "https://via.placeholder.com/120/cccccc/666666?text=User" }
                        }
                        style={styles.profileImage}
                    />

                    {/* NAME */}
                    <Text style={styles.label}>Nama</Text>
                    <TextInput
                        value={profile.name}
                        onChangeText={(t) => setProfile({ ...profile, name: t })}
                        style={styles.input}
                    />

                    {/* EMAIL */}
                    <Text style={styles.label}>Gmail</Text>
                    <TextInput
                        value={profile.email}
                        onChangeText={(t) => setProfile({ ...profile, email: t })}
                        style={styles.input}
                    />

                    {/* BUTTON SIMPAN */}
                    <TouchableOpacity style={styles.btnSave} onPress={updateProfile}>
                        <Text style={styles.btnSaveText}>Save Changes</Text>
                    </TouchableOpacity>

                    {/* BUTTON CANCEL */}
                    <TouchableOpacity
                        style={styles.btnCancel}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.btnCancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

// === STYLE PERSIS SAMA PROFILE ===
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: "600",
        marginBottom: 20,
        color: "#4a2f1a",
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
    },
    label: {
        fontSize: 15,
        fontWeight: "700",
        marginTop: 10,
        color: "#4a2f1a",
        alignSelf: "flex-start",
    },
    input: {
        width: "100%",
        backgroundColor: "#eee",
        padding: 10,
        borderRadius: 8,
        fontSize: 16,
        marginTop: 5,
        marginBottom: 10,
    },
    btnSave: {
        marginTop: 20,
        backgroundColor: "#4a2f1a",
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 10,
    },
    btnSaveText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    btnCancel: {
        marginTop: 10,
        paddingVertical: 10,
    },
    btnCancelText: {
        color: "#4a2f1a",
        fontSize: 15,
        fontWeight: "600",
    },
});
