import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
    ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    ArrowLeft,
    Edit3,
    Save,
    X,
    LogOut,
    Eye,
    EyeOff,
    CheckCircle,
} from "lucide-react-native";
import { useLanguage } from "./contexts/LanguageContext";
import { useTheme } from "./contexts/ThemeContext";
import { API_URLS } from "../api/apiConfig";

interface UserData {
    nama: string;
    gmail: string;
    role: string;
    password?: string;
}

export default function ProfileScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { t, language } = useLanguage();
    const { colors, isDark } = useTheme();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        nama: "",
        gmail: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);

    // Cek dari mana user datang ke profile
    const fromDashboard = params.from === "dashboard";
    const fromSettings = params.from === "settings";

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const user = await AsyncStorage.getItem("user");
            if (user) {
                const parsed = JSON.parse(user);
                setUserData(parsed);
                setEditData({
                    nama: parsed.nama || "",
                    gmail: parsed.gmail || "",
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
            }
        } catch (error) {
            console.error("Error loading user data:", error);
        }
    };

    // Fungsi back yang pintar
    const handleBack = () => {
        if (fromDashboard) {
            // Kembali ke dashboard
            router.push("/user/dashboardUser");
        } else if (fromSettings) {
            // Kembali ke settings
            router.push("/user/settings");
        } else {
            // Default: kembali ke halaman sebelumnya
            router.back();
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            // Cancel editing - reset to original user data
            setEditData({
                nama: userData?.nama || "",
                gmail: userData?.gmail || "",
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        }
        setIsEditing(!isEditing);
    };

    const handleSave = async () => {
        if (!editData.nama.trim() || !editData.gmail.trim()) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }

        if (editData.newPassword && editData.newPassword !== editData.confirmPassword) {
            Alert.alert("Error", "New password and confirm password do not match");
            return;
        }

        if (editData.newPassword && editData.newPassword.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters long");
            return;
        }

        setLoading(true);

        try {
            // Simulate API call to update user data
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Create updated user object dengan type yang tepat
            const updatedUser: UserData = {
                nama: editData.nama,
                gmail: editData.gmail,
                role: userData?.role || "user", // Default role jika tidak ada
                ...(editData.newPassword && { password: editData.newPassword }),
            };

            await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
            setUserData(updatedUser);
            setIsEditing(false);
            setShowSuccessModal(true);

            // Reset password fields
            setEditData(prev => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            }));

        } catch (error) {
            console.error("Error saving user data:", error);
            Alert.alert("Error", "Failed to save changes");
        } finally {
            setLoading(false);
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
                        setLogoutLoading(true);
                        try {
                            // Call logout API
                            const res = await fetch(API_URLS.LOGOUT, { method: "GET" });

                            if (res.ok) {
                                // Clear local storage
                                await AsyncStorage.removeItem("user");

                                // Redirect to login page
                                router.replace("/");

                                Alert.alert("Success", "Logout Berhasil!");
                            } else {
                                Alert.alert("Error", "Gagal Logout");
                            }
                        } catch (error) {
                            console.error("Error during logout:", error);
                            Alert.alert("Error", "Server tidak merespons");
                        } finally {
                            setLogoutLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const styles = createStyles(colors, isDark);

    if (!userData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={handleBack}
                    style={styles.backButton}
                >
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t("myProfile")}</Text>
                <TouchableOpacity
                    onPress={handleEditToggle}
                    style={styles.editButton}
                >
                    {isEditing ? (
                        <X size={24} color={colors.text} />
                    ) : (
                        <Edit3 size={24} color={colors.text} />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {userData.nama.substring(0, 2).toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.username}>{userData.nama}</Text>
                    <Text style={styles.userEmail}>{userData.gmail}</Text>
                    <Text style={styles.userRole}>{userData.role}</Text>
                </View>

                {/* Edit Form */}
                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>
                        {isEditing ? t("editProfile") : t("profileInformation")}
                    </Text>

                    {/* Name Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>{t("fullName")}</Text>
                        <TextInput
                            style={[
                                styles.textInput,
                                !isEditing && styles.disabledInput
                            ]}
                            value={editData.nama}
                            onChangeText={(text) => setEditData(prev => ({ ...prev, nama: text }))}
                            placeholder="Enter your full name"
                            placeholderTextColor={colors.textSecondary}
                            editable={isEditing}
                        />
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>{t("email")}</Text>
                        <TextInput
                            style={[
                                styles.textInput,
                                !isEditing && styles.disabledInput
                            ]}
                            value={editData.gmail}
                            onChangeText={(text) => setEditData(prev => ({ ...prev, gmail: text }))}
                            placeholder="Enter your email"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={isEditing}
                        />
                    </View>

                    {/* Role Display (Read-only) */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>{t("role")}</Text>
                        <TextInput
                            style={[styles.textInput, styles.disabledInput]}
                            value={userData.role}
                            placeholder="Role"
                            placeholderTextColor={colors.textSecondary}
                            editable={false}
                        />
                    </View>

                    {/* Password Section - Only show when editing */}
                    {isEditing && (
                        <>
                            <View style={styles.passwordSection}>
                                <Text style={styles.sectionTitle}>Change Password</Text>

                                {/* Current Password */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Current Password</Text>
                                    <View style={styles.passwordInputContainer}>
                                        <TextInput
                                            style={styles.textInput}
                                            value={editData.currentPassword}
                                            onChangeText={(text) => setEditData(prev => ({ ...prev, currentPassword: text }))}
                                            placeholder="Enter current password"
                                            placeholderTextColor={colors.textSecondary}
                                            secureTextEntry={!showCurrentPassword}
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                            style={styles.eyeButton}
                                        >
                                            {showCurrentPassword ? (
                                                <EyeOff size={20} color={colors.textSecondary} />
                                            ) : (
                                                <Eye size={20} color={colors.textSecondary} />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* New Password */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>New Password</Text>
                                    <View style={styles.passwordInputContainer}>
                                        <TextInput
                                            style={styles.textInput}
                                            value={editData.newPassword}
                                            onChangeText={(text) => setEditData(prev => ({ ...prev, newPassword: text }))}
                                            placeholder="Enter new password"
                                            placeholderTextColor={colors.textSecondary}
                                            secureTextEntry={!showNewPassword}
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowNewPassword(!showNewPassword)}
                                            style={styles.eyeButton}
                                        >
                                            {showNewPassword ? (
                                                <EyeOff size={20} color={colors.textSecondary} />
                                            ) : (
                                                <Eye size={20} color={colors.textSecondary} />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Confirm Password */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Confirm New Password</Text>
                                    <View style={styles.passwordInputContainer}>
                                        <TextInput
                                            style={styles.textInput}
                                            value={editData.confirmPassword}
                                            onChangeText={(text) => setEditData(prev => ({ ...prev, confirmPassword: text }))}
                                            placeholder="Confirm new password"
                                            placeholderTextColor={colors.textSecondary}
                                            secureTextEntry={!showConfirmPassword}
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                            style={styles.eyeButton}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff size={20} color={colors.textSecondary} />
                                            ) : (
                                                <Eye size={20} color={colors.textSecondary} />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            {/* Save Button */}
                            <TouchableOpacity
                                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                                onPress={handleSave}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <Save size={20} color="#fff" />
                                        <Text style={styles.saveButtonText}>Save Changes</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Logout Button */}
                {!isEditing && (
                    <TouchableOpacity
                        style={[styles.logoutButton, logoutLoading && styles.logoutButtonDisabled]}
                        onPress={handleLogout}
                        disabled={logoutLoading}
                    >
                        {logoutLoading ? (
                            <ActivityIndicator size="small" color={colors.error} />
                        ) : (
                            <>
                                <LogOut size={20} color={colors.error} />
                                <Text style={[styles.logoutButtonText, { color: colors.error }]}>
                                    {t("logout")}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Success Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showSuccessModal}
                onRequestClose={() => setShowSuccessModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.successModal}>
                        <CheckCircle size={60} color={colors.success} />
                        <Text style={styles.successTitle}>Successfully Save Change!</Text>
                        <Text style={styles.successMessage}>
                            Your profile information has been updated successfully.
                        </Text>
                        <TouchableOpacity
                            style={styles.successButton}
                            onPress={() => setShowSuccessModal(false)}
                        >
                            <Text style={styles.successButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: colors.text,
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
    editButton: {
        padding: 5,
    },
    scrollView: {
        flex: 1,
        backgroundColor: colors.background,
    },
    profileCard: {
        alignItems: "center",
        backgroundColor: colors.card,
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 15,
        padding: 30,
        borderRadius: 20,
        elevation: isDark ? 0 : 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0 : 0.1,
        shadowRadius: 4,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
    },
    avatarText: {
        color: "#fff",
        fontSize: 32,
        fontWeight: "700",
    },
    username: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 5,
    },
    userEmail: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 5,
    },
    userRole: {
        fontSize: 12,
        color: colors.textSecondary,
        backgroundColor: isDark ? colors.border : "#f0f0f0",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    formSection: {
        backgroundColor: colors.card,
        marginHorizontal: 20,
        marginBottom: 15,
        borderRadius: 20,
        padding: 20,
        elevation: isDark ? 0 : 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0 : 0.1,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.text,
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: isDark ? colors.border : "#f5f5f5",
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: colors.text,
    },
    disabledInput: {
        backgroundColor: isDark ? "#2A2A2A" : "#f0f0f0",
        color: colors.textSecondary,
    },
    passwordSection: {
        marginTop: 10,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    passwordInputContainer: {
        position: "relative",
    },
    eyeButton: {
        position: "absolute",
        right: 15,
        top: 12,
        padding: 4,
    },
    saveButton: {
        backgroundColor: colors.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 15,
        borderRadius: 12,
        marginTop: 10,
        gap: 8,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isDark ? "#2A1A1A" : "#FEE2E2",
        marginHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 12,
        gap: 8,
    },
    logoutButtonDisabled: {
        opacity: 0.6,
    },
    logoutButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        padding: 20,
    },
    successModal: {
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 30,
        alignItems: "center",
        width: "100%",
        maxWidth: 400,
    },
    successTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.text,
        marginTop: 15,
        marginBottom: 8,
        textAlign: "center",
    },
    successMessage: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 20,
    },
    successButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 12,
        width: "100%",
        alignItems: "center",
    },
    successButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});