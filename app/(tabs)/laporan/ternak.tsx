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
// INTERFACE KANDANG
// ======================
interface Kandang {
    id_kandang: number;
    nm_kandang: string;
    kapasitas: number;
    jumlah_hewan: number;
    jenis_hewan: string;
    Hasil_Produksi: string;
    Jml_produksi: number;
    keterangan: string | null;
}

export default function LaporanTernakScreen() {
    const { gmail, nama } = useLocalSearchParams();
    const router = useRouter();
    const [kandang, setKandang] = useState<Kandang[]>([]);
    const [filteredKandang, setFilteredKandang] = useState<Kandang[]>([]);
    const [loading, setLoading] = useState(true);

    // Dropdown options
    const periodeOptions = ["Semua Data", "Kapasitas < 50%", "Kapasitas 50-80%", "Kapasitas > 80%"];
    const [selectedPeriode, setSelectedPeriode] = useState<string>(periodeOptions[0]);

    const fetchData = async () => {
        try {
            const response = await fetch(API_URLS.KANDANG);
            const data = await response.json();
            setKandang(data);
            filterDataByPeriode(data, selectedPeriode);
        } catch (error) {
            Alert.alert("Error", "Gagal memuat data kandang.");
        } finally {
            setLoading(false);
        }
    };

    // Filter data berdasarkan periode (kapasitas)
    const filterDataByPeriode = (data: Kandang[], periode: string) => {
        const filtered = data.filter((item) => {
            const percentageUsed = (item.jumlah_hewan / item.kapasitas) * 100;

            switch (periode) {
                case "Kapasitas < 50%":
                    return percentageUsed < 50;

                case "Kapasitas 50-80%":
                    return percentageUsed >= 50 && percentageUsed <= 80;

                case "Kapasitas > 80%":
                    return percentageUsed > 80;

                case "Semua Data":
                default:
                    return true;
            }
        });

        setFilteredKandang(filtered);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterDataByPeriode(kandang, selectedPeriode);
    }, [selectedPeriode]);

    const handleExportExcel = () => {
        Alert.alert("Export Excel", "Fitur export Excel akan segera tersedia");
    };

    const handleExportPDF = () => {
        Alert.alert("Export PDF", "Fitur export PDF akan segera tersedia");
    };

    // Hitung persentase kapasitas
    const getCapacityPercentage = (jumlah: number, kapasitas: number): string => {
        const percentage = (jumlah / kapasitas) * 100;
        return `${percentage.toFixed(1)}%`;
    };

    // Warna status berdasarkan kapasitas
    const getCapacityColor = (jumlah: number, kapasitas: number): string => {
        const percentage = (jumlah / kapasitas) * 100;
        if (percentage < 50) return "#4CAF50"; // Hijau
        if (percentage <= 80) return "#FF9800"; // Orange
        return "#F44336"; // Merah
    };

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
                        style={[styles.navButton, styles.navButtonActive]}
                    >
                        <Text style={[styles.navText, styles.navTextActive]}>
                            Ternak
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.navButton}
                        onPress={() =>
                            router.push({
                                pathname: "/(tabs)/pengiriman/pengirimanDashboard",
                                params: { gmail, nama },
                            })
                        }
                    >
                        <Text style={styles.navText}>Pengiriman</Text>
                    </TouchableOpacity>
                </View>

                {/* Header */}
                <View style={styles.headerSection}>
                    <Text style={styles.pageTitle}>Laporan Data Kandang</Text>

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

                {/* Periode Dropdown */}
                <View style={styles.dropdownSection}>
                    <View style={styles.dropdownWrapper}>
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
                    <Text style={styles.resultCount}>
                        Menampilkan {filteredKandang.length} data kandang
                    </Text>
                </View>

                {/* Table Kandang - Full Width */}
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
                                    <Text style={[styles.cell, styles.headerText, styles.namaCell]}>
                                        Nama Kandang
                                    </Text>
                                    <Text style={[styles.cell, styles.headerText, styles.jenisCell]}>
                                        Jenis Hewan
                                    </Text>
                                    <Text style={[styles.cell, styles.headerText, styles.kapasitasCell]}>
                                        Kapasitas
                                    </Text>
                                    <Text style={[styles.cell, styles.headerText, styles.jumlahCell]}>
                                        Jumlah Hewan
                                    </Text>
                                    <Text style={[styles.cell, styles.headerText, styles.percentageCell]}>
                                        Penggunaan
                                    </Text>
                                    <Text style={[styles.cell, styles.headerText, styles.produksiCell]}>
                                        Hasil Produksi
                                    </Text>
                                    <Text style={[styles.cell, styles.headerText, styles.jumlahProduksiCell]}>
                                        Jumlah
                                    </Text>
                                    <Text style={[styles.cell, styles.headerText, styles.keteranganCell]}>
                                        Keterangan
                                    </Text>
                                </View>

                                {/* Data */}
                                <ScrollView style={styles.dataScrollView}>
                                    {filteredKandang.length === 0 ? (
                                        <View style={styles.emptyState}>
                                            <Text style={styles.emptyText}>
                                                Tidak ada data kandang untuk filter ini
                                            </Text>
                                        </View>
                                    ) : (
                                        filteredKandang.map((item, index) => (
                                            <View key={index} style={[styles.row, styles.dataRow]}>
                                                <Text style={[styles.cell, styles.idCell]}>
                                                    {item.id_kandang}
                                                </Text>
                                                <Text style={[styles.cell, styles.namaCell]}>
                                                    {item.nm_kandang}
                                                </Text>
                                                <Text style={[styles.cell, styles.jenisCell]}>
                                                    {item.jenis_hewan}
                                                </Text>
                                                <Text style={[styles.cell, styles.kapasitasCell]}>
                                                    {item.kapasitas}
                                                </Text>
                                                <Text style={[styles.cell, styles.jumlahCell]}>
                                                    {item.jumlah_hewan}
                                                </Text>
                                                <Text style={[
                                                    styles.cell,
                                                    styles.percentageCell,
                                                    { color: getCapacityColor(item.jumlah_hewan, item.kapasitas), fontWeight: "700" }
                                                ]}>
                                                    {getCapacityPercentage(item.jumlah_hewan, item.kapasitas)}
                                                </Text>
                                                <Text style={[styles.cell, styles.produksiCell]}>
                                                    {item.Hasil_Produksi}
                                                </Text>
                                                <Text style={[styles.cell, styles.jumlahProduksiCell]}>
                                                    {item.Jml_produksi}
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
    dropdownSection: {
        marginBottom: 20,
    },
    dropdownWrapper: {
        borderWidth: 2,
        borderColor: "#2D2D2D",
        borderRadius: 15,
        backgroundColor: "#fff",
        overflow: "hidden",
        marginBottom: 10,
    },
    picker: {
        color: "#333",
        fontSize: 16,
        paddingHorizontal: 15,
        paddingVertical: 12,
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
    idCell: { flex: 0.6, textAlign: "center" },
    namaCell: { flex: 1.5 },
    jenisCell: { flex: 1.2 },
    kapasitasCell: { flex: 0.8, textAlign: "center" },
    jumlahCell: { flex: 0.8, textAlign: "center" },
    percentageCell: { flex: 0.9, textAlign: "center" },
    produksiCell: { flex: 1.2 },
    jumlahProduksiCell: { flex: 0.8, textAlign: "center" },
    keteranganCell: { flex: 1.5 },
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