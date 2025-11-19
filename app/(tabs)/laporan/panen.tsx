import { useLocalSearchParams, useRouter } from "expo-router";
import { FileDown, Plus } from "lucide-react-native";
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


interface Panen {
    tgl_panen: string;
    jenis_panen: string;
    jumlah: number;
    kualitas: string;
    id_tumbuhan: string | null;
    id_ternak: string | null;
}

export default function LaporanScreen() {
    const { gmail, nama } = useLocalSearchParams();
    const router = useRouter();
    const [panen, setPanen] = useState<Panen[]>([]);
    const [filteredPanen, setFilteredPanen] = useState<Panen[]>([]);
    const [loading, setLoading] = useState(true);

    // Dropdown options
    const periodeOptions = ["Hari ini", "Minggu ini", "Bulan ini", "Tahun ini"];
    const [selectedPeriode, setSelectedPeriode] = useState<string>(periodeOptions[0]);

    const fetchData = async () => {
        try {
            const response = await fetch(API_URLS.PANEN);
            const data = await response.json();
            setPanen(data);
            filterDataByPeriode(data, selectedPeriode);
        } catch (error) {
            Alert.alert("Error", "Gagal memuat data panen.");
        } finally {
            setLoading(false);
        }
    };

    // Filter data berdasarkan periode
    const filterDataByPeriode = (data: Panen[], periode: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const filtered = data.filter((item) => {
            const panenDate = new Date(item.tgl_panen);
            panenDate.setHours(0, 0, 0, 0);

            switch (periode) {
                case "Hari ini":
                    return panenDate.getTime() === today.getTime();

                case "Minggu ini":
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - today.getDay());
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 6);
                    return panenDate >= startOfWeek && panenDate <= endOfWeek;

                case "Bulan ini":
                    return (
                        panenDate.getMonth() === today.getMonth() &&
                        panenDate.getFullYear() === today.getFullYear()
                    );

                case "Tahun ini":
                    return panenDate.getFullYear() === today.getFullYear();

                default:
                    return true;
            }
        });

        setFilteredPanen(filtered);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterDataByPeriode(panen, selectedPeriode);
    }, [selectedPeriode]);

    const handleExportExcel = () => {
        Alert.alert("Export Excel", "Fitur export Excel akan segera tersedia");
    };

    const handleExportPDF = () => {
        Alert.alert("Export PDF", "Fitur export PDF akan segera tersedia");
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
                        style={[styles.navButton, styles.navButtonActive]}
                    >
                        <Text style={[styles.navText, styles.navTextActive]}>
                            Panen
                        </Text>
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
                        style={styles.navButton}
                        onPress={() =>
                            router.push({
                                pathname: "/(tabs)/laporan/pengiriman",
                                params: { gmail, nama },
                            })
                        }
                    >
                        <Text style={styles.navText}>Pengiriman</Text>
                    </TouchableOpacity>
                </View>

                {/* Header */}
                <View style={styles.headerSection}>
                    <Text style={styles.pageTitle}>Periode Laporan</Text>

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
                        Menampilkan {filteredPanen.length} data panen
                    </Text>
                </View>

                {/* Table Panen - Full Width */}
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
                                    <Text style={[styles.cell, styles.headerText, styles.tglCell]}>
                                        Tanggal Panen
                                    </Text>
                                    <Text style={[styles.cell, styles.headerText, styles.jenisCell]}>
                                        Jenis
                                    </Text>
                                    <Text style={[styles.cell, styles.headerText, styles.jumlahCell]}>
                                        Jumlah
                                    </Text>
                                    <Text style={[styles.cell, styles.headerText, styles.kualitasCell]}>
                                        Kualitas
                                    </Text>
                                    <Text style={[styles.cell, styles.headerText, styles.idCell]}>
                                        ID Tumbuhan
                                    </Text>
                                    <Text style={[styles.cell, styles.headerText, styles.idCell]}>
                                        ID Ternak
                                    </Text>
                                </View>

                                {/* Data */}
                                <ScrollView style={styles.dataScrollView}>
                                    {filteredPanen.length === 0 ? (
                                        <View style={styles.emptyState}>
                                            <Text style={styles.emptyText}>
                                                Tidak ada data panen untuk periode ini
                                            </Text>
                                        </View>
                                    ) : (
                                        filteredPanen.map((item, index) => (
                                            <View key={index} style={[styles.row, styles.dataRow]}>
                                                <Text style={[styles.cell, styles.tglCell]}>
                                                    {new Date(item.tgl_panen).toLocaleDateString("id-ID")}
                                                </Text>
                                                <Text style={[styles.cell, styles.jenisCell]}>
                                                    {item.jenis_panen}
                                                </Text>
                                                <Text style={[styles.cell, styles.jumlahCell]}>
                                                    {item.jumlah}
                                                </Text>
                                                <Text style={[styles.cell, styles.kualitasCell]}>
                                                    {item.kualitas}
                                                </Text>
                                                <Text style={[styles.cell, styles.idCell]}>
                                                    {item.id_tumbuhan ?? "-"}
                                                </Text>
                                                <Text style={[styles.cell, styles.idCell]}>
                                                    {item.id_ternak ?? "-"}
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
    tambahButton: {
        backgroundColor: "#2D2D2D",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 30,
        gap: 8,
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
    tglCell: { flex: 1.2 },
    jenisCell: { flex: 1.5 },
    jumlahCell: { flex: 1, textAlign: "center" },
    kualitasCell: { flex: 1.2 },
    idCell: { flex: 1, textAlign: "center" },
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