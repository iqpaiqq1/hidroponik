import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MenuSidebar from "./sidebarr";

const { width } = Dimensions.get("window");

// Tambahkan tipe user data
type UserData = {
    gmail: string;
    nama: string;
    role: string;
};

export default function DashboardPetugas() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const user = await AsyncStorage.getItem("user");
                if (user) {
                    const parsed = JSON.parse(user);

                    const role = parsed.role?.toLowerCase();
                    if (role !== "kurir") {
                        switch (role) {
                            case "user":
                                router.replace("/user/dashboardUser");
                                return;
                            case "kurir":
                                router.replace("/kurir/dashboardKurir");
                                return;
                            case "admin":
                                router.replace("/dashboard");
                                return;
                            default:
                                router.replace("/LoginScreen");
                                return;
                        }
                    }

                    setUserData({
                        gmail: parsed.gmail || "",
                        nama: parsed.nama || "",
                        role: parsed.role || "",
                    });
                } else {
                    router.replace("/LoginScreen");
                }
            } catch (e) {
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

    if (!userData) return null;

    return (
        <View style={styles.container}>
            <MenuSidebar activeMenu="Dashboard" gmail={userData.gmail} nama={userData.nama} />

            <View style={styles.content}>
                <Text style={styles.welcomeText}>Selamat Datang, {userData.nama} 👋</Text>
                <Text style={styles.subText}>Email: {userData.gmail}</Text>
                <Text style={styles.roleText}>Role: {userData.role}</Text>

                <View style={styles.dashboardContent}>
                    <Text style={styles.sectionTitle}>Dashboard Kurir</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: "#fdfaf2",
    },
    content: {
        flex: 1,
        padding: width < 380 ? 15 : 30,
        backgroundColor: "#fdfaf2",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
        fontSize: width < 380 ? 14 : 16,
        color: "#5b4c3a",
    },
    welcomeText: {
        fontSize: width < 380 ? 18 : 22,
        fontWeight: "bold",
        color: "#3e2a10",
    },
    subText: {
        marginTop: 8,
        color: "#5b4c3a",
        fontSize: width < 380 ? 13 : 16,
    },
    roleText: {
        marginTop: 4,
        color: "#5b4c3a",
        fontSize: width < 380 ? 12 : 14,
        fontStyle: "italic",
    },
    dashboardContent: {
        marginTop: 30,
    },
    sectionTitle: {
        fontSize: width < 380 ? 16 : 20,
        fontWeight: "600",
        color: "#3e2a10",
        marginBottom: 15,
    },
});
