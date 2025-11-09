import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MenuSidebar from "../sidebar";

interface Panen {
    id_panen: number;
    tgl_panen: string;
    jenis_panen: string;
    jumlah: number;
    kualitas: string;
    id_tumbuhan: number | null;
    id_ternak: number | null;
}

interface StatistikJenis {
    name: string;
    value: number;
}

interface TrenBulanan {
    bulan: string;
    total: number;
}

const API_URL_PANEN = "http://10.102.220.183:8000/api/panen";

export default function StatistikScreen() {
    const { gmail, nama } = useLocalSearchParams();
    const [panen, setPanen] = useState<Panen[]>([]);
    const [loading, setLoading] = useState(true);
    const [statistikJenis, setStatistikJenis] = useState<StatistikJenis[]>([]);
    const [trenBulanan, setTrenBulanan] = useState<TrenBulanan[]>([]);

    const fetchData = async () => {
        try {
            const response = await fetch(API_URL_PANEN);
            const data: Panen[] = await response.json();
            setPanen(data);

            // Filter data bulan ini
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const dataBulanIni = data.filter(item => {
                const tglPanen = new Date(item.tgl_panen);
                return tglPanen.getMonth() === currentMonth && tglPanen.getFullYear() === currentYear;
            });

            // Hitung statistik per jenis panen bulan ini
            const jenisCount: { [key: string]: number } = {};
            dataBulanIni.forEach(item => {
                const jenis = item.jenis_panen;
                jenisCount[jenis] = (jenisCount[jenis] || 0) + item.jumlah;
            });

            const statistik = Object.entries(jenisCount)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 5); // Ambil 5 teratas

            setStatistikJenis(statistik);

            // Hitung tren panen bulanan (7 bulan terakhir)
            const bulanCount: { [key: string]: number } = {};
            data.forEach(item => {
                try {
                    const tglPanen = new Date(item.tgl_panen);
                    const bulanKey = `${tglPanen.getFullYear()}-${String(tglPanen.getMonth() + 1).padStart(2, '0')}`;
                    bulanCount[bulanKey] = (bulanCount[bulanKey] || 0) + item.jumlah;
                } catch (error) {
                    console.error("Error parsing date:", error);
                }
            });

            const namaBulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
            const tren = Object.entries(bulanCount)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .slice(-7) // 7 bulan terakhir
                .map(([key, total]) => {
                    const [year, month] = key.split('-');
                    return {
                        bulan: namaBulan[parseInt(month) - 1],
                        total
                    };
                });

            setTrenBulanan(tren);

        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Gagal memuat data statistik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getBulanSekarang = () => {
        const bulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        const now = new Date();
        return `${bulan[now.getMonth()]} ${now.getFullYear()}`;
    };

    // Hitung nilai maksimum untuk skala Y-axis bar chart
    const maxBarValue = Math.max(...statistikJenis.map(s => s.value), 1);
    const yAxisMax = Math.ceil(maxBarValue / 10) * 10; // Round up to nearest 10

    return (
        <View style={styles.container}>
            <MenuSidebar
                activeMenu="Statistik"
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
                    <TouchableOpacity style={[styles.navButton, styles.navButtonActive]}>
                        <Text style={[styles.navText, styles.navTextActive]}>Statistik{'\n'}Panen</Text>
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
                        {/* Chart 1: Panen per Jenis Tanaman */}
                        <View style={styles.chartCard}>
                            <Text style={styles.chartTitle}>Panen per Jenis Tanaman</Text>
                            <Text style={styles.chartSubtitle}>Bulan {getBulanSekarang()}</Text>

                            <View style={styles.barChartContainer}>
                                {/* Y-Axis */}
                                <View style={styles.yAxisBar}>
                                    {[yAxisMax, Math.floor(yAxisMax * 0.75), Math.floor(yAxisMax * 0.5), Math.floor(yAxisMax * 0.25), 0].map((val, idx) => (
                                        <Text key={idx} style={styles.yAxisLabelBar}>{val}</Text>
                                    ))}
                                </View>

                                {/* Bars */}
                                <View style={styles.barsContainer}>
                                    <View style={styles.gridLinesBar}>
                                        {[0, 1, 2, 3, 4].map(i => (
                                            <View key={i} style={styles.gridLineBar} />
                                        ))}
                                    </View>

                                    <View style={styles.barsWrapper}>
                                        {statistikJenis.map((item, index) => {
                                            const heightPercent = (item.value / yAxisMax) * 100;
                                            return (
                                                <View key={index} style={styles.barItem}>
                                                    <View style={styles.barSpace}>
                                                        <View style={[styles.bar, { height: `${heightPercent}%` }]} />
                                                    </View>
                                                    <Text style={styles.barLabel}>{item.name}</Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Chart 2: Tren Panen Bulanan */}
                        <View style={styles.chartCard}>
                            <Text style={styles.chartTitle}>Tren Panen Bulanan</Text>
                            <Text style={styles.chartSubtitle}>Total batch panen 7 bulan terakhir</Text>

                            <View style={styles.lineChartContainer}>
                                {/* Y-Axis */}
                                <View style={styles.yAxis}>
                                    {[80, 60, 40, 20, 0].map((val, idx) => (
                                        <Text key={idx} style={styles.yAxisLabel}>{val}</Text>
                                    ))}
                                </View>

                                {/* Line Chart */}
                                <View style={styles.lineChartWrapper}>
                                    {/* Grid Lines */}
                                    <View style={styles.gridLines}>
                                        {[0, 1, 2, 3, 4].map(i => (
                                            <View key={i} style={styles.gridLine} />
                                        ))}
                                    </View>

                                    {/* Line and Points */}
                                    <View style={styles.lineGraph}>
                                        {trenBulanan.length > 0 && (
                                            <>
                                                {/* Draw line segments */}
                                                {trenBulanan.map((item, index) => {
                                                    if (index === trenBulanan.length - 1) return null;

                                                    const maxValue = Math.max(...trenBulanan.map(t => t.total), 1);
                                                    const y1 = (item.total / maxValue) * 100;
                                                    const y2 = (trenBulanan[index + 1].total / maxValue) * 100;
                                                    const x1 = (index / (trenBulanan.length - 1)) * 100;
                                                    const x2 = ((index + 1) / (trenBulanan.length - 1)) * 100;

                                                    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
                                                    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

                                                    return (
                                                        <View
                                                            key={`line-${index}`}
                                                            style={[
                                                                styles.lineSegment,
                                                                {
                                                                    left: `${x1}%`,
                                                                    bottom: `${y1}%`,
                                                                    width: `${length}%`,
                                                                    transform: [{ rotate: `${angle}deg` }],
                                                                }
                                                            ]}
                                                        />
                                                    );
                                                })}

                                                {/* Draw points */}
                                                {trenBulanan.map((item, index) => {
                                                    const maxValue = Math.max(...trenBulanan.map(t => t.total), 1);
                                                    const heightPercent = (item.total / maxValue) * 100;
                                                    const leftPercent = (index / (trenBulanan.length - 1)) * 100;

                                                    return (
                                                        <View
                                                            key={`point-${index}`}
                                                            style={[
                                                                styles.dataPoint,
                                                                {
                                                                    left: `${leftPercent}%`,
                                                                    bottom: `${heightPercent}%`
                                                                }
                                                            ]}
                                                        >
                                                            <View style={styles.dot} />
                                                        </View>
                                                    );
                                                })}
                                            </>
                                        )}
                                    </View>

                                    {/* X-Axis */}
                                    <View style={styles.xAxis}>
                                        {trenBulanan.map((item, index) => (
                                            <Text key={index} style={styles.xAxisLabel}>{item.bulan}</Text>
                                        ))}
                                    </View>
                                </View>
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
    chartCard: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 25,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#333",
        marginBottom: 5,
    },
    chartSubtitle: {
        fontSize: 14,
        color: "#999",
        marginBottom: 25,
    },
    barChartContainer: {
        flexDirection: "row",
        height: 280,
    },
    yAxisBar: {
        width: 40,
        justifyContent: "space-between",
        paddingRight: 10,
        paddingBottom: 30,
    },
    yAxisLabelBar: {
        fontSize: 12,
        color: "#666",
        textAlign: "right",
    },
    barsContainer: {
        flex: 1,
        position: "relative",
    },
    gridLinesBar: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 30,
        justifyContent: "space-between",
    },
    gridLineBar: {
        height: 1,
        backgroundColor: "#E0E0E0",
    },
    barsWrapper: {
        flex: 1,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-around",
        paddingBottom: 30,
    },
    barItem: {
        flex: 1,
        alignItems: "center",
        height: "100%",
        justifyContent: "flex-end",
    },
    barSpace: {
        width: "80%",
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
    },
    bar: {
        width: "100%",
        backgroundColor: "#4CAF50",
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        minHeight: 2,
    },
    barLabel: {
        fontSize: 11,
        color: "#666",
        textAlign: "center",
        marginTop: 8,
    },
    lineChartContainer: {
        flexDirection: "row",
        height: 300,
    },
    yAxis: {
        width: 40,
        justifyContent: "space-between",
        paddingRight: 10,
        paddingBottom: 40,
    },
    yAxisLabel: {
        fontSize: 12,
        color: "#666",
        textAlign: "right",
    },
    lineChartWrapper: {
        flex: 1,
        position: "relative",
    },
    gridLines: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 40,
        justifyContent: "space-between",
    },
    gridLine: {
        height: 1,
        backgroundColor: "#E0E0E0",
    },
    lineGraph: {
        flex: 1,
        position: "relative",
        marginBottom: 40,
    },
    lineSegment: {
        position: "absolute",
        height: 3,
        backgroundColor: "#4CAF50",
        transformOrigin: "left center",
    },
    dataPoint: {
        position: "absolute",
        width: 12,
        height: 12,
        marginLeft: -6,
        marginBottom: -6,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#4CAF50",
        borderWidth: 3,
        borderColor: "#fff",
    },
    xAxis: {
        flexDirection: "row",
        justifyContent: "space-between",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
        alignItems: "center",
    },
    xAxisLabel: {
        fontSize: 12,
        color: "#666",
        textAlign: "center",
        flex: 1,
    },
});