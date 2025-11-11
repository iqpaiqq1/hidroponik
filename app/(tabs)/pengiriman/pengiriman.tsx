import { useLocalSearchParams } from "expo-router";
import { Edit, Plus, Search, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Picker } from "@react-native-picker/picker";
import FormModal from "./formModal";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import MenuSidebar from "../sidebar";
import { API_URLS } from "../../api/apiConfig";

interface Pengiriman {
    id_pengiriman: number;
    tanggal: string;
    produk: string;
    jumlah: number;
    berat: number;
    tujuan: string;
    status: string;
}

export default function DashboardScreen() {
    const { gmail, nama } = useLocalSearchParams();
    const [pengiriman, setPengiriman] = useState<Pengiriman[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const dateOptions = ["Hari Ini", "Bulan Ini", "Tahun Ini"];
    const [selectedDate, setSelectedDate] = useState<string>(dateOptions[0]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Pengiriman | null>(null);


    // Data untuk "5 Produk Terbanyak Terkirim"
    const topProducts = [
        { name: "Selada Hijau", quantity: "1 Kuintal" },
        { name: "Kangkung Air", quantity: "1 Kuintal" },
        { name: "Omega 3 - A", quantity: "1 Kuintal" }
    ];

    const fetchData = async () => {
        try {
            const response = await fetch(API_URLS.PENGIRIMAN);
            const data = await response.json();
            setPengiriman(data);
        } catch (error) {
            alert("Gagal memuat data pengiriman");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    
    const handleDelete = async (id: number) => {
        Alert.alert(
            "Konfirmasi Hapus",
            "Apakah Anda yakin ingin menghapus data ini?",
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Hapus",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API_URLS.PENGIRIMAN}/${id}`, {
                                method: "DELETE",
                            });

                            if (response.ok) {
                                Alert.alert("Berhasil", "Data berhasil dihapus");
                                fetchData();
                            } else {
                                Alert.alert("Gagal", "Gagal menghapus data");
                            }
                        } catch (error) {
                            Alert.alert("Error", "Terjadi kesalahan saat menghapus data");
                        }
                    },
                },
            ]
        );
    };
    const filteredPengiriman = pengiriman.filter(item =>
        item.produk?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <MenuSidebar
                activeMenu="Pengiriman"
                gmail={Array.isArray(gmail) ? gmail[0] : gmail}
                nama={Array.isArray(nama) ? nama[0] : nama}
            />

            <View style={styles.content}>
                {/* Top Section - 5 Produk Terbanyak */}
                <View style={styles.topSection}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.headerTitle}>5 Produk Terbanyak Terkirim</Text>
                        <TouchableOpacity style={styles.laporanButton}>
                            <Text style={styles.laporanText}>Lihat Laporan</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.dropdownWrapper}>
                        <Picker
                            selectedValue={selectedDate}
                            onValueChange={(itemValue) => setSelectedDate(itemValue)}
                            style={styles.picker}
                            dropdownIconColor="#333"
                        >
                            {dateOptions.map((option) => (
                                <Picker.Item key={option} label={option} value={option} />
                            ))}
                        </Picker>
                    </View>

                    {/* Top Products Table */}
                    <View style={styles.topProductsTable}>
                        {topProducts.map((product, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.productRow,
                                    index === topProducts.length - 1 && styles.lastProductRow
                                ]}
                            >
                                <View style={styles.productNameCell}>
                                    <Text style={styles.productName}>{product.name}</Text>
                                </View>
                                <View style={styles.productQuantityCell}>
                                    <Text style={styles.productQuantity}>{product.quantity}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Search and Add Button */}
                <View style={styles.searchRow}>
                    <View style={styles.searchContainer}>
                        <Search size={20} color="#999" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Cari Tanaman......"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor="#999"
                            caretHidden={true}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => {
                            setSelectedItem(null);
                            setModalVisible(true);
                        }}
                    >
                        <Plus size={20} color="#fff" />
                        <Text style={styles.addText}>Tambah Pengiriman</Text>
                    </TouchableOpacity>

                </View>

                {/* Main Table */}
                {loading ? (
                    <ActivityIndicator size="large" color="#4A7C2C" style={styles.loader} />
                ) : (
                    <ScrollView style={styles.tableContainer}>
                        <View style={styles.table}>
                            {/* Table Header */}
                            <View style={[styles.row, styles.tableHeader]}>
                                <Text style={[styles.cell, styles.headerCell, styles.idCell]}>
                                    ID{'\n'}Pengiriman
                                </Text>
                                <Text style={[styles.cell, styles.headerCell, styles.tanggalCell]}>
                                    Tanggal
                                </Text>
                                <Text style={[styles.cell, styles.headerCell, styles.produkCell]}>
                                    Produk
                                </Text>
                                <Text style={[styles.cell, styles.headerCell, styles.jumlahCell]}>
                                    Jumlah
                                </Text>
                                <Text style={[styles.cell, styles.headerCell, styles.beratCell]}>
                                    Berat
                                </Text>
                                <Text style={[styles.cell, styles.headerCell, styles.tujuanCell]}>
                                    Tujuan
                                </Text>
                                <Text style={[styles.cell, styles.headerCell, styles.statusCell]}>
                                    Status
                                </Text>
                                <Text style={[styles.cell, styles.headerCell, styles.aksiCell]}>
                                    Aksi
                                </Text>
                            </View>

                            {/* Table Data */}
                            {filteredPengiriman.map((item) => (
                                <View key={item.id_pengiriman} style={[styles.row, styles.dataRow]}>
                                    <Text style={[styles.cell, styles.idCell]}>{item.id_pengiriman}</Text>
                                    <Text style={[styles.cell, styles.tanggalCell]}>{item.tanggal}</Text>
                                    <Text style={[styles.cell, styles.produkCell]}>{item.produk}</Text>
                                    <Text style={[styles.cell, styles.jumlahCell]}>{item.jumlah}</Text>
                                    <Text style={[styles.cell, styles.beratCell]}>{item.berat} kg</Text>
                                    <Text style={[styles.cell, styles.tujuanCell]}>{item.tujuan}</Text>
                                    <View style={[styles.cell, styles.statusCell]}>
                                        <View style={styles.statusBadge}>
                                            <Text style={styles.statusText}>{item.status}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.cell, styles.aksiCell, styles.actionButtons]}>
                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.deleteButton]}
                                            onPress={() => handleDelete(item.id_pengiriman)}
                                        >
                                            <Trash2 size={16} color="#fff" />
                                            <Text style={styles.actionButtonText}>Hapus</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.editButton]}
                                            onPress={() => {
                                                setSelectedItem(item);
                                                setModalVisible(true);
                                            }}
                                        >
                                            <Edit size={16} color="#fff" />
                                            <Text style={styles.actionButtonText}>Edit</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                    
                )}
                <FormModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onSubmit={fetchData}
                    selectedItem={selectedItem}
                />

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
    topSection: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
    },
    laporanButton: {
        backgroundColor: "#4A7C2C",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
    },
    laporanText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    dateDropdown: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#2D2D2D",
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 15,
    },
    dateText: {
        fontSize: 14,
        color: "#333",
        fontWeight: "500",
    },
    dropdownArrow: {
        fontSize: 12,
        color: "#666",
    },
    topProductsTable: {
        borderWidth: 2,
        borderColor: "#E0E0E0",
        borderRadius: 10,
        overflow: "hidden",
    },
    productRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: "#E0E0E0",
        minHeight: 50,
    },
    lastProductRow: {
        borderBottomWidth: 0,
    },
    productNameCell: {
        flex: 1,
        padding: 12,
        justifyContent: "center",
        borderRightWidth: 1,
        borderColor: "#E0E0E0",
    },
    productQuantityCell: {
        flex: 1,
        padding: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    productName: {
        fontSize: 14,
        color: "#333",
        fontWeight: "500",
    },
    productQuantity: {
        fontSize: 14,
        color: "#333",
    },
    searchRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 12,
        flex: 1,
        marginRight: 15,
        borderWidth: 2,
        borderColor: "#E0E0E0",
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: "#333",
        outlineWidth: 0,
    },
    addButton: {
        backgroundColor: "#2D2D2D",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 30,
    },
    addText: {
        color: "#fff",
        marginLeft: 8,
        fontWeight: "600",
        fontSize: 14,
    },
    loader: {
        marginTop: 50,
    },
    tableContainer: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 15,
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
        backgroundColor: "#F5F5F5",
    },
    dataRow: {
        backgroundColor: "#fff",
    },
    cell: {
        padding: 12,
        justifyContent: "center",
        fontSize: 13,
        color: "#333",
    },
    headerCell: {
        fontWeight: "600",
        color: "#666",
        fontSize: 13,
        textAlign: "center",
    },
    idCell: {
        width: 100,
        textAlign: "center",
    },
    tanggalCell: {
        width: 120,
    },
    produkCell: {
        width: 120,
    },
    jumlahCell: {
        width: 80,
        textAlign: "center",
    },
    beratCell: {
        width: 80,
        textAlign: "center",
    },
    tujuanCell: {
        width: 150,
    },
    statusCell: {
        width: 100,
        alignItems: "center",
    },
    aksiCell: {
        width: 180,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        backgroundColor: "#4CAF50",
        alignItems: "center",
        justifyContent: "center",
    },
    statusText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    actionButtons: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    deleteButton: {
        backgroundColor: "#2D2D2D",
    },
    editButton: {
        backgroundColor: "#2D2D2D",
    },
    actionButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    dropdownWrapper: {
        borderWidth: 2,
        borderColor: "#2D2D2D",
        borderRadius: 10,
        backgroundColor: "#fff",
        marginBottom: 15,
        overflow: "hidden",
    },
    picker: {
        color: "#333",
        fontSize: 14,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },

});