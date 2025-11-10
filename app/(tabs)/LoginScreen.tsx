import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";

import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { API_URLS } from "../api/apiConfig";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 768;

export default function LoginScreen() {
  const [gmail, setGmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
   
    setGmail("");
    setPassword("");

   
    AsyncStorage.removeItem("user");
  }, []);
  const handleLogin = async () => {
    if (!gmail || !password) {
      Alert.alert("Login Gagal", "Gmail dan password wajib diisi!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URLS.LOGIN, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ gmail, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Simpan data user ke AsyncStorage
        await AsyncStorage.setItem("user", JSON.stringify(data.data));

        Alert.alert("Login Berhasil!", `Selamat datang ${data.data.nama}!`);
        router.push({
          pathname: "/dashboard",
          params: { gmail: data.data.gmail, nama: data.data.nama },
        });
      } else {
        Alert.alert("Login Gagal", data.message || "Username atau password salah");
      }
    } catch (error) {
      console.error("Error login:", error);
      Alert.alert("Kesalahan", "Tidak dapat terhubung ke server");
    } finally {
      setLoading(false);
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={[styles.container, isSmallScreen && styles.containerMobile]}>
        <View style={[styles.loginPanel, isSmallScreen && styles.loginPanelMobile]}>
          <Text style={styles.title}>Login</Text>

          <TextInput
            style={styles.input}
            placeholder="Masukkan gmail"
            placeholderTextColor="#999"
            value={gmail}
            onChangeText={setGmail}
            autoCapitalize="none"
          />

          <View style={styles.passwordContainer}>
            <Text style={styles.passwordLabel}>Password</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Masukkan password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
                <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Text>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Belum punya akun? </Text>
            <TouchableOpacity onPress={() => router.push("/Register")}>
              <Text style={styles.registerLink}>Regis di sini!</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.welcomePanel, isSmallScreen && styles.welcomePanelMobile]}>
          <Text style={[styles.logoText, isSmallScreen && styles.logoTextMobile]}>
            Agrotech
          </Text>
          <Text style={[styles.welcomeText, isSmallScreen && styles.welcomeTextMobile]}>
            Welcome back! Let's keep growing together.
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
  loginPanel: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 40,
    justifyContent: "center",
    minWidth: 400,
  },
  loginPanelMobile: { minWidth: "100%", padding: 20, paddingTop: 40 },
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
  passwordContainer: { width: "100%", marginBottom: 25 },
  passwordLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  passwordInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  passwordInput: { flex: 1, height: 55, paddingHorizontal: 20, fontSize: 16 },
  eyeIcon: { padding: 15 },
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
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: { fontSize: 14, color: "#666" },
  registerLink: { fontSize: 14, color: "#4a7c2c", fontWeight: "600" },
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
