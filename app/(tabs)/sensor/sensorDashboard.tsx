import { router, useLocalSearchParams } from "expo-router";
import { Edit, Plus, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MenuSidebar from "../sidebar";
import DeleteModal from "./deleteModal";
import FormModal from "./formModal";
import { API_URLS } from "../../api/apiConfig";

interface Sensor {
    id_sensor: number;
    id_tanaman?: number;
    id_kandang?: number;
    lokasi: string;
    populasi: string;
    suhu: number;
    kelembapan: number;
    produktivitas: number;
    status_kesehatan: string;
    waktu: string;
}

export default function SensorScreen() {
    const { gmail, nama } = useLocalSearchParams();
    const [sensors, setSensors] = useState<Sensor[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSensor, setSelectedSensor] = useState<Sensor | undefined>(undefined);
    const [modalVisible, setModalVisible] = useState(false);
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [activeTab, setActiveTab] = useState<"ternak" | "tanaman">("ternak");

    const fetchData = async () => {
        setLoading(true);

        try {
            console.log(`📡 Fetching ALL sensor data...`);

            const response = await fetch(API_URLS.SENSOR);
            console.log("📡 Response status:", response.status);

            let result;
            try {
                result = await response.json();
                console.log("📦 Response data:", result);
            } catch (e) {
                console.log("❌ Parse error:", e);
                result = [];
            }

            let allData: Sensor[] = [];
            
            // Backend bisa mengirim array langsung
            if (Array.isArray(result)) {
                allData = result;
            }
            // Backend mengirim { data: [...] }
            else if (result && Array.isArray(result.data)) {
                allData = result.data;
            }

            console.log("📊 Total ALL data:", allData.length);

            // ✅ FILTER berdasarkan tab aktif
            let filteredData: Sensor[] = [];
            
            if (activeTab === "ternak") {
                // Tampilkan hanya data yang punya id_kandang
                filteredData = allData.filter((item: Sensor) => item.id_kandang && !item.id_tanaman);
                console.log("🐄 Filter KANDANG:", filteredData.length);
            } else {
                // Tampilkan hanya data yang punya id_tanaman
                filteredData = allData.filter((item: Sensor) => item.id_tanaman && !item.id_kandang);
                console.log("🌱 Filter TANAMAN:", filteredData.length);
            }

            setSensors(filteredData);

        } catch (error) {
            console.error("❌ Fetch error:", error);
            setSensors([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("🔄 Active tab changed to:", activeTab);
        fetchData();
    }, [activeTab]);

    const handleAdd = async (newData: any) => {
        try {
            console.log("➕ Adding sensor data:", newData);
            
            const response = await fetch(API_URLS.SENSOR, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newData),
            });

            console.log("📡 Add response status:", response.status);

            // Parse response
            let result;
            try {
                result = await response.json();
                console.log("📦 Add response data:", result);
            } catch (e) {
                result = { message: "Response tidak valid" };
            }

            // ✅ FIXED: Cek status HTTP, bukan result.success
            if (response.ok || response.status === 200 || response.status === 201) {
                console.log("✅ Data berhasil ditambahkan!");
                Alert.alert("Sukses", "Data sensor berhasil ditambahkan");
                setModalVisible(false);
                setSelectedSensor(undefined);
                fetchData(); // Refresh data
            } else {
                const errorMsg = result.message || result.error || "Gagal menambah data";
                console.log("❌ Add failed:", errorMsg);
                Alert.alert("Error", errorMsg);
            }
        } catch (error: any) {
            console.error("❌ Add error:", error);
            Alert.alert("Error", "Server tidak merespons: " + error.message);
        }
    };

    const handleEdit = async (updatedData: any) => {
        if (!selectedSensor) {
            Alert.alert("Error", "Tidak ada sensor yang dipilih untuk diedit");
            return;
        }

        try {
            console.log("✏️ Editing sensor:", selectedSensor.id_sensor);
            console.log("📤 Update data:", updatedData);

            const response = await fetch(`${API_URLS.SENSOR}/${selectedSensor.id_sensor}`, {
                method: "PUT",
                headers: { 
                    Accept: "application/json",
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify(updatedData),
            });

            console.log("📡 Edit response status:", response.status);

            let result;
            try {
                result = await response.json();
                console.log("📦 Edit response data:", result);
            } catch (e) {
                result = {};
            }

            // ✅ FIXED: Cek status HTTP
            if (response.ok || response.status === 200) {
                console.log("✅ Data berhasil diupdate!");
                Alert.alert("Sukses", "Data sensor berhasil diperbarui");
                setModalVisible(false);
                setSelectedSensor(undefined);
                fetchData();
            } else {
                const errorMsg = result.message || "Gagal memperbarui data";
                console.log("❌ Edit failed:", errorMsg);
                Alert.alert("Error", errorMsg);
            }
        } catch (error: any) {
            console.error("❌ Edit error:", error);
            Alert.alert("Error", "Server tidak merespons: " + error.message);
        }
    };

    const handleDelete = async () => {
        if (!selectedSensor) {
            Alert.alert("Error", "Tidak ada sensor yang dipilih untuk dihapus");
            return;
        }

        try {
            console.log("🗑️ Deleting sensor:", selectedSensor.id_sensor);

            const response = await fetch(`${API_URLS.SENSOR}/${selectedSensor.id_sensor}`, {
                method: "DELETE",
            });

            console.log("📡 Delete response status:", response.status);

            let result;
            try {
                result = await response.json();
                console.log("📦 Delete response data:", result);
            } catch (e) {
                result = {};
            }

            // ✅ FIXED: Cek status HTTP
            if (response.ok || response.status === 200) {
                console.log("✅ Data berhasil dihapus!");
                Alert.alert("Sukses", "Data sensor berhasil dihapus");
                setDeleteVisible(false);
                setSelectedSensor(undefined);
                fetchData();
            } else {
                const errorMsg = result.message || "Gagal menghapus data";
                console.log("❌ Delete failed:", errorMsg);
                Alert.alert("Error", errorMsg);
            }
        } catch (error: any) {
            console.error("❌ Delete error:", error);
            Alert.alert("Error", "Server tidak merespons: " + error.message);
        }
    };

    return (
        <View style={styles.container}>
            <MenuSidebar
                activeMenu="Sensor"
                gmail={Array.isArray(gmail) ? gmail[0] : gmail}
                nama={Array.isArray(nama) ? nama[0] : nama}
            />

            <View style={styles.content}>
                {/* Tab Navigation */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === "ternak" && styles.tabButtonActive]}
                        onPress={() => setActiveTab("ternak")}
                    >
                        <Text style={[styles.tabText, activeTab === "ternak" && styles.tabTextActive]}>
                            🐄 Ternak
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === "tanaman" && styles.tabButtonActive]}
                        onPress={() => setActiveTab("tanaman")}
                    >
                        <Text style={[styles.tabText, activeTab === "tanaman" && styles.tabTextActive]}>
                            🌱 Tanaman
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Header Title and Add Button */}
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.title}>
                            {activeTab === "ternak"
                                ? "Monitoring Kandang"
                                : "Monitoring Tanaman"}
                        </Text>
                        <Text style={styles.subtitle}>
                            Total Data: {sensors.length}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => {
                            setSelectedSensor(undefined);
                            setModalVisible(true);
                        }}
                    >
                        <Plus size={18} color="#fff" />
                        <Text style={styles.buttonText}>Tambah Data</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#4A7C2C" />
                        <Text style={styles.loadingText}>Memuat data...</Text>
                    </View>
                ) : sensors.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>📊 Belum ada data sensor</Text>
                        <Text style={styles.emptySubtext}>
                            Tekan tombol "Tambah Data" untuk menambahkan data pertama
                        </Text>
                    </View>
                ) : (
                    <ScrollView style={styles.tableContainer}>
                        <View style={styles.table}>
                            {/* Table Header */}
                            <View style={[styles.row, styles.tableHeader]}>
                                <Text style={[styles.cell, styles.headerCell, styles.idCell]}>
                                    {activeTab === "ternak" ? "ID Kandang" : "ID Tanaman"}
                                </Text>
                                <Text style={[styles.cell, styles.headerCell, styles.lokasiCell]}>Lokasi</Text>
                                <Text style={[styles.cell, styles.headerCell, styles.populasiCell]}>Populasi</Text>
                                <Text style={[styles.cell, styles.headerCell, styles.suhuCell]}>🌡️ Suhu</Text>
                                <Text style={[styles.cell, styles.headerCell, styles.kelembapanCell]}>💧 Kelembapan</Text>
                                <Text style={[styles.cell, styles.headerCell, styles.produktivitasCell]}>📈 Produktivitas</Text>
                                <Text style={[styles.cell, styles.headerCell, styles.statusCell]}>Status</Text>
                                <Text style={[styles.cell, styles.headerCell, styles.aksiCell]}>Aksi</Text>
                            </View>

                            {/* Data Rows */}
                            {sensors.map((item) => {
                                const isPerluPerhatian = item.status_kesehatan === "Perlu Perhatian";
                                const suhuColor = item.suhu > 26 ? "#FF9800" : "#333";
                                const kelembapanColor = item.kelembapan > 70 ? "#FF9800" : "#333";

                                return (
                                    <View
                                        key={item.id_sensor}
                                        style={[
                                            styles.row,
                                            styles.dataRow,
                                            isPerluPerhatian && styles.rowWarning
                                        ]}
                                    >
                                        <Text style={[styles.cell, styles.idCell]}>
                                            {activeTab === "ternak"
                                                ? `K-${String(item.id_kandang).padStart(3, '0')}`
                                                : `T-${String(item.id_tanaman).padStart(3, '0')}`}
                                        </Text>
                                        <Text style={[styles.cell, styles.lokasiCell]}>{item.lokasi}</Text>
                                        <Text style={[styles.cell, styles.populasiCell]}>{item.populasi}</Text>
                                        <Text style={[styles.cell, styles.suhuCell, { color: suhuColor }]}>
                                            {item.suhu}°C
                                        </Text>
                                        <Text style={[styles.cell, styles.kelembapanCell, { color: kelembapanColor }]}>
                                            {item.kelembapan}%
                                        </Text>
                                        <Text style={[styles.cell, styles.produktivitasCell]}>
                                            {item.produktivitas}%
                                        </Text>
                                        <View style={[styles.cell, styles.statusCell]}>
                                            <View style={[
                                                styles.statusBadge,
                                                isPerluPerhatian ? styles.statusPerluPerhatian : styles.statusSehat
                                            ]}>
                                                <Text style={styles.statusText}>{item.status_kesehatan}</Text>
                                            </View>
                                        </View>
                                        <View style={[styles.cell, styles.aksiCell]}>
                                            <TouchableOpacity
                                                style={styles.actionBtn}
                                                onPress={() => {
                                                    setSelectedSensor(item);
                                                    setModalVisible(true);
                                                }}
                                            >
                                                <Edit size={16} color="#fff" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.actionBtn, styles.deleteBtn]}
                                                onPress={() => {
                                                    setSelectedSensor(item);
                                                    setDeleteVisible(true);
                                                }}
                                            >
                                                <Trash2 size={16} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </ScrollView>
                )}
            </View>

            <FormModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setSelectedSensor(undefined);
                }}
                onSubmit={selectedSensor ? handleEdit : handleAdd}
                initialData={selectedSensor}
                selectedSensor={selectedSensor}
                activeTab={activeTab}
            />

            <DeleteModal
                visible={deleteVisible}
                onClose={() => {
                    setDeleteVisible(false);
                    setSelectedSensor(undefined);
                }}
                onConfirm={handleDelete}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: "#F5F1E8",
    },
    content: {
        flex: 1,
        padding: 20,
    },
    tabContainer: {
        flexDirection: "row",
        backgroundColor: "#5A8C3A",
        borderRadius: 35,
        padding: 5,
        marginBottom: 25,
        alignSelf: "center",
        minWidth: 300,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
    },
    tabButtonActive: {
        backgroundColor: "#4A3A2A",
    },
    tabText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "500",
    },
    tabTextActive: {
        fontWeight: "700",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
    },
    subtitle: {
        fontSize: 13,
        color: "#666",
        marginTop: 4,
    },
    addButton: {
        backgroundColor: "#2D2D2D",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 13,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 50,
    },
    loadingText: {
        marginTop: 10,
        color: "#666",
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 50,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 13,
        color: "#999",
        textAlign: "center",
    },
    tableContainer: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    table: {
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 10,
        overflow: "hidden",
    },
    row: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: "#E0E0E0",
        minHeight: 50,
    },
    tableHeader: {
        backgroundColor: "#F8F8F8",
    },
    dataRow: {
        backgroundColor: "#fff",
    },
    rowWarning: {
        backgroundColor: "#FFF8F0",
    },
    cell: {
        padding: 12,
        justifyContent: "center",
        fontSize: 13,
        color: "#333",
    },
    headerCell: {
        fontWeight: "600",
        color: "#555",
        fontSize: 13,
    },
    idCell: {
        width: 100,
    },
    lokasiCell: {
        width: 120,
    },
    populasiCell: {
        width: 90,
    },
    suhuCell: {
        width: 90,
    },
    kelembapanCell: {
        width: 120,
    },
    produktivitasCell: {
        width: 120,
    },
    statusCell: {
        width: 130,
        alignItems: "center",
    },
    aksiCell: {
        width: 100,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    statusBadge: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    statusSehat: {
        backgroundColor: "#4CAF50",
    },
    statusPerluPerhatian: {
        backgroundColor: "#E91E63",
    },
    statusText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    actionBtn: {
        backgroundColor: "#2D2D2D",
        padding: 6,
        borderRadius: 6,
    },
    deleteBtn: {
        backgroundColor: "#DC3545",
    },
});