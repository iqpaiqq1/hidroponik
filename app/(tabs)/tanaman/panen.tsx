import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { MoreVertical } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MenuSidebar from "../sidebar";
import { API_URLS } from "../../api/apiConfig"
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

interface TanamanJadwal extends Tanaman {
    estimasiPanen: Date;
    hariTersisa: number;
}




export default function JadwalPanenScreen() {
    const { gmail, nama } = useLocalSearchParams();
    const [tanamanMendatang, setTanamanMendatang] = useState<TanamanJadwal[]>([]);
    const [tanamanAktif, setTanamanAktif] = useState<TanamanJadwal[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    const calculateEstimasi = (tglTanam: string, lamaPanen: string): { estimasi: Date; hariTersisa: number } => {
        try {
            const plantDate = new Date(tglTanam);
            const daysToHarvest = parseInt(lamaPanen.replace(/\D/g, ''));
            const estimasiDate = new Date(plantDate);
            estimasiDate.setDate(estimasiDate.getDate() + daysToHarvest);

            const today = new Date();
            const diffTime = estimasiDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return {
                estimasi: estimasiDate,
                hariTersisa: diffDays
            };
        } catch (error) {
            const now = new Date();
            return {
                estimasi: now,
                hariTersisa: 0
            };
        }
    };

    const fetchData = async (showLoading = true) => {
        if (showLoading) setLoading(true);

        try {
            const response = await fetch(API_URLS.TANAMAN);
            const data: Tanaman[] = await response.json();

            const tanamanDenganEstimasi = data.map(tanaman => {
                const { estimasi, hariTersisa } = calculateEstimasi(tanaman.tgl_tanam, tanaman.lama_panen);
                return {
                    ...tanaman,
                    estimasiPanen: estimasi,
                    hariTersisa
                };
            });

            // Filter tanaman yang akan dipanen dalam 30 hari ke depan ATAU status "Siap Panen"
            const mendatang = tanamanDenganEstimasi.filter(t => {
                const isSiapPanen = t.status && t.status.toLowerCase().includes("siap");
                const isInRange = t.hariTersisa > 0 && t.hariTersisa <= 30;
                const isPastDue = t.hariTersisa <= 0;

                return isSiapPanen || isInRange || isPastDue;
            });

            console.log("Semua tanaman dengan estimasi:", tanamanDenganEstimasi);
            console.log("Tanaman mendatang yang difilter:", mendatang);

            // Filter tanaman yang sedang aktif ditanam (dalam 30 hari ke depan)
            const aktif = tanamanDenganEstimasi.filter(t => {
                const isSiapPanen = t.status && t.status.toLowerCase().includes("siap");
                const isInRange = t.hariTersisa > 0 && t.hariTersisa <= 30;
                const isPastDue = t.hariTersisa <= 0;

                return isSiapPanen || isInRange || isPastDue;
            });

            setTanamanMendatang(mendatang);
            setTanamanAktif(aktif);
        } catch (error) {
            console.error("Error fetching data:", error);
            if (showLoading) {
                Alert.alert("Error", "Gagal memuat data jadwal panen");
            }
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            if (isFirstLoad) {
                setIsFirstLoad(false);
                fetchData(true);
            } else {
                fetchData(false);
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
                    <TouchableOpacity
                        style={styles.navButton}
                        onPress={() => router.push({
                            pathname: "/(tabs)/tanaman/aktif",
                            params: {
                                gmail: Array.isArray(gmail) ? gmail[0] : gmail,
                                nama: Array.isArray(nama) ? nama[0] : nama,
                            },
                        })}
                    >
                        <Text style={styles.navText}>Daftar{'\n'}Tanaman Aktif</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.navButton, styles.navButtonActive]}>
                        <Text style={[styles.navText, styles.navTextActive]}>Jadwal{'\n'}Panen</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#5A8C3A" style={styles.loader} />
                ) : (
                    <ScrollView style={styles.scrollContainer}>
                       
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Jadwal Panen Mendatang</Text>
                            <Text style={styles.sectionSubtitle}>
                                Daftar tanaman yang akan dipanen dalam 30 hari ke depan
                            </Text>

                            <View style={styles.card}>
                                <View style={styles.tableHeader}>
                                    <Text style={[styles.headerText, styles.col1]}>Tanaman</Text>
                                    <Text style={[styles.headerText, styles.col2]}>Varietas</Text>
                                    <Text style={[styles.headerText, styles.col3]}>Jumlah</Text>
                                    <Text style={[styles.headerText, styles.col4]}>Lokasi</Text>
                                    <Text style={[styles.headerText, styles.col5]}>Tanggal Tanam</Text>
                                    <Text style={[styles.headerText, styles.col6]}>Estimasi Panen</Text>
                                    <Text style={[styles.headerText, styles.col7]}>Status</Text>
                                    <Text style={[styles.headerText, styles.col8]}></Text>
                                </View>

                                {tanamanMendatang.length === 0 ? (
                                    <View style={styles.emptyState}>
                                        <Text style={styles.emptyText}>Tidak ada tanaman yang akan dipanen dalam 30 hari ke depan</Text>
                                    </View>
                                ) : (
                                    tanamanMendatang.map((item, index) => (
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
                                                    {item.hariTersisa} hari
                                                </Text>
                                            </View>
                                            <View style={[styles.col7, styles.statusContainer]}>
                                                {item.status === "Siap Panen" || item.hariTersisa <= 0 ? (
                                                    <View style={styles.siapPanenBadge}>
                                                        <Text style={styles.siapPanenText}>Siap Panen</Text>
                                                    </View>
                                                ) : item.status === "Perlu Perhatian" ? (
                                                    <View style={styles.perluPerhatianBadge}>
                                                        <Text style={styles.perluPerhatianText}>Perlu Perhatian</Text>
                                                    </View>
                                                ) : (
                                                    <View style={styles.sehatBadge}>
                                                        <Text style={styles.sehatText}>Sehat</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <TouchableOpacity style={styles.col8}>
                                                <MoreVertical size={20} color="#666" />
                                            </TouchableOpacity>
                                        </View>
                                    ))
                                )}
                            </View>
                        </View>

                        
                        <View style={[styles.section, styles.sectionMargin]}>
                            <Text style={styles.sectionTitle}>Daftar Tanaman Aktif</Text>
                            <Text style={styles.sectionSubtitle}>
                                Tanaman yang akan dipanen dalam 30 hari ke depan
                            </Text>

                            <View style={styles.card}>
                                <View style={styles.tableHeader}>
                                    <Text style={[styles.headerText, styles.col1]}>Tanaman</Text>
                                    <Text style={[styles.headerText, styles.col2]}>Varietas</Text>
                                    <Text style={[styles.headerText, styles.col3]}>Jumlah</Text>
                                    <Text style={[styles.headerText, styles.col4]}>Lokasi</Text>
                                    <Text style={[styles.headerText, styles.col5]}>Tanggal Tanam</Text>
                                    <Text style={[styles.headerText, styles.col6]}>Estimasi Panen</Text>
                                    <Text style={[styles.headerText, styles.col7]}>Status</Text>
                                    <Text style={[styles.headerText, styles.col8]}></Text>
                                </View>

                                {tanamanAktif.length === 0 ? (
                                    <View style={styles.emptyState}>
                                        <Text style={styles.emptyText}>Tidak ada tanaman aktif</Text>
                                    </View>
                                ) : (
                                    tanamanAktif.map((item, index) => (
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
                                                    {item.hariTersisa} hari
                                                </Text>
                                            </View>
                                            <View style={[styles.col7, styles.statusContainer]}>
                                                {item.status === "Siap Panen" || item.hariTersisa <= 0 ? (
                                                    <View style={styles.siapPanenBadge}>
                                                        <Text style={styles.siapPanenText}>Siap Panen</Text>
                                                    </View>
                                                ) : item.status === "Perlu Perhatian" ? (
                                                    <View style={styles.perluPerhatianBadge}>
                                                        <Text style={styles.perluPerhatianText}>Perlu Perhatian</Text>
                                                    </View>
                                                ) : (
                                                    <View style={styles.sehatBadge}>
                                                        <Text style={styles.sehatText}>Sehat</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <TouchableOpacity style={styles.col8}>
                                                <MoreVertical size={20} color="#666" />
                                            </TouchableOpacity>
                                        </View>
                                    ))
                                )}
                            </View>
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
        backgroundColor: "#ffffffff",
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
    loader: {
        marginTop: 80,
    },
    scrollContainer: {
        flex: 1,
    },
    section: {
        marginBottom: 16,
    },
    sectionMargin: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#2C3E50",
        marginBottom: 6,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: "#7F8C8D",
        marginBottom: 16,
    },
    card: {
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
        color: "#1e1e1eff",
    },
    col1: { flex: 1.2 },
    col2: { flex: 1 },
    col3: { flex: 1 },
    col4: { flex: 0.8 },
    col5: { flex: 1 },
    col6: { flex: 1.1 },
    col7: { flex: 0.9 },
    col8: { flex: 0.3 },
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
        paddingHorizontal: 16,
        borderRadius: 20,
        minWidth: 70,
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
        paddingHorizontal: 16,
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
    emptyState: {
        paddingVertical: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyText: {
        fontSize: 14,
        color: "#95A5A6",
        fontStyle: "italic",
    },
});