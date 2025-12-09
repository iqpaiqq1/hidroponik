import { useRouter } from "expo-router";
import {
    Award,
    ChevronLeft,
    Facebook,
    Globe,
    Heart,
    Instagram,
    Mail,
    MapPin,
    Phone,
    Target,
    Users
} from "lucide-react-native";
import * as React from "react";
import {
    Dimensions,
    Image,
    Linking,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useLanguage } from "../user/contexts/LanguageContext";
import { useTheme } from "../user/contexts/ThemeContext";

const { width } = Dimensions.get("window");

export default function AboutScreen() {
    const router = useRouter();
    const { t, language } = useLanguage();
    const { colors, isDark } = useTheme();

    const styles = createStyles(colors, isDark);

    const handleLinkPress = (url: string) => {
        Linking.openURL(url).catch((err) =>
            console.error("Failed to open URL:", err)
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle={isDark ? "light-content" : "dark-content"}
                backgroundColor={colors.background}
            />


            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <ChevronLeft size={26} color={colors.text} strokeWidth={2.5} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {language === "id" ? "Tentang" : "About"}
                </Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >

                <View style={styles.heroSection}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require("../../assets/images/AgroTech.png")}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.versionText}>Version 1.0.0</Text>
                    <Text style={styles.tagline}>
                        {language === "id"
                            ? "Solusi Pertanian Hidroponik Modern"
                            : "Modern Hydroponic Farming Solution"}
                    </Text>
                </View>


                <View style={styles.cardsContainer}>

                    <View style={styles.card}>
                        <View style={styles.cardIconContainer}>
                            <Target size={28} color="#5a8c36" strokeWidth={2} />
                        </View>
                        <Text style={styles.cardTitle}>
                            {language === "id" ? "Misi Kami" : "Our Mission"}
                        </Text>
                        <Text style={styles.cardDescription}>
                            {language === "id"
                                ? "Membantu petani meningkatkan produktivitas dengan teknologi hidroponik yang inovatif dan ramah lingkungan."
                                : "Helping farmers increase productivity with innovative and environmentally friendly hydroponic technology."}
                        </Text>
                    </View>

                    {/* Vision Card */}
                    <View style={styles.card}>
                        <View style={styles.cardIconContainer}>
                            <Award size={28} color="#5a8c36" strokeWidth={2} />
                        </View>
                        <Text style={styles.cardTitle}>
                            {language === "id" ? "Visi Kami" : "Our Vision"}
                        </Text>
                        <Text style={styles.cardDescription}>
                            {language === "id"
                                ? "Menjadi platform terdepan dalam transformasi digital pertanian Indonesia menuju era modern."
                                : "Becoming the leading platform in the digital transformation of Indonesian agriculture towards the modern era."}
                        </Text>
                    </View>
                </View>

                {/* Features Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {language === "id" ? "Fitur Utama" : "Key Features"}
                    </Text>

                    <View style={styles.featureItem}>
                        <View style={styles.featureIconBg}>
                            <Users size={22} color="#5a8c36" strokeWidth={2.5} />
                        </View>
                        <View style={styles.featureContent}>
                            <Text style={styles.featureTitle}>
                                {language === "id"
                                    ? "Manajemen Tanaman"
                                    : "Plant Management"}
                            </Text>
                            <Text style={styles.featureDescription}>
                                {language === "id"
                                    ? "Monitor dan kelola tanaman hidroponik Anda"
                                    : "Monitor and manage your hydroponic plants"}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.featureItem}>
                        <View style={styles.featureIconBg}>
                            <Heart size={22} color="#5a8c36" strokeWidth={2.5} />
                        </View>
                        <View style={styles.featureContent}>
                            <Text style={styles.featureTitle}>
                                {language === "id"
                                    ? "Pemantauan Sensor"
                                    : "Sensor Monitoring"}
                            </Text>
                            <Text style={styles.featureDescription}>
                                {language === "id"
                                    ? "Pantau kondisi lingkungan secara real-time"
                                    : "Monitor environmental conditions in real-time"}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.featureItem}>
                        <View style={styles.featureIconBg}>
                            <Target size={22} color="#5a8c36" strokeWidth={2.5} />
                        </View>
                        <View style={styles.featureContent}>
                            <Text style={styles.featureTitle}>
                                {language === "id"
                                    ? "Laporan Panen"
                                    : "Harvest Reports"}
                            </Text>
                            <Text style={styles.featureDescription}>
                                {language === "id"
                                    ? "Catat dan analisis hasil panen Anda"
                                    : "Record and analyze your harvest results"}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Contact Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {language === "id" ? "Hubungi Kami" : "Contact Us"}
                    </Text>

                    <TouchableOpacity
                        style={styles.contactItem}
                        onPress={() => handleLinkPress("mailto:Agriyaponik@gmail.com")}
                    >
                        <Mail size={22} color={colors.primary} strokeWidth={2} />
                        <Text style={styles.contactText}>Agriyaponik@gmail.com</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.contactItem}
                        onPress={() => handleLinkPress("telp:0812-6900-2464")}
                    >
                        <Phone size={22} color={colors.primary} strokeWidth={2} />
                        <Text style={styles.contactText}>+62 812-6900-2464</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.contactItem}
                        onPress={() =>
                            handleLinkPress("https://maps.app.goo.gl/iu1dGyV8aLfi5Mwf6?g_st=aw")
                        }
                    >
                        <MapPin size={22} color={colors.primary} strokeWidth={2} />
                        <Text style={styles.contactText}>
                            Jakarta, Indonesia
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.contactItem}
                        onPress={() => handleLinkPress("https://agriyaponik.com/")}
                    >
                        <Globe size={22} color={colors.primary} strokeWidth={2} />
                        <Text style={styles.contactText}>https://agriyaponik.com</Text>
                    </TouchableOpacity>
                </View>

                {/* Social Media */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {language === "id" ? "Media Sosial" : "Social Media"}
                    </Text>

                    <View style={styles.socialContainer}>
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() =>
                                handleLinkPress("https://share.google/bLYMbzmLuHmutJrcp")
                            }
                        >
                            <Instagram size={24} color="#fff" strokeWidth={2} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() =>
                                handleLinkPress("https://share.google/YAEYanpzbdn1d1J7n")
                            }
                        >
                            <Facebook size={24} color="#fff" strokeWidth={2} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => handleLinkPress("https://gofood.co.id/jakarta/restaurant/agriyaponik-fecdf186-fec0-41e7-bb9e-c0c9ae6fc313")}
                        >
                            <Globe size={24} color="#fff" strokeWidth={2} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Made with <Heart size={14} color="#e74c3c" fill="#e74c3c" /> by
                        AgroTech Team
                    </Text>
                    <Text style={styles.footerCopyright}>
                        © 2025 AgroTech Team
                    </Text>
                    <Text style={styles.footerSubtext}>
                        {language === "id"
                            ? "Semua hak dilindungi"
                            : "All rights reserved"}
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const createStyles = (colors: any, isDark: boolean) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingTop: 50,
            paddingBottom: 15,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        backButton: {
            width: 40,
            height: 40,
            justifyContent: "center",
            alignItems: "flex-start",
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: "700",
            color: colors.text,
            flex: 1,
            textAlign: "center",
        },
        placeholder: {
            width: 40,
        },
        scrollView: {
            flex: 1,
        },
        heroSection: {
            alignItems: "center",
            paddingVertical: 40,
            paddingHorizontal: 20,
        },
        logoContainer: {
            width: 130,
            height: 130,
            borderRadius: 65,
            backgroundColor: "#ffffff",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 18,
            elevation: 10,
            shadowColor: "#5a8c36",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            borderWidth: 2,
            borderColor: "#5a8c36",
        },
        logoText: {
            fontSize: 22,
            fontWeight: "700",
            color: "#fff",
            fontStyle: "italic",
        },
        versionText: {
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: 8,
        },
        tagline: {
            fontSize: 16,
            color: colors.text,
            textAlign: "center",
            fontWeight: "600",
            paddingHorizontal: 20,
        },
        cardsContainer: {
            paddingHorizontal: 20,
            gap: 15,
            marginBottom: 30,
        },
        card: {
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 25,
            elevation: 3,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0 : 0.1,
            shadowRadius: 4,
            borderWidth: isDark ? 1 : 0,
            borderColor: colors.border,
        },
        cardIconContainer: {
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: isDark ? "#2a4a1a" : "#e8f5e9",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 15,
        },
        cardTitle: {
            fontSize: 18,
            fontWeight: "700",
            color: colors.text,
            marginBottom: 10,
        },
        cardDescription: {
            fontSize: 14,
            color: colors.textSecondary,
            lineHeight: 22,
        },
        section: {
            paddingHorizontal: 20,
            marginBottom: 30,
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: "700",
            color: colors.text,
            marginBottom: 20,
        },
        featureItem: {
            flexDirection: "row",
            alignItems: "flex-start",
            marginBottom: 20,
            backgroundColor: colors.card,
            padding: 15,
            borderRadius: 15,
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDark ? 0 : 0.08,
            shadowRadius: 3,
        },
        featureIconBg: {
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: isDark ? "#2a4a1a" : "#e8f5e9",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 15,
        },
        featureContent: {
            flex: 1,
        },
        featureTitle: {
            fontSize: 16,
            fontWeight: "600",
            color: colors.text,
            marginBottom: 5,
        },
        featureDescription: {
            fontSize: 13,
            color: colors.textSecondary,
            lineHeight: 20,
        },
        contactItem: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.card,
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDark ? 0 : 0.08,
            shadowRadius: 3,
        },
        contactText: {
            fontSize: 15,
            color: colors.text,
            marginLeft: 15,
            fontWeight: "500",
        },
        socialContainer: {
            flexDirection: "row",
            justifyContent: "center",
            gap: 20,
        },
        socialButton: {
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: "#5a8c36",
            justifyContent: "center",
            alignItems: "center",
            elevation: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
        },
        footer: {
            alignItems: "center",
            paddingVertical: 30,
            paddingHorizontal: 20,
        },
        footerText: {
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: 8,
            flexDirection: "row",
            alignItems: "center",
        },
        footerCopyright: {
            fontSize: 13,
            fontWeight: "600",
            color: colors.text,
            marginBottom: 4,
        },
        footerSubtext: {
            fontSize: 12,
            color: colors.textSecondary,
        },
        logo: {
            width: "75%",
            height: "75%",
        },
    });