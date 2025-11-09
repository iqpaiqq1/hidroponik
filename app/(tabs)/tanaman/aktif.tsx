import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MenuSidebar from "../sidebar";

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

interface TanamanAktif extends Tanaman {
    estimasiPanen: Date;
    hariTersisa: number;
    statusPanen: string;
}

const API_URL_TANAMAN = "http://10.102.220.183:8000/api/tanaman";
const API_URL_PANEN = "http://10.102.220.183:8000/api/panen";

export default function TanamanAktifScreen() {
    const { gmail, nama } = useLocalSearchParams();
    const [tanamanAktif, setTanamanAktif] = useState<TanamanAktif[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const calculateEstimasi = (tglTanam: string, lamaPanen: string): { estimasi: Date; hariTersisa: number; statusPanen: string } => {
        try {
            const plantDate = new Date(tglTanam);
            const daysToHarvest = parseInt(lamaPanen.replace(/\D/g, ''));
            const estimasiDate = new Date(plantDate);
            estimasiDate.setDate(estimasiDate.getDate() + daysToHarvest);

            const today = new Date();
            const diffTime = estimasiDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let statusPanen = "";
            if (diffDays <= 0) {
                statusPanen = "Siap Panen";
            } else if (diffDays <= 3) {
                statusPanen = `${diffDays} hari`;
            } else {
                statusPanen = "Lewat jadwal";
            }

            return {
                estimasi: estimasiDate,
                hariTersisa: diffDays,
                statusPanen
            };
        } catch (error) {
            const now = new Date();
            return {
                estimasi: now,
                hariTersisa: 0,
                statusPanen: "Error"
            };
        }
    };

    const [isFirstLoad, setIsFirstLoad] = useState(true);

    const fetchData = async (showLoading = true) => {
        if (showLoading) setLoading(true);

        try {
            const response = await fetch(API_URL_TANAMAN);
            const data: Tanaman[] = await response.json();

            const aktif = data
                .map(tanaman => {
                    const { estimasi, hariTersisa, statusPanen } = calculateEstimasi(tanaman.tgl_tanam, tanaman.lama_panen);
                    return {
                        ...tanaman,
                        estimasiPanen: estimasi,
                        hariTersisa,
                        statusPanen
                    };
                })
                .filter(t => t.hariTersisa >= -30);

            setTanamanAktif(aktif);
        } catch (error) {
            console.error("Error fetching data:", error);
            if (showLoading) {
                Alert.alert("Error", "Gagal memuat data tanaman aktif");
            }
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    // Auto refresh ketika halaman menjadi fokus (kecuali first load)
    useFocusEffect(
        React.useCallback(() => {
            if (isFirstLoad) {
                setIsFirstLoad(false);
                fetchData(true); // First load dengan loading indicator
            } else {
                fetchData(false); // Subsequent loads tanpa loading indicator
            }
        }, [isFirstLoad])
    );



    const formatDate = (date: Date) => {
        const day = date.getDate();
        const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    const renderStatus = (tanaman: TanamanAktif) => {
        // Prioritaskan status dari database
        if (tanaman.status === "Siap Panen") {
            return (
                <View style={styles.siapPanenBadge}>
                    <Text style={styles.siapPanenText}>Siap Panen</Text>
                </View>
            );
        }

        if (tanaman.status === "Perlu Perhatian") {
            return (
                <View style={styles.perluPerhatianBadge}>
                    <Text style={styles.perluPerhatianText}>Perlu Perhatian</Text>
                </View>
            );
        }

        // Jika status "Sehat" tapi sudah waktunya panen (berdasarkan perhitungan)
        if (tanaman.status === "Sehat" && tanaman.hariTersisa <= 0) {
            return (
                <View style={styles.siapPanenBadge}>
                    <Text style={styles.siapPanenText}>Siap Panen</Text>
                </View>
            );
        }

        // Default: Sehat
        return (
            <View style={styles.sehatBadge}>
                <Text style={styles.sehatText}>Sehat</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <MenuSidebar
                activeMenu="Tanaman Aktif"
                gmail={Array.isArray(gmail) ? gmail[0] : gmail}
                nama={Array.isArray(nama) ? nama[0] : nama}
            />

            <View style={styles.content}>
                {/* Top Navigation Menu */}
                <View style={styles.topNavContainer}>
                    <TouchableOpacity
                        style={styles.navButton}
                        onPress={() => router.push({
                            pathname: "/(tabs)/tanaman/tanamanI",
                            params: {
                                gmail: Array.isArray(gmail) ? gmail[0] : gmail,
                                nama: Array.isArray(nama) ? nama[0] : nama,
                            },
                        })}
                    >
                        <Text style={styles.navText}>Daftar Semua{'\n'}Tanaman</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.navButton}
                        onPress={() => router.push({
                            pathname: "/(tabs)/tanaman/countdown",
                            params: {
                                gmail: Array.isArray(gmail) ? gmail[0] : gmail,
                                nama: Array.isArray(nama) ? nama[0] : nama,
                            },
                        })}
                    >
                        <Text style={styles.navText}>Countdown{'\n'}Masa Panen</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.navButton}
                        onPress={() => router.push({
                            pathname: "/(tabs)/tanaman/statistik",
                            params: {
                                gmail: Array.isArray(gmail) ? gmail[0] : gmail,
                                nama: Array.isArray(nama) ? nama[0] : nama,
                            },
                        })}
                    >
                        <Text style={styles.navText}>Statistik{'\n'}Panen</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.navButton, styles.navButtonActive]}>
                        <Text style={[styles.navText, styles.navTextActive]}>Daftar{'\n'}Tanaman Aktif</Text>
                    </TouchableOpacity>
                   <TouchableOpacity style={styles.navButton}
                                           onPress={() => router.push({
                                               pathname: "/(tabs)/tanaman/panen",
                                               params: {
                                                   gmail: Array.isArray(gmail) ? gmail[0] : gmail,
                                                   nama: Array.isArray(nama) ? nama[0] : nama,
                                               },
                                           })}>
                                           <Text style={styles.navText}>Jadwal{'\n'}Panen</Text>
                                       </TouchableOpacity>
                </View>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Daftar Tanaman Aktif</Text>
                    <Text style={styles.subtitle}>Semua tanaman yang sedang dalam masa tanam</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#5A8C3A" style={styles.loader} />
                ) : (
                    <ScrollView style={styles.scrollContainer}>
                        <View style={styles.tableContainer}>
                            {/* Table Header */}
                            <View style={styles.tableHeader}>
                                <Text style={[styles.headerText, styles.col1]}>Tanaman</Text>
                                <Text style={[styles.headerText, styles.col2]}>Varietas</Text>
                                <Text style={[styles.headerText, styles.col3]}>Jumlah</Text>
                                <Text style={[styles.headerText, styles.col4]}>Lokasi</Text>
                                <Text style={[styles.headerText, styles.col5]}>Tanggal Tanam</Text>
                                <Text style={[styles.headerText, styles.col6]}>Estimasi Panen</Text>
                                <Text style={[styles.headerText, styles.col7]}>Status</Text>
                            </View>

                            {/* Table Rows */}
                            {tanamanAktif.map((item, index) => (
                                <View
                                    key={item.id_tanaman}
                                    style={[
                                        styles.tableRow,
                                        index % 2 === 0 ? styles.rowEven : styles.rowOdd
                                    ]}
                                >
                                    <Text style={[styles.cellText, styles.col1, styles.boldText]}>
                                        {item.nm_tanaman}
                                    </Text>
                                    <Text style={[styles.cellText, styles.col2, styles.varietasText]}>
                                        {item.varietas}
                                    </Text>
                                    <Text style={[styles.cellText, styles.col3]}>
                                        {item.jumlah} tanaman
                                    </Text>
                                    <Text style={[styles.cellText, styles.col4]}>
                                        {item.lokasi}
                                    </Text>
                                    <Text style={[styles.cellText, styles.col5]}>
                                        {formatDate(new Date(item.tgl_tanam))}
                                    </Text>
                                    <View style={[styles.col6, styles.estimasiContainer]}>
                                        <Text style={styles.estimasiDate}>
                                            {formatDate(item.estimasiPanen)}
                                        </Text>
                                        <Text style={styles.estimasiSubtext}>
                                            {item.hariTersisa > 0
                                                ? `${item.hariTersisa} hari`
                                                : "Lewat jadwal"}
                                        </Text>
                                    </View>
                                    <View style={[styles.col7, styles.statusContainer]}>
                                        {renderStatus(item)}
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
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
        padding: 24,
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
        paddingVertical: 14,
        paddingHorizontal: 10,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
    },
    navButtonActive: {
        backgroundColor: "#4A3A2A",
    },
    navText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "500",
        textAlign: "center",
        lineHeight: 17,
    },
    navTextActive: {
        fontWeight: "600",
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        color: "#2C3E50",
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 15,
        color: "#7F8C8D",
        fontWeight: "400",
    },
    loader: {
        marginTop: 80,
    },
    scrollContainer: {
        flex: 1,
    },
    tableContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#F5F5F5",
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
    },
    headerText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#2C3E50",
    },
    tableRow: {
        flexDirection: "row",
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
        alignItems: "center",
    },
    rowEven: {
        backgroundColor: "#FFFFFF",
    },
    rowOdd: {
        backgroundColor: "#FAFAFA",
    },
    cellText: {
        fontSize: 14,
        color: "#2C3E50",
        fontWeight: "400",
    },
    boldText: {
        fontWeight: "600",
        color: "#2C3E50",
    },
    varietasText: {
        color: "#95A5A6",
    },
    col1: { flex: 1.3 },
    col2: { flex: 1.1 },
    col3: { flex: 1.1 },
    col4: { flex: 0.9 },
    col5: { flex: 1.1 },
    col6: { flex: 1.2 },
    col7: { flex: 1 },
    estimasiContainer: {
        justifyContent: "center",
    },
    estimasiDate: {
        fontSize: 14,
        color: "#2C3E50",
        fontWeight: "500",
        marginBottom: 3,
    },
    estimasiSubtext: {
        fontSize: 12,
        color: "#95A5A6",
        fontWeight: "400",
    },
    statusContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    sehatBadge: {
        backgroundColor: "#E8F5E9",
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 20,
        minWidth: 80,
        alignItems: "center",
    },
    sehatText: {
        color: "#4CAF50",
        fontSize: 13,
        fontWeight: "600",
    },
    siapPanenBadge: {
        backgroundColor: "#ffae00ff",
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 20,
        minWidth: 100,
        alignItems: "center",
    },
    siapPanenText: {
        color: "#ffffffff",
        fontSize: 13,
        fontWeight: "600",
    },
    perluPerhatianBadge: {
        backgroundColor: "#FFE0B2",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        minWidth: 100,
        alignItems: "center",
    },
    perluPerhatianText: {
        color: "#E65100",
        fontSize: 13,
        fontWeight: "600",
    },
});