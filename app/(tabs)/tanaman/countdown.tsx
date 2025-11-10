import { router, useLocalSearchParams } from "expo-router";
import { Clock } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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

interface CountdownData {
    tanaman: Tanaman;
    targetDate: Date;
    daysRemaining: number;
    percentage: number;
    statusText: string;
    statusColor: string;
}



export default function CountdownScreen() {
    const { gmail, nama } = useLocalSearchParams();
    const [countdownList, setCountdownList] = useState<CountdownData[]>([]);
    const [loading, setLoading] = useState(true);

    const calculateCountdown = (tglTanam: string, lamaPanen: string): CountdownData | null => {
        try {
            const plantDate = new Date(tglTanam);
            const daysToHarvest = parseInt(lamaPanen.replace(/\D/g, ""));
            const targetDate = new Date(plantDate);
            targetDate.setDate(targetDate.getDate() + daysToHarvest);

            const today = new Date();
            const diffDays = Math.floor((today.getTime() - plantDate.getTime()) / (1000 * 60 * 60 * 24));
            const daysRemaining = targetDate > today
                ? Math.max(0, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
                : -Math.abs(Math.floor((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24)));

            // Perhitungan persentase
            let percentage = 0;
            if (diffDays < 0) percentage = 0;
            else if (diffDays >= daysToHarvest) percentage = 100;
            else percentage = Math.min(100, Math.floor((diffDays / daysToHarvest) * 100));

            // Tentukan status dan warna
            let statusText = "";
            let statusColor = "";

            if (daysRemaining > 3 && percentage < 30) {
                statusText = "Baru Ditanam";
                statusColor = "#2196F3"; 
            } else if (daysRemaining <= 3 && daysRemaining > 0) {
                statusText = "Segera Panen";
                statusColor = "#FF9800"; // oranye
            } else if (daysRemaining === 0) {
                statusText = "Sudah Waktunya Panen";
                statusColor = "#4CAF50"; // hijau
            } else if (daysRemaining < 0) {
                statusText = "Terlambat Panen";
                statusColor = "#F44336"; // merah
                percentage = 100;
            }

            return {
                tanaman: {} as Tanaman,
                targetDate,
                daysRemaining,
                percentage,
                statusText,
                statusColor,
            };
        } catch (error) {
            console.error("Error calculating countdown:", error);
            return null;
        }
    };


    const fetchData = async () => {
        try {
            const response = await fetch(API_URLS.TANAMAN);
            const data: Tanaman[] = await response.json();

            const countdowns: CountdownData[] = data
                .map(tanaman => {
                    const countdown = calculateCountdown(tanaman.tgl_tanam, tanaman.lama_panen);
                    if (countdown) {
                        countdown.tanaman = tanaman;
                        return countdown;
                    }
                    return null;
                })
                .filter((item): item is CountdownData => item !== null);

            setCountdownList(countdowns);
        } catch (error) {
            alert("Gagal memuat data countdown");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); // Update setiap menit
        return () => clearInterval(interval);
    }, []);

    const formatDate = (date: Date) => {
        const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    return (
        <View style={styles.container}>
            <MenuSidebar
                activeMenu="Countdown"
                gmail={Array.isArray(gmail) ? gmail[0] : gmail}
                nama={Array.isArray(nama) ? nama[0] : nama}
            />

            <View style={styles.content}>
                {/* Top Navigation Menu */}
                <View style={styles.topNavContainer}>
                    <TouchableOpacity style={styles.navButton}
                        onPress={() => router.push({
                            pathname: "/(tabs)/tanaman/tanamanI",
                            params: {
                                gmail: Array.isArray(gmail) ? gmail[0] : gmail,
                                nama: Array.isArray(nama) ? nama[0] : nama,
                            },
                        })}>
                        <Text style={styles.navText}>Daftar Semua{'\n'}Tanaman</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.navButton, styles.navButtonActive]}>
                        <Text style={[styles.navText, styles.navTextActive]}>Countdown{'\n'}Masa Panen</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navButton}
                        onPress={() => router.push({
                            pathname: "/(tabs)/tanaman/statistik",
                            params: {
                                gmail: Array.isArray(gmail) ? gmail[0] : gmail,
                                nama: Array.isArray(nama) ? nama[0] : nama,
                            },
                        })}>
                        <Text style={styles.navText}>Statistik{'\n'}Panen</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navButton}
                                            onPress={() => router.push({
                                                pathname: "/(tabs)/tanaman/aktif",
                                                params: {
                                                    gmail: Array.isArray(gmail) ? gmail[0] : gmail,
                                                    nama: Array.isArray(nama) ? nama[0] : nama,
                                                },
                                            })}>
                                            <Text style={styles.navText}>Daftar{'\n'}Tanaman Aktif</Text>
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

                {loading ? (
                    <ActivityIndicator size="large" color="#4A7C2C" style={styles.loader} />
                ) : (
                    <ScrollView style={styles.scrollView}>
                        <View style={styles.cardsContainer}>
                            {countdownList.map((item, index) => (
                                <View key={item.tanaman.id_tanaman} style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.plantInfo}>
                                            <View style={styles.plantIcon}>
                                                <Text style={styles.plantIconText}>🌱</Text>
                                            </View>
                                            <View>
                                                <Text style={styles.plantName}>{item.tanaman.nm_tanaman}</Text>
                                                <Text style={styles.plantVariety}>{item.tanaman.varietas}</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            style={[styles.statusBadge, { backgroundColor: item.statusColor }]}
                                        >
                                            <Text style={styles.statusText}>{item.statusText}</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.dateInfo}>
                                        <Clock size={16} color="#666" />
                                        <Text style={styles.dateText}>
                                            Ditanam: {formatDate(new Date(item.tanaman.tgl_tanam))}
                                        </Text>
                                    </View>

                                    <View style={styles.progressSection}>
                                        <View style={styles.progressHeader}>
                                            <Text style={styles.progressLabel}>
                                                {item.daysRemaining > 0
                                                    ? `${item.daysRemaining} Hari Lagi`
                                                    : item.statusText}
                                            </Text>
                                            <Text style={styles.progressPercentage}>{item.percentage}%</Text>
                                        </View>
                                        <View style={styles.progressBarContainer}>
                                            <View style={[styles.progressBar, { width: `${item.percentage}%` }]} />
                                        </View>
                                    </View>

                                    <Text style={styles.targetDate}>
                                        Target Panen: {formatDate(item.targetDate)}
                                    </Text>
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
    loader: {
        marginTop: 50,
    },
    scrollView: {
        flex: 1,
    },
    cardsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 20,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        width: "48%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 15,
    },
    plantInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    plantIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#7BC940",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    plantIconText: {
        fontSize: 24,
    },
    plantName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#333",
        marginBottom: 2,
    },
    plantVariety: {
        fontSize: 13,
        color: "#666",
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    statusText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "600",
    },
    dateInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    dateText: {
        fontSize: 13,
        color: "#666",
        marginLeft: 8,
    },
    progressSection: {
        marginBottom: 15,
    },
    progressHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
    },
    progressPercentage: {
        fontSize: 13,
        fontWeight: "600",
        color: "#666",
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: "#E0E0E0",
        borderRadius: 4,
        overflow: "hidden",
    },
    progressBar: {
        height: "100%",
        backgroundColor: "#2D2D2D",
        borderRadius: 4,
    },
    targetDate: {
        fontSize: 13,
        color: "#666",
    },
});