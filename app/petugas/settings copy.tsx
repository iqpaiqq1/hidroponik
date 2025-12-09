import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    Alert,
    ScrollView,
    Modal,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    ArrowLeft,
    HelpCircle,
    Info,
    Moon,
    Globe,
    ChevronRight,
    Settings as SettingsIcon,
    Home,
    User as UserIcon,
    X,
} from "lucide-react-native";
import { useLanguage } from "../user/contexts/LanguageContext";
import { useTheme } from "../user/contexts/ThemeContext";

interface UserData {
    gmail: string;
    nama: string;
    role: string;
}

export default function SettingsScreen() {
    const router = useRouter();
    const { language, setLanguage, t } = useLanguage();
    const { theme, toggleTheme, colors, isDark } = useTheme();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [languageModalVisible, setLanguageModalVisible] = useState(false);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const user = await AsyncStorage.getItem("user");
            if (user) {
                const parsed = JSON.parse(user);
                setUserData(parsed);
            }
        } catch (error) {
            console.error("Error loading user data:", error);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            t("logoutTitle"),
            t("logoutMessage"),
            [
                {
                    text: t("cancel"),
                    style: "cancel",
                },
                {
                    text: t("logout"),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem("user");
                            router.replace("/LoginScreen");
                        } catch (error) {
                            console.error("Error during logout:", error);
                        }
                    },
                },
            ]
        );
    };

    const handleHelp = () => {
        Alert.alert(
            t("helpTitle"),
            t("helpMessage"),
            [{ text: t("ok") }]
        );
        router.push("/user/help");
    };

    const handleAbout = () => {
        Alert.alert(
            t("aboutTitle"),
            t("aboutMessage"),
            [{ text: t("ok") }]
        );
        router.push("/user/about");
    };

    const handleLanguageSelect = (lang: "id" | "en") => {
        setLanguage(lang);
        setLanguageModalVisible(false);
    };

    const styles = createStyles(colors, isDark);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.push("/petugas/dashboardPetugas")}
                    style={styles.backButton}
                >
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t("settings")}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* User Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {userData?.nama.substring(0, 2).toUpperCase() || "AR"}
                        </Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{userData?.nama || t("fullName")}</Text>
                        <Text style={styles.profileEmail}>{userData?.gmail || "user@email.com"}</Text>
                    </View>
                </View>

                {/* Menu Section 1: Help & About */}
                <View style={styles.menuSection}>
                    {/* Help Button */}
                    <TouchableOpacity style={styles.menuItem} onPress={handleHelp}>
                        <View style={[styles.menuIconContainer, { backgroundColor: colors.info }]}>
                            <HelpCircle size={20} color="#fff" />
                        </View>
                        <Text style={styles.menuText}>{t("help")}</Text>
                        <ChevronRight size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    {/* About Button */}
                    <TouchableOpacity style={styles.menuItem} onPress={handleAbout}>
                        <View style={[styles.menuIconContainer, { backgroundColor: colors.primary }]}>
                            <Info size={20} color="#fff" />
                        </View>
                        <Text style={styles.menuText}>{t("about")}</Text>
                        <ChevronRight size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Menu Section 2: Dark Mode & Language */}
                <View style={styles.menuSection}>
                    <View style={styles.menuItem}>
                        <View style={[styles.menuIconContainer, { backgroundColor: "#5A4A42" }]}>
                            <Moon size={20} color="#fff" />
                        </View>
                        <Text style={styles.menuText}>{t("darkMode")}</Text>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: "#D1D5DB", true: colors.primary }}
                            thumbColor="#fff"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => setLanguageModalVisible(true)}
                    >
                        <View style={[styles.menuIconContainer, { backgroundColor: "#8B7355" }]}>
                            <Globe size={20} color="#fff" />
                        </View>
                        <View style={styles.languageContainer}>
                            <Text style={styles.menuText}>{t("language")}</Text>
                            <Text style={styles.languageText}>
                                {language === "id" ? t("indonesia") : t("english")}
                            </Text>
                        </View>
                        <ChevronRight size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                

                <View style={{ height: 120 }} />
            </ScrollView>

           
            {/* Language Selection Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={languageModalVisible}
                onRequestClose={() => setLanguageModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t("selectLanguage")}</Text>
                            <TouchableOpacity
                                onPress={() => setLanguageModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <X size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.currentLanguageInfo}>
                            <Text style={styles.currentLanguageText}>
                                {t("currentLanguage")}: {language === "id" ? t("indonesia") : t("english")}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.languageOption,
                                language === "id" && styles.languageOptionActive
                            ]}
                            onPress={() => handleLanguageSelect("id")}
                        >
                            <View style={styles.languageFlagContainer}>
                                <Text style={styles.languageFlag}>🇮🇩</Text>
                                <View style={styles.languageTextContainer}>
                                    <Text style={[
                                        styles.languageOptionText,
                                        language === "id" && styles.languageOptionTextActive
                                    ]}>
                                        {t("indonesia")}
                                    </Text>
                                    <Text style={styles.languageSubtext}>
                                        Indonesia
                                    </Text>
                                </View>
                            </View>
                            {language === "id" && (
                                <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]} />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.languageOption,
                                language === "en" && styles.languageOptionActive
                            ]}
                            onPress={() => handleLanguageSelect("en")}
                        >
                            <View style={styles.languageFlagContainer}>
                                <Text style={styles.languageFlag}>🇺🇸</Text>
                                <View style={styles.languageTextContainer}>
                                    <Text style={[
                                        styles.languageOptionText,
                                        language === "en" && styles.languageOptionTextActive
                                    ]}>
                                        {t("english")}
                                    </Text>
                                    <Text style={styles.languageSubtext}>
                                        English
                                    </Text>
                                </View>
                            </View>
                            {language === "en" && (
                                <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Bottom Navigation */}
            <View style={[styles.bottomNav, { backgroundColor: colors.primary }]}>
                <TouchableOpacity
                    style={[styles.navItem, styles.navItemActive]}
                >
                    <SettingsIcon size={28} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push("/user/dashboardUser")}
                >
                    <Home size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push({
                        pathname: "/user/profile",
                        params: { from: "settings" }
                    })}
                >
                    <UserIcon size={24} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.text,
    },
    scrollView: {
        flex: 1,
        backgroundColor: colors.background,
    },
    profileCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.card,
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 15,
        padding: 20,
        borderRadius: 20,
        elevation: isDark ? 0 : 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0 : 0.1,
        shadowRadius: 4,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "700",
    },
    profileInfo: {
        marginLeft: 15,
        flex: 1,
    },
    profileName: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    menuSection: {
        backgroundColor: colors.card,
        marginHorizontal: 20,
        marginBottom: 15,
        borderRadius: 20,
        padding: 10,
        elevation: isDark ? 0 : 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0 : 0.1,
        shadowRadius: 4,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#6B5344",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        fontWeight: "600",
        color: colors.text,
    },
    languageContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    languageText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginRight: 10,
    },
    logoutButton: {
        backgroundColor: isDark ? "#2A1A1A" : "#FEE2E2",
        borderRadius: 15,
        marginHorizontal: 5,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        padding: 20,
    },
    modalContent: {
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 0,
        width: "100%",
        maxWidth: 400,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.text,
    },
    closeButton: {
        padding: 4,
    },
    languageOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    languageOptionActive: {
        backgroundColor: isDark ? "#2A2A2A" : "#f0f7e8",
    },
    languageOptionText: {
        fontSize: 16,
        color: colors.text,
        fontWeight: "500",
    },
    languageOptionTextActive: {
        color: colors.primary,
        fontWeight: "600",
    },
    selectedIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    bottomNav: {
        flexDirection: "row",
        borderRadius: 35,
        marginHorizontal: 20,
        marginBottom: 20,
        paddingVertical: 15,
        paddingHorizontal: 30,
        justifyContent: "space-around",
        alignItems: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    navItem: {
        padding: 10,
    },
    navItemActive: {
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 50,
        padding: 15,
    },
    // Di createStyles function, tambahkan styles berikut:

    currentLanguageInfo: {
        padding: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    currentLanguageText: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    languageFlagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    languageFlag: {
        fontSize: 24,
        marginRight: 12,
    },
    languageTextContainer: {
        flex: 1,
    },
    languageSubtext: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
});