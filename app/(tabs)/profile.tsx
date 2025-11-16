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
import MenuSidebar from "./sidebar";
import { API_URLS } from "../api/apiConfig";

export default function ProfileScreen() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        profile_picture: null, // Ubah dari 'photo' ke 'profile_picture'
    });

    const token = "TOKEN_KAMU_DI_SINI";

    const getProfile = async () => {
        try {
            const res = await fetch(API_URLS.USER, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            setForm({
                name: data.nama, // Sesuaikan dengan response Laravel
                email: data.gmail, // Sesuaikan dengan response Laravel
                password: "",
                profile_picture: data.profile_picture, // Ambil dari field yang benar
            });
        } catch (err) {
            console.log("GET ERROR:", err);
        }
    };

    // UPDATE PROFILE
    const updateProfile = async () => {
        try {
            const res = await fetch(API_URLS.USER, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    nama: form.name,
                    gmail: form.email,
                    password: form.password || undefined, // Kirim password hanya jika diisi
                    profile_picture: form.profile_picture,
                }),
            });

            const result = await res.json();
            alert("Berhasil update profile!");
        } catch (err) {
            console.log("UPDATE ERROR:", err);
        }
    };

    useEffect(() => {
        getProfile();
    }, []);

    return (
        <View style={styles.container}>
            <MenuSidebar
                activeMenu="Your Profile"
                gmail={form.email}
                nama={form.name}
            />

            <ScrollView style={styles.content}>
                <Text style={styles.title}>Ubah / Ganti Profile di sini</Text>

                <View style={styles.card}>
                    {/* FOTO PROFILE - Ambil dari database */}
                    <Image
                        source={
                            form.profile_picture
                                ? { uri: form.profile_picture }
                                : { uri: "https://via.placeholder.com/120/cccccc/666666?text=User" }
                        }
                        style={styles.profileImage}
                    />

                    {/* TOMBOL UBAH FOTO */}
                    <TouchableOpacity style={styles.btnFoto}>
                        <Text style={styles.btnFotoText}>Ubah Foto</Text>
                    </TouchableOpacity>

                    {/* FORM */}
                    <View style={styles.form}>
                        <Text style={styles.label}>Nama</Text>
                        <TextInput
                            style={styles.input}
                            value={form.name}
                            onChangeText={(v) =>
                                setForm({ ...form, name: v })
                            }
                        />

                        <Text style={styles.label}>Gmail</Text>
                        <TextInput
                            style={styles.input}
                            value={form.email}
                            onChangeText={(v) =>
                                setForm({ ...form, email: v })
                            }
                        />

                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            secureTextEntry
                            placeholder="••••••••"
                            onChangeText={(v) =>
                                setForm({ ...form, password: v })
                            }
                        />

                        <TouchableOpacity
                            style={styles.btnSave}
                            onPress={updateProfile}
                        >
                            <Text style={styles.btnSaveText}>
                                Simpan Perubahan
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: "#f5f5f5",
    },
    content: {
        flex: 1,
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
        marginBottom: 10,
        backgroundColor: "#ddd",
    },
    btnFoto: {
        backgroundColor: "#5a8c36",
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 20,
    },
    btnFotoText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
    form: {
        width: "100%",
        marginTop: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 6,
        color: "#4a2f1a",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        backgroundColor: "#fafafa",
    },
    btnSave: {
        backgroundColor: "#4a2f1a",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },
    btnSaveText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
});