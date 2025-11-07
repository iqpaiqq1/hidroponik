import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    Dimensions,
    StyleSheet,
    ActivityIndicator,
} from "react-native";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 768;

export default function RegisterScreen() {
    const [nama, setNama] = useState("");
    const [username, setUsername] = useState("");
    const [gmail, setGmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("User");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async () => {
        if (!nama || !username || !gmail || !password) {
            Alert.alert("Gagal", "Semua kolom wajib diisi!");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("http://192.168.0.144:8000/api/user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    nama,
                    username,
                    password,
                    gmail,
                    role,
                }),
            });

            const data = await response.json();
            console.log("Response:", data);

            if (response.ok) {
                Alert.alert("Berhasil", "Registrasi berhasil! Silakan login.");
                router.push("/LoginScreen");
            } else {
                Alert.alert("Gagal", data.message || "Registrasi gagal");
            }
        } catch (error) {
            console.error("Error:", error);
            Alert.alert("Kesalahan", "Tidak dapat terhubung ke server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={[styles.container, isSmallScreen && styles.containerMobile]}>
                <View style={[styles.registerPanel, isSmallScreen && styles.registerPanelMobile]}>
                    <Text style={styles.title}>Register</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Nama lengkap"
                        placeholderTextColor="#999"
                        value={nama}
                        onChangeText={setNama}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                        placeholderTextColor="#999"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Gmail"
                        placeholderTextColor="#999"
                        value={gmail}
                        onChangeText={setGmail}
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#999"
                        secureTextEntry={true}
                        value={password}
                        onChangeText={setPassword}
                    />

                    <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Daftar</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Sudah punya akun? </Text>
                        <TouchableOpacity onPress={() => router.push("/LoginScreen")}>
                            <Text style={styles.loginLink}>Login di sini!</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.welcomePanel, isSmallScreen && styles.welcomePanelMobile]}>
                    <Text style={[styles.logoText, isSmallScreen && styles.logoTextMobile]}>
                        Agrotech
                    </Text>
                    <Text style={[styles.welcomeText, isSmallScreen && styles.welcomeTextMobile]}>
                        Join us and grow with technology!
                    </Text>
                    <Text style={styles.copyright}>
                        © 2025 Agrotech. All rights reserved.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: { flexGrow: 1 },
    container: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: "#f5f5f5",
        minHeight: height,
    },
    containerMobile: { flexDirection: "column" },
    registerPanel: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 40,
        justifyContent: "center",
        minWidth: 400,
    },
    registerPanelMobile: { minWidth: "100%", padding: 20, paddingTop: 40 },
    welcomePanel: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
        backgroundColor: "#6ba34d",
        minWidth: 400,
    },
    welcomePanelMobile: {
        minWidth: "100%",
        padding: 40,
        paddingVertical: 60,
        minHeight: 300,
    },
    title: { fontSize: 32, fontWeight: "600", marginBottom: 30, color: "#333" },
    input: {
        width: "100%",
        height: 55,
        borderColor: "#ddd",
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 20,
        marginBottom: 20,
        fontSize: 16,
        backgroundColor: "#fff",
    },
    button: {
        width: "100%",
        height: 55,
        backgroundColor: "#4a7c2c",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
        marginBottom: 20,
    },
    buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
    loginContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    loginText: { fontSize: 14, color: "#666" },
    loginLink: { fontSize: 14, color: "#4a7c2c", fontWeight: "600" },
    logoText: {
        fontSize: 48,
        fontWeight: "bold",
        color: "#fff",
        fontStyle: "italic",
        marginBottom: 20,
    },
    logoTextMobile: { fontSize: 36 },
    welcomeText: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        marginBottom: 40,
    },
    welcomeTextMobile: { fontSize: 20 },
    copyright: { position: "absolute", bottom: 30, fontSize: 12, color: "#fff" },
});
