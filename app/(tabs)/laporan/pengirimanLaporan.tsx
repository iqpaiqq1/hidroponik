import { useLocalSearchParams, useRouter } from "expo-router";
import { FileDown } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Picker } from "@react-native-picker/picker";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MenuSidebar from "../sidebar";
import { API_URLS } from "../../api/apiConfig";

// ======================
// INTERFACE PENGIRIMAN
// ======================
interface Pengiriman {
    id_pengiriman: number;
    id_supply: number | null;
    id_panen: number | null;
    tgl_pengiriman: string;
    tujuan: string;
    jumlah_dikirim: number;
    status_pengiriman: "pending" | "selesai";
    id_kurir: number | null;
    keterangan: string | null;
}

export default function LaporanPengirimanScreen() {
    const { gmail, nama } = useLocalSearchParams();
    const router = useRouter();
    const [pengiriman, setPengiriman] = useState<Pengiriman[]>([]);
    const [filteredPengiriman, setFilteredPengiriman] = useState<Pengiriman[]>([]);
    const [loading, setLoading] = useState(true);

    // Dropdown options
    const periodeOptions = ["Hari ini", "Minggu ini", "Bulan ini", "Tahun ini", "Semua"];
    const statusOptions = ["Semua Status", "Pending", "Selesai"];

    const [selectedPeriode, setSelectedPeriode] = useState<string>(periodeOptions[0]);
    const [selectedStatus, setSelectedStatus] = useState<string>(statusOptions[0]);

    const fetchData = async () => {
        try {
            const response = await fetch(API_URLS.PENGIRIMAN);
            const data = await response.json();
            setPengiriman(data);
            filterData(data, selectedPeriode, selectedStatus);
        } catch (error) {
            Alert.alert("Error", "Gagal memuat data pengiriman.");
        } finally {
            setLoading(false);
        }
    };

    // Filter data berdasarkan periode dan status
    const filterData = (data: Pengiriman[], periode: string, status: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let filtered = data.filter((item) => {
            const pengirimanDate = new Date(item.tgl_pengiriman);
            pengirimanDate.setHours(0, 0, 0, 0);

            // Filter berdasarkan periode
            let periodeMatch = true;
            switch (periode) {
                case "Hari ini":
                    periodeMatch = pengirimanDate.getTime() === today.getTime();
                    break;

                case "Minggu ini":
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - today.getDay());
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 6);
                    periodeMatch = pengirimanDate >= startOfWeek && pengirimanDate <= endOfWeek;
                    break;

                case "Bulan ini":
                    periodeMatch =
                        pengirimanDate.getMonth() === today.getMonth() &&
                        pengirimanDate.getFullYear() === today.getFullYear();
                    break;

                case "Tahun ini":
                    periodeMatch = pengirimanDate.getFullYear() === today.getFullYear();
                    break;

                case "Semua":
                    periodeMatch = true;
                    break;
            }

            // Filter berdasarkan status
            let statusMatch = true;
            switch (status) {
                case "Pending":
                    statusMatch = item.status_pengiriman === "pending";
                    break;
                case "Selesai":
                    statusMatch = item.status_pengiriman === "selesai";
                    break;
                case "Semua Status":
                    statusMatch = true;
                    break;
            }

            return periodeMatch && statusMatch;
        });

        setFilteredPengiriman(filtered);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterData(pengiriman, selectedPeriode, selectedStatus);
    }, [selectedPeriode, selectedStatus]);

    const handleExportExcel = () => {
        Alert.alert("Export Excel", "Fitur export Excel akan segera tersedia");
    };

    const handleExportPDF = () => {
        Alert.alert("Export PDF", "Fitur export PDF akan segera tersedia");
    };

    // Fungsi untuk mendapatkan warna status
    const getStatusColor = (status: string): string => {
        return status === "selesai" ? "#4CAF50" : "#FF9800";
    };

    // Fungsi untuk format status
    const formatStatus = (status: string): string => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    // Hitung statistik
    const getStatistics = () => {
        const total = filteredPengiriman.length;
        const pending = filteredPengiriman.filter(
            (item) => item.status_pengiriman === "pending"
        ).length;
        const selesai = filteredPengiriman.filter(
            (item) => item.status_pengiriman === "selesai"
        ).length;
        const totalJumlah = filteredPengiriman.reduce(
            (sum, item) => sum + item.jumlah_dikirim,
            0
        );

        return { total, pending, selesai, totalJumlah };
    };

    const stats = getStatistics();

    return (
        <View style={styles.container}>
            <MenuSidebar
                activeMenu="Laporan"
                gmail={Array.isArray(gmail) ? gmail[0] : gmail}
                nama={Array.isArray(nama) ? nama[0] : nama}
            />

            <View style={styles.content}>
                {/* Top Navigation */}
                <View style={styles.topNavContainer}>
                    <TouchableOpacity
                        style={styles.navButton}
                        onPress={() =>
                            router.push({
                                pathname: "/(tabs)/laporan/panen",
                                params: { gmail, nama },
                            })
                        }
                    >
                        <Text style={styles.navText}>Panen</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.navButton}
                        onPress={() =>
                            router.push({
                                pathname: "/(tabs)/laporan/ternak",
                                params: { gmail, nama },
                            })
                        }
                    >
                        <Text style={styles.navText}>Ternak</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.navButton, styles.navButtonActive]}
                    >
                        <Text style={[styles.navText, styles.navTextActive]}>
                            Pengiriman
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Header */}
                <View style={styles.headerSection}>
                    <Text style={styles.pageTitle}>Laporan Pengiriman</Text>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={styles.exportButton}
                            onPress={handleExportExcel}
                        >
                            <FileDown size={18} color="#fff" />
                            <Text style={styles.buttonText}>Export Excel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.exportButton}
                            onPress={handleExportPDF}
                        >
                            <FileDown size={18} color="#fff" />
                            <Text style={styles.buttonText}>Export PDF</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Statistics Cards */}
                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, { backgroundColor: "#E3F2FD" }]}>
                        <Text style={styles.statNumber}>{stats.total}</Text>
                        <Text style={styles.statLabel}>Total Pengiriman</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: "#FFF3E0" }]}>
                        <Text style={[styles.statNumber, { color: "#FF9800" }]}>{stats.pending}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: "#E8F5E9" }]}>
                        <Text style={[styles.statNumber, { color: "#4CAF50" }]}>{stats.selesai}</Text>
                        <Text style={styles.statLabel}>Selesai</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: "#F3E5F5" }]}>
                        <Text style={[styles.statNumber, { color: "#9C27B0" }]}>{stats.totalJumlah}</Text>
                        <Text style={styles.statLabel}>Total Item</Text>
                    </View>
                </View>

                {/* Filter Dropdowns */}
                <View style={styles.dropdownSection}>
                    <View style={styles.dropdownRow}>
                        <View style={[styles.dropdownWrapper, { flex: 1, marginRight: 10 }]}>
                            <Text style={styles.dropdownLabel}>Periode:</Text>
                            <Picker
                                selectedValue={selectedPeriode}
                                onValueChange={(itemValue) =>
                                    setSelectedPeriode(itemValue)
                                }
                                style={styles.picker}
                                dropdownIconColor="#333"
                            >
                                {periodeOptions.map((option) => (
                                    <Picker.Item
                                        key={option}
                                        label={option}
                                        value={option}
                                    />
                                ))}
                            </Picker>
                        </View>

                        <View style={[styles.dropdownWrapper, { flex: 1 }]}>
                            <Text style={styles.dropdownLabel}>Status:</Text>
                            <Picker
                                selectedValue={selectedStatus}
                                onValueChange={(itemValue) =>
                                    setSelectedStatus(itemValue)
                                }
                                style={styles.picker}
                                dropdownIconColor="#333"
                            >
                                {statusOptions.map((option) => (
                                    <Picker.Item
                                        key={option}
                                        label={option}
                                        value={option}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>
                    <Text style={styles.resultCount}>
                        Menampilkan {filteredPengiriman.length} data pengiriman
                    </Text>
                </View>

                {/* Table Pengiriman - Full Width */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#4A7C2C" />
                    </View>
                ) : (
                    <View style={styles.tableOuterContainer}>
                        <View style={styles.tableContainer}>
                            <View style={styles.table}>
                                {/* Header */}
                                <View style={[styles.row, styles.tableHeader]}>
                                    <Text style={[styles.cell, styles.headerText, styles.idCell]}>
                                        ID
                                    </Text>
                                    <Text style={[styles.cell, styles.headerText, styles.tanggalCell]}>
                                        Tanggal
                                    </Text>
                                    <Text style={[styles.cell, styles.headerText, styles.tujuanCell]}>
                                        Tujuan
                                    </Text>
                                    <Text style={[styles.cell, styles.headerText, styles.jumlahCell]}>
                                        Jumlah
                                    </Text>
                                    <Text style={[styles.cell, styles.headerText, styles.statusCell]}>
                                        Status
                                    </Text>
                                    <Text style={[styles.cell, styles.headerText, styles.supplyCell]}>
                                        ID Supply
                                    </Text>
                                    <Text style={[styles.cell, styles.headerText, styles.panenCell]}>
                                        ID Panen
                                    </Text>
                                    <Text style={[styles.cell, styles.headerText, styles.kurirCell]}>
                                        ID Kurir
                                    </Text>
                                    <Text style={[styles.cell, styles.headerText, styles.keteranganCell]}>
                                        Keterangan
                                    </Text>
                                </View>

                                {/* Data */}
                                <ScrollView style={styles.dataScrollView}>
                                    {filteredPengiriman.length === 0 ? (
                                        <View style={styles.emptyState}>
                                            <Text style={styles.emptyText}>
                                                Tidak ada data pengiriman untuk filter ini
                                            </Text>
                                        </View>
                                    ) : (
                                        filteredPengiriman.map((item, index) => (
                                            <View key={index} style={[styles.row, styles.dataRow]}>
                                                <Text style={[styles.cell, styles.idCell]}>
                                                    {item.id_pengiriman}
                                                </Text>
                                                <Text style={[styles.cell, styles.tanggalCell]}>
                                                    {new Date(item.tgl_pengiriman).toLocaleDateString("id-ID")}
                                                </Text>
                                                <Text style={[styles.cell, styles.tujuanCell]}>
                                                    {item.tujuan}
                                                </Text>
                                                <Text style={[styles.cell, styles.jumlahCell]}>
                                                    {item.jumlah_dikirim}
                                                </Text>
                                                <View style={[styles.cell, styles.statusCell, { justifyContent: "center", alignItems: "center" }]}>
                                                    <View style={[
                                                        styles.statusBadge,
                                                        { backgroundColor: getStatusColor(item.status_pengiriman) }
                                                    ]}>
                                                        <Text style={styles.statusText}>
                                                            {formatStatus(item.status_pengiriman)}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <Text style={[styles.cell, styles.supplyCell]}>
                                                    {item.id_supply ?? "-"}
                                                </Text>
                                                <Text style={[styles.cell, styles.panenCell]}>
                                                    {item.id_panen ?? "-"}
                                                </Text>
                                                <Text style={[styles.cell, styles.kurirCell]}>
                                                    {item.id_kurir ?? "-"}
                                                </Text>
                                                <Text style={[styles.cell, styles.keteranganCell]}>
                                                    {item.keterangan ?? "-"}
                                                </Text>
                                            </View>
                                        ))
                                    )}
                                </ScrollView>
                            </View>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
}

// ======================
// STYLES
// ======================
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
    topNavContainer: {
        flexDirection: "row",
        backgroundColor: "#4A7C2C",
        borderRadius: 30,
        padding: 5,
        marginBottom: 20,
        alignSelf: "flex-start",
    },
    navButton: {
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
        marginHorizontal: 3,
    },
    navButtonActive: {
        backgroundColor: "#3D2817",
    },
    navText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "500",
    },
    navTextActive: {
        fontWeight: "700",
    },
    headerSection: {
        marginBottom: 20,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#333",
        marginBottom: 15,
    },
    buttonRow: {
        flexDirection: "row",
        gap: 12,
    },
    exportButton: {
        backgroundColor: "#2D2D2D",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 30,
        gap: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    statsContainer: {
        flexDirection: "row",
        gap: 15,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
        elevation: 2,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: "700",
        color: "#333",
    },
    statLabel: {
        fontSize: 12,
        color: "#666",
        marginTop: 5,
        textAlign: "center",
    },
    dropdownSection: {
        marginBottom: 20,
    },
    dropdownRow: {
        flexDirection: "row",
        marginBottom: 10,
    },
    dropdownWrapper: {
        borderWidth: 2,
        borderColor: "#2D2D2D",
        borderRadius: 15,
        backgroundColor: "#fff",
        overflow: "hidden",
    },
    dropdownLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#666",
        paddingHorizontal: 15,
        paddingTop: 8,
    },
    picker: {
        color: "#333",
        fontSize: 16,
        paddingHorizontal: 15,
    },
    resultCount: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    tableOuterContainer: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 15,
        elevation: 3,
        overflow: "hidden",
    },
    tableContainer: {
        flex: 1,
        padding: 15,
    },
    table: {
        borderWidth: 2,
        borderColor: "#E0E0E0",
        borderRadius: 10,
        overflow: "hidden",
        flex: 1,
    },
    row: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: "#E0E0E0",
        minHeight: 55,
        flex: 1,
    },
    tableHeader: {
        backgroundColor: "#4A7C2C",
    },
    headerText: {
        color: "#fff",
        fontWeight: "700",
    },
    dataRow: {
        backgroundColor: "#fff",
    },
    dataScrollView: {
        maxHeight: 500,
    },
    cell: {
        padding: 15,
        justifyContent: "center",
        fontSize: 14,
        color: "#333",
        borderRightWidth: 1,
        borderColor: "#E0E0E0",
        textAlignVertical: "center",
        flex: 1,
    },
    idCell: { flex: 0.5, textAlign: "center" },
    tanggalCell: { flex: 1 },
    tujuanCell: { flex: 1.5 },
    jumlahCell: { flex: 0.7, textAlign: "center" },
    statusCell: { flex: 1 },
    supplyCell: { flex: 0.7, textAlign: "center" },
    panenCell: { flex: 0.7, textAlign: "center" },
    kurirCell: { flex: 0.7, textAlign: "center" },
    keteranganCell: { flex: 1.5 },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "700",
    },
    emptyState: {
        padding: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyText: {
        fontSize: 16,
        color: "#999",
        fontStyle: "italic",
    },
});