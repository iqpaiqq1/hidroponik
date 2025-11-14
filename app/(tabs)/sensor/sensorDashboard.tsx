import { router, useLocalSearchParams } from "expo-router";
import { Edit, Plus, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
            const tipe = activeTab === "ternak" ? "kandang" : "tanaman";

            const response = await fetch(`${API_URLS.SENSOR}?tipe=${tipe}`);

            // Kalau response rusak / bukan JSON → tidak crash
            let result;
            try {
                result = await response.json();
            } catch (e) {
                result = [];
            }

            // Backend bisa mengirim array langsung → aman
            if (Array.isArray(result)) {
                setSensors(result);
            }
            // Backend bisa mengirim { data: [...] } → aman
            else if (result && Array.isArray(result.data)) {
                setSensors(result.data);
            }
            // Jika format apapun → tetap tidak error
            else {
                setSensors([]);
            }

        } catch (error) {
            console.log("Error fetch:", error);
            setSensors([]);
        } finally {
            // PASTIKAN LOADING BERHENTI
            setLoading(false);
        }
    };


    useEffect(() => {
        setLoading(true);
        fetchData();
    }, [activeTab]);

    const handleAdd = async (newData: any) => {
        try {
            const response = await fetch(API_URLS.SENSOR, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newData),
            });

            const result = await response.json();
            if (result.success) {
                fetchData();
                setModalVisible(false);
                setSelectedSensor(undefined);
            } else {
                alert("Gagal menambah data: " + (result.message || "Error tidak diketahui"));
            }
        } catch (error) {
            alert("Server tidak merespons");
        }
    };

    const handleEdit = async (updatedData: any) => {
        if (!selectedSensor) {
            alert("Tidak ada sensor yang dipilih untuk diedit");
            return;
        }

        try {
            const response = await fetch(`${API_URLS.SENSOR}/${selectedSensor.id_sensor}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });

            const result = await response.json();
            if (result.success) {
                fetchData();
                setModalVisible(false);
                setSelectedSensor(undefined);
            } else {
                alert("Gagal memperbarui data: " + result.message);
            }
        } catch (error) {
            alert("Server tidak merespons");
        }
    };

    const handleDelete = async () => {
        if (!selectedSensor) {
            alert("Tidak ada sensor yang dipilih untuk dihapus");
            return;
        }

        try {
            const response = await fetch(`${API_URLS.SENSOR}/${selectedSensor.id_sensor}`, {
                method: "DELETE",
            });

            const result = await response.json();
            if (result.success) {
                fetchData();
                setDeleteVisible(false);
                setSelectedSensor(undefined);
            } else {
                alert("Gagal menghapus data");
            }
        } catch (error) {
            alert("Server tidak merespons");
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
                            Ternak
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === "tanaman" && styles.tabButtonActive]}
                        onPress={() => setActiveTab("tanaman")}
                    >
                        <Text style={[styles.tabText, activeTab === "tanaman" && styles.tabTextActive]}>
                            Tanaman
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Header Title and Add Button */}
                <View style={styles.headerRow}>
                    <Text style={styles.title}>
                        {activeTab === "ternak"
                            ? "Monitoring Kandang"
                            : "Monitoring Tanaman"}
                    </Text>
                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.deleteButton}>
                            <Trash2 size={18} color="#fff" />
                            <Text style={styles.buttonText}>Hapus</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.editButton}>
                            <Edit size={18} color="#fff" />
                            <Text style={styles.buttonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => {
                                setSelectedSensor(undefined);
                                setModalVisible(true);
                            }}
                        >
                            <Plus size={18} color="#fff" />
                            <Text style={styles.buttonText}>Tambah</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#4A7C2C" style={styles.loader} />
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
                                <Text style={[styles.cell, styles.headerCell, styles.statusCell]}>Status Kesehatan</Text>
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
                                    </View>
                                );
                            })}
                        </View>
                    </ScrollView>
                )}
            </View>

            <FormModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={selectedSensor ? handleEdit : handleAdd}
                initialData={selectedSensor}
                selectedSensor={selectedSensor}
                activeTab={activeTab}
            />

            <DeleteModal
                visible={deleteVisible}
                onClose={() => setDeleteVisible(false)}
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
    actionButtons: {
        flexDirection: "row",
        gap: 10,
    },
    deleteButton: {
        backgroundColor: "#2D2D2D",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    editButton: {
        backgroundColor: "#2D2D2D",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
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
    loader: {
        marginTop: 50,
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
        width: 120,
    },
    lokasiCell: {
        width: 130,
    },
    populasiCell: {
        width: 100,
    },
    suhuCell: {
        width: 100,
    },
    kelembapanCell: {
        width: 130,
    },
    produktivitasCell: {
        width: 140,
    },
    statusCell: {
        width: 150,
        alignItems: "center",
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
});