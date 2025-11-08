import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Plus, Edit, Trash2, Search } from "lucide-react-native";
import MenuSidebar from "./sidebar";
import FormModal from "./formModal";
import DeleteModal from "./deleteModal";

interface Tanaman {
    id_tanaman: number;
    nm_tanaman: string;
    varietas: string;
    jumlah: number;
    tgl_tanam: string;
    lama_panen: string;
    lokasi: string;
    status: string;
}

const API_URL = "http://10.102.220.183:8000/api/tanaman";

export default function TanamanScreen() {
    const { gmail, nama } = useLocalSearchParams();
    const [tanaman, setTanaman] = useState<Tanaman[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTanaman, setSelectedTanaman] = useState<Tanaman | undefined>(undefined);
    const [modalVisible, setModalVisible] = useState(false);
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchData = async () => {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            setTanaman(data);
        } catch (error) {
            alert("Gagal memuat data tanaman");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = async (newData: any) => {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newData),
            });

            const result = await response.json();
            if (response.ok) {
                fetchData();
                setModalVisible(false);
                setSelectedTanaman(undefined);
            } else {
                console.log("Response:", result);
                alert("Gagal menambah data: " + (result.message || "Error tidak diketahui"));
            }
        } catch (error) {
            console.log("Error:", error);
            alert("Server tidak merespons");
        }
    };

    const handleEdit = async (updatedData: any) => {
        if (!selectedTanaman) {
            alert("Tidak ada tanaman yang dipilih untuk diedit");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${selectedTanaman.id_tanaman}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });

            if (response.ok) {
                fetchData();
                setModalVisible(false);
                setSelectedTanaman(undefined);
            } else {
                const text = await response.text();
                console.log("Update gagal:", text);
                alert("Gagal memperbarui data: " + text);
            }
        } catch (error) {
            alert("Server tidak merespons");
        }
    };

    const handleDelete = async () => {
        if (!selectedTanaman) {
            alert("Tidak ada tanaman yang dipilih untuk dihapus");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${selectedTanaman.id_tanaman}`, {
                method: "DELETE",
            });

            if (response.ok) {
                fetchData();
                setDeleteVisible(false);
                setSelectedTanaman(undefined);
            } else {
                alert("Gagal menghapus data");
            }
        } catch (error) {
            alert("Server tidak merespons");
        }
    };

    const filteredTanaman = tanaman.filter(item =>
        item.nm_tanaman.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <MenuSidebar
                activeMenu="Tanaman"
                gmail={Array.isArray(gmail) ? gmail[0] : gmail}
                nama={Array.isArray(nama) ? nama[0] : nama}
            />

            <View style={styles.content}>
                {/* Top Navigation Menu */}
                <View style={styles.topNavContainer}>
                    <TouchableOpacity style={[styles.navButton, styles.navButtonActive]}>
                        <Text style={[styles.navText, styles.navTextActive]}>Daftar Semua{'\n'}Tanaman</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navButton}
                        onPress={() => router.push({
                            pathname: "/(tabs)/tanaman/countdown",
                            params: {
                                gmail: Array.isArray(gmail) ? gmail[0] : gmail,
                                nama: Array.isArray(nama) ? nama[0] : nama,
                            },
                        })}>
                        <Text style={styles.navText}>Countdown{'\n'}Masa Panen</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navButton}>
                        <Text style={styles.navText}>Statistik{'\n'}Panen</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navButton}>
                        <Text style={styles.navText}>Daftar{'\n'}Tanaman Aktif</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navButton}>
                        <Text style={styles.navText}>Jadwal{'\n'}Panen</Text>
                    </TouchableOpacity>
                </View>

                {/* Header dengan Search dan Tombol Tambah */}
                <View style={styles.headerRow}>
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
                            setSelectedTanaman(undefined);
                            setModalVisible(true);
                        }}
                    >
                        <Plus size={20} color="#fff" />
                        <Text style={styles.addText}>Tambah Tanaman</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#4A7C2C" style={styles.loader} />
                ) : (
                    <ScrollView style={styles.tableContainer}>
                        <View style={styles.table}>
                            {/* Header Table */}
                            <View style={[styles.row, styles.tableHeader]}>
                                <Text style={[styles.cell, styles.headerCell, styles.idCell]}>Id</Text>
                                <Text style={[styles.cell, styles.headerCell, styles.nameCell]}>Nama Tanaman</Text>
                                <Text style={[styles.cell, styles.headerCell, styles.varCell]}>Varietas</Text>
                                <Text style={[styles.cell, styles.headerCell, styles.jumlahCell]}>Jumlah</Text>
                                <Text style={[styles.cell, styles.headerCell, styles.lokasiCell]}>Lokasi</Text>
                                <Text style={[styles.cell, styles.headerCell, styles.dateCell]}>Tanggal Tanam</Text>
                                <Text style={[styles.cell, styles.headerCell, styles.panenCell]}>Lama Panen</Text>
                                <Text style={[styles.cell, styles.headerCell, styles.statusCell]}>Status</Text>
                                <Text style={[styles.cell, styles.headerCell, styles.aksiCell]}>Aksi</Text>
                            </View>

                            {/* Data Rows */}
                            {filteredTanaman.map((item, index) => (
                                <View key={item.id_tanaman} style={[styles.row, styles.dataRow]}>
                                    <Text style={[styles.cell, styles.idCell]}>{item.id_tanaman}</Text>
                                    <Text style={[styles.cell, styles.nameCell]}>{item.nm_tanaman}</Text>
                                    <Text style={[styles.cell, styles.varCell]}>{item.varietas}</Text>
                                    <Text style={[styles.cell, styles.jumlahCell]}>{item.jumlah} Tanaman</Text>
                                    <Text style={[styles.cell, styles.lokasiCell]}>{item.lokasi}</Text>
                                    <Text style={[styles.cell, styles.dateCell]}>{item.tgl_tanam}</Text>
                                    <Text style={[styles.cell, styles.panenCell]}>{item.lama_panen}</Text>
                                    <View style={[styles.cell, styles.statusCell]}>
                                        <View style={[
                                            styles.statusBadge,
                                            item.status === "Sehat" ? styles.statusSehat : styles.statusTidakSehat
                                        ]}>
                                            <Text style={styles.statusText}>{item.status}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.cell, styles.aksiCell, styles.actionButtons]}>
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => {
                                                console.log("Edit tanaman:", item);
                                                setSelectedTanaman(item);
                                                setModalVisible(true);
                                            }}
                                        >
                                            <Edit size={18} color="#fff" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => {
                                                setSelectedTanaman(item);
                                                setDeleteVisible(true);
                                            }}
                                        >
                                            <Trash2 size={18} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                )}
            </View>

            <FormModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={selectedTanaman ? handleEdit : handleAdd}
                initialData={selectedTanaman}
                selectedTanaman={selectedTanaman}
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
    topNavContainer: {
        flexDirection: "row",
        backgroundColor: "#5A8C3A",
        borderRadius: 35,
        padding: 5,
        marginBottom: 25,
        justifyContent: "space-between",
    },
    navButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 2,
    },
    navButtonActive: {
        backgroundColor: "#4A3A2A",
    },
    navText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "500",
        textAlign: "center",
        lineHeight: 16,
    },
    navTextActive: {
        fontWeight: "600",
    },
    headerRow: {
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
        borderColor: "#2D2D2D",
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
    },
    idCell: {
        width: 50,
        textAlign: "center",
    },
    nameCell: {
        width: 140,
    },
    varCell: {
        width: 100,
    },
    jumlahCell: {
        width: 120,
    },
    lokasiCell: {
        width: 100,
    },
    dateCell: {
        width: 130,
    },
    panenCell: {
        width: 100,
    },
    statusCell: {
        width: 100,
        alignItems: "center",
    },
    aksiCell: {
        width: 100,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    statusSehat: {
        backgroundColor: "#4CAF50",
    },
    statusTidakSehat: {
        backgroundColor: "#F44336",
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
        backgroundColor: "#2D2D2D",
        padding: 8,
        borderRadius: 8,
    },
});