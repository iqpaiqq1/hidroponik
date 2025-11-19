import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

// Data detail tanaman hidroponik
const tanamanDetailData: { [key: string]: any } = {
    Kangkung: {
        nama: "Kangkung",
        varietas: "Kangkung Bangkok",
        foto: null,
        deskripsi:
            "Kangkung hidroponik adalah jenis sayuran yang dibudidayakan tanpa tanah menggunakan nutrisi terlarut dalam air. Teknik ini menghasilkan tanaman yang lebih bersih, segar, bebas pestisida.",
        keunggulan: [
            "Bebas pestisida",
            "Pertumbuhan lebih cepat",
            "Daun lebih segar & renyah",
            "Dapat ditanam sepanjang tahun",
            "Hemat lahan & ramah lingkungan",
        ],
        syaratTumbuh: {
            ph: "5.5 – 6.5",
            ec: "1.0 – 1.8 mS/cm",
            suhuIdeal: "25–30°C",
            cahaya: "6–8 jam/hari",
            kelembapan: "60–80%",
        },
        caraPenanaman: [
            {
                title: "Penyemaian",
                desc: "Rendam benih 2–4 jam, semai di rockwool basah. Benih tumbuh 2–3 hari.",
            },
            {
                title: "Pindah Tanam",
                desc: "Pindahkan saat bibit 7–10 hari ke sistem hidroponik (NFT/DFT).",
            },
            {
                title: "Perawatan",
                desc: "Cek nutrisi berkala, pastikan aliran air lancar & suhu stabil.",
            },
            {
                title: "Panen",
                desc: "Siap panen umur 25–30 hari.",
            },
        ],
        lamaPanen: "25–30 Hari",
    },
    "Bayam Hijau": {
        nama: "Bayam Hijau",
        varietas: "Bayam Hijau Lokal",
        foto: null,
        deskripsi:
            "Bayam hijau hidroponik adalah sayuran kaya zat besi yang tumbuh tanpa tanah. Cocok untuk sistem NFT atau rakit apung, menghasilkan daun yang lebih tebal dan nutrisi tinggi.",
        keunggulan: [
            "Kaya zat besi & vitamin A",
            "Pertumbuhan cepat",
            "Bebas pestisida",
            "Daun lebih tebal",
            "Cocok untuk sistem NFT",
        ],
        syaratTumbuh: {
            ph: "6.0 – 7.0",
            ec: "1.8 – 2.3 mS/cm",
            suhuIdeal: "20–25°C",
            cahaya: "6–8 jam/hari",
            kelembapan: "60–70%",
        },
        caraPenanaman: [
            {
                title: "Penyemaian",
                desc: "Rendam benih 3–6 jam, semai di rockwool. Benih berkecambah 3–5 hari.",
            },
            {
                title: "Pindah Tanam",
                desc: "Pindahkan setelah bibit berumur 10–14 hari.",
            },
            {
                title: "Perawatan",
                desc: "Jaga pH dan EC stabil, pastikan sirkulasi air baik.",
            },
            {
                title: "Panen",
                desc: "Panen pada umur 25–30 hari setelah tanam.",
            },
        ],
        lamaPanen: "25–30 Hari",
    },
    Selada: {
        nama: "Selada",
        varietas: "Selada Keriting Hijau",
        foto: null,
        deskripsi:
            "Selada hidroponik adalah jenis selada yang dibudidayakan tanpa tanah menggunakan nutrisi terlarut dalam air. Teknik ini menghasilkan tanaman yang lebih bersih, segar, bebas pestisida.",
        keunggulan: [
            "Bebas pestisida",
            "Pertumbuhan lebih cepat",
            "Daun lebih segar & renyah",
            "Dapat ditanam sepanjang tahun",
            "Hemat lahan & ramah lingkungan",
        ],
        syaratTumbuh: {
            ph: "5.5 – 6.5",
            ec: "800 – 1200 ppm",
            suhuIdeal: "18–24°C",
            cahaya: "8 jam/hari",
            kelembapan: "50–70%",
        },
        caraPenanaman: [
            {
                title: "Penyemaian",
                desc: "Gunakan rockwool, jaga tetap lembap. Benih tumbuh 2–3 hari.",
            },
            {
                title: "Pindah Tanam",
                desc: "Pindahkan saat bibit 2–3 daun sejati.",
            },
            {
                title: "Perawatan",
                desc: "Cek nutrisi berkala, pastikan aliran air lancar & suhu stabil.",
            },
            {
                title: "Panen",
                desc: "Siap panen umur 30–40 hari.",
            },
        ],
        lamaPanen: "35–45 Hari",
    },
    Pakcoy: {
        nama: "Pakcoy",
        varietas: "Pakcoy Taiwan",
        foto: null,
        deskripsi:
            "Pakcoy hidroponik adalah sayuran hijau yang populer dalam sistem hidroponik. Tumbuh cepat, cocok untuk pemula, dan menghasilkan daun yang renyah dengan batang putih tebal.",
        keunggulan: [
            "Pertumbuhan sangat cepat",
            "Mudah dibudidayakan",
            "Bebas pestisida",
            "Kaya vitamin C & K",
            "Cocok untuk NFT & DFT",
        ],
        syaratTumbuh: {
            ph: "6.0 – 7.0",
            ec: "1.5 – 2.5 mS/cm",
            suhuIdeal: "18–25°C",
            cahaya: "6–8 jam/hari",
            kelembapan: "60–80%",
        },
        caraPenanaman: [
            {
                title: "Penyemaian",
                desc: "Semai benih di rockwool basah, jaga kelembapan.",
            },
            {
                title: "Pindah Tanam",
                desc: "Pindahkan setelah 7–10 hari ke sistem hidroponik.",
            },
            {
                title: "Perawatan",
                desc: "Pantau nutrisi dan pastikan cahaya cukup.",
            },
            {
                title: "Panen",
                desc: "Siap panen 30–35 hari setelah tanam.",
            },
        ],
        lamaPanen: "30–35 Hari",
    },
    Tomat: {
        nama: "Tomat",
        varietas: "Tomat Cherry Hidroponik",
        foto: null,
        deskripsi:
            "Tomat cherry hidroponik menghasilkan buah kecil manis dengan warna merah cerah. Cocok untuk sistem dutch bucket atau NFT dengan penyangga yang kuat.",
        keunggulan: [
            "Buah manis & segar",
            "Produktivitas tinggi",
            "Bebas pestisida",
            "Kaya likopen",
            "Cocok untuk sistem bucket",
        ],
        syaratTumbuh: {
            ph: "5.5 – 6.5",
            ec: "2.0 – 3.5 mS/cm",
            suhuIdeal: "21–27°C",
            cahaya: "8–10 jam/hari",
            kelembapan: "50–70%",
        },
        caraPenanaman: [
            {
                title: "Penyemaian",
                desc: "Semai benih di rockwool, taruh di tempat hangat.",
            },
            {
                title: "Pindah Tanam",
                desc: "Pindah ke bucket setelah 3–4 minggu.",
            },
            {
                title: "Perawatan",
                desc: "Pasang ajir/penyangga, pangkas tunas liar.",
            },
            {
                title: "Panen",
                desc: "Panen bertahap mulai umur 60–75 hari.",
            },
        ],
        lamaPanen: "60–75 Hari",
    },
    "Sawi Hijau": {
        nama: "Sawi Hijau",
        varietas: "Sawi Hijau Vitamin",
        foto: null,
        deskripsi:
            "Sawi hijau hidroponik adalah sayuran yang mudah tumbuh dengan daun hijau lebar. Cocok untuk berbagai sistem hidroponik dan tumbuh dengan cepat.",
        keunggulan: [
            "Pertumbuhan cepat",
            "Mudah dibudidayakan",
            "Kaya vitamin A & C",
            "Bebas hama tanah",
            "Hasil panen melimpah",
        ],
        syaratTumbuh: {
            ph: "6.0 – 7.0",
            ec: "1.5 – 2.5 mS/cm",
            suhuIdeal: "20–25°C",
            cahaya: "6–8 jam/hari",
            kelembapan: "60–75%",
        },
        caraPenanaman: [
            {
                title: "Penyemaian",
                desc: "Semai di rockwool, jaga kelembapan stabil.",
            },
            {
                title: "Pindah Tanam",
                desc: "Pindah setelah 10–14 hari ke sistem hidroponik.",
            },
            {
                title: "Perawatan",
                desc: "Cek EC & pH rutin, pastikan nutrisi tercukupi.",
            },
            {
                title: "Panen",
                desc: "Panen pada umur 30–35 hari.",
            },
        ],
        lamaPanen: "30–35 Hari",
    },
};

export default function DetailTanamanScreen() {
    const router = useRouter();
    const { nama } = useLocalSearchParams();

    // Get detail data based on nama
    const detailData = tanamanDetailData[nama as string] || tanamanDetailData["Selada"];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{detailData.nama} Detail</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Image */}
                <View style={styles.imageContainer}>
                    {detailData.foto ? (
                        <Image
                            source={{ uri: detailData.foto }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Image
                                source={{
                                    uri: "https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=800",
                                }}
                                style={styles.image}
                                resizeMode="cover"
                            />
                        </View>
                    )}
                </View>

                {/* Description Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <View style={styles.card}>
                        <Text style={styles.descriptionText}>{detailData.deskripsi}</Text>
                    </View>
                </View>

                {/* Keunggulan Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Keunggulan</Text>
                    <View style={styles.card}>
                        {detailData.keunggulan.map((item: string, index: number) => (
                            <View key={index} style={styles.bulletItem}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>{item}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Syarat Tumbuh Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Syarat Tumbuh</Text>
                    <View style={styles.card}>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.bulletText}>
                                pH: <Text style={styles.boldText}>{detailData.syaratTumbuh.ph}</Text>
                            </Text>
                        </View>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.bulletText}>
                                EC/TDS: <Text style={styles.boldText}>{detailData.syaratTumbuh.ec}</Text>
                            </Text>
                        </View>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.bulletText}>
                                Suhu Ideal:{" "}
                                <Text style={styles.boldText}>{detailData.syaratTumbuh.suhuIdeal}</Text>
                            </Text>
                        </View>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.bulletText}>
                                Cahaya: <Text style={styles.boldText}>{detailData.syaratTumbuh.cahaya}</Text>
                            </Text>
                        </View>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.bulletText}>
                                Kelembapan:{" "}
                                <Text style={styles.boldText}>{detailData.syaratTumbuh.kelembapan}</Text>
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Cara Penanaman Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cara Penanaman</Text>
                    <View style={styles.card}>
                        {detailData.caraPenanaman.map((item: any, index: number) => (
                            <View key={index} style={styles.stepItem}>
                                <Text style={styles.bullet}>•</Text>
                                <View style={styles.stepContent}>
                                    <Text style={styles.stepTitle}>{item.title}</Text>
                                    <Text style={styles.stepDesc}>{item.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#333",
    },
    scrollView: {
        flex: 1,
    },
    imageContainer: {
        width: "100%",
        height: 250,
        backgroundColor: "#f5f5f5",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    imagePlaceholder: {
        width: "100%",
        height: "100%",
        backgroundColor: "#e0e0e0",
    },
    section: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#333",
        marginBottom: 12,
    },
    card: {
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#e0e0e0",
        borderRadius: 12,
        padding: 16,
    },
    descriptionText: {
        fontSize: 14,
        color: "#555",
        lineHeight: 22,
    },
    bulletItem: {
        flexDirection: "row",
        marginBottom: 8,
    },
    bullet: {
        fontSize: 16,
        color: "#333",
        marginRight: 8,
        marginTop: 2,
    },
    bulletText: {
        flex: 1,
        fontSize: 14,
        color: "#555",
        lineHeight: 22,
    },
    boldText: {
        fontWeight: "700",
        color: "#333",
    },
    stepItem: {
        flexDirection: "row",
        marginBottom: 12,
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#333",
        marginBottom: 4,
    },
    stepDesc: {
        fontSize: 13,
        color: "#555",
        lineHeight: 20,
    },
});