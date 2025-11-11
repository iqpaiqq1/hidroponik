import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MenuSidebar from "./sidebarr";

export default function DashboardPetugas() {
    const [userData, setUserData] = useState<{ gmail: string, nama: string, role: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const user = await AsyncStorage.getItem("user");
                if (user) {
                    const parsed = JSON.parse(user);

                    // Validasi role - hanya petugas yang bisa akses
                    if (parsed.role?.toLowerCase() !== "petugas") {
                        // Redirect ke halaman yang sesuai dengan role
                        const role = parsed.role?.toLowerCase();
                        switch (role) {
                            case "user":
                                router.replace("/user/dashboardUser");
                                break;
                            case "kurir":
                                router.replace("/kurir/dashboardKurir");
                                break;
                            case "admin":
                                router.replace("/dashboard");
                                break;
                            default:
                                router.replace("/LoginScreen");
                                break;
                        }
                        return;
                    }

                    setUserData({
                        gmail: parsed.gmail || "",
                        nama: parsed.nama || "",
                        role: parsed.role || ""
                    });
                } else {
                    // Tidak ada user di AsyncStorage, redirect ke login
                    router.replace("/LoginScreen");
                }
            } catch (error) {
                console.error("Error loading user data:", error);
                router.replace("/LoginScreen");
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4a7c2c" />
                <Text style={styles.loadingText}>Memuat data...</Text>
            </View>
        );
    }

    if (!userData) {
        return null; // Akan redirect di useEffect
    }

    return (
        <View style={styles.container}>
            <MenuSidebar activeMenu="Dashboard" gmail={userData.gmail} nama={userData.nama} />
            <View style={styles.content}>
                <Text style={styles.welcomeText}>Selamat Datang, {userData.nama} 👋</Text>
                <Text style={styles.subText}>Email: {userData.gmail}</Text>
                <Text style={styles.roleText}>Role: {userData.role}</Text>

                {/* Tambahkan konten dashboard petugas di sini */}
                <View style={styles.dashboardContent}>
                    <Text style={styles.sectionTitle}>Dashboard Petugas</Text>
                    {/* Konten lainnya */}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: "#fdfaf2"
    },
    content: {
        flex: 1,
        padding: 30,
        backgroundColor: "#fdfaf2",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fdfaf2",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#5b4c3a",
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#3e2a10",
    },
    subText: {
        marginTop: 8,
        color: "#5b4c3a",
        fontSize: 16,
    },
    roleText: {
        marginTop: 4,
        color: "#5b4c3a",
        fontSize: 14,
        fontStyle: "italic",
    },
    dashboardContent: {
        marginTop: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#3e2a10",
        marginBottom: 15,
    },
});