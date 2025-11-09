import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MenuSidebar from "./sidebar";

export default function DashboardScreen() {
  const searchParams = useLocalSearchParams();
  const gmailRaw = searchParams.gmail;
  const namaRaw = searchParams.nama;
  const gmail = Array.isArray(gmailRaw) ? gmailRaw[0] : gmailRaw ?? "";
  const nama = Array.isArray(namaRaw) ? namaRaw[0] : namaRaw ?? "";

  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const user = await AsyncStorage.getItem("user");
      if (user) {
        const parsed = JSON.parse(user);
        router.replace({
          pathname: "/dashboard",
          params: { gmail: parsed.gmail, nama: parsed.nama },
        });
      }
    };
    checkUser();
  }, []);

  return (
    <View style={styles.container}>
      <MenuSidebar activeMenu="Dashboard" gmail={gmail} nama={nama} />
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Selamat Datang, {nama} 👋</Text>
        <Text style={styles.subText}>Email: {gmail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", backgroundColor: "#fdfaf2" },
  content: {
    flex: 1,
    padding: 30,
    backgroundColor: "#fdfaf2",
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
});
