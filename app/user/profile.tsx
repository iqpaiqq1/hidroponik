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
    Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';
import {
    ArrowLeft,
    Edit3,
    Save,
    X,
    LogOut,
    Eye,
    EyeOff,
    CheckCircle,
    Camera,
    Upload,
} from "lucide-react-native";
import { useLanguage } from "./contexts/LanguageContext";
import { useTheme } from "./contexts/ThemeContext";
import { API_URLS } from "../api/apiConfig";

interface UserData {
    id: string;
    nama: string;
    username: string;
    gmail: string;
    role: string;
    password?: string;
    profile_picture?: string;
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
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [showImageOptions, setShowImageOptions] = useState(false);

    const fromDashboard = params.from === "dashboard";
    const fromSettings = params.from === "settings";

    useEffect(() => {
        loadUserData();
        requestPermissions();
    }, []);

    const requestPermissions = async () => {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
            Alert.alert(
                'Permissions Required',
                'Camera and photo library permissions are needed to change profile picture.'
            );
        }
    };

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
                if (parsed.profile_picture) {
                    setSelectedImage(parsed.profile_picture);
                }
            }
        } catch (error) {
            console.error("Error loading user data:", error);
        }
    };

    const handleBack = () => {
        if (fromDashboard) {
            router.push("/user/dashboardUser");
        } else if (fromSettings) {
            router.push("/user/settings");
        } else {
            router.back();
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            setEditData({
                nama: userData?.nama || "",
                gmail: userData?.gmail || "",
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setSelectedImage(userData?.profile_picture || null);
        }
        setIsEditing(!isEditing);
    };

    const pickImageFromCamera = async () => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled && result.assets[0]) {
                setSelectedImage(result.assets[0].uri);
                setShowImageOptions(false);
            }
        } catch (error) {
            console.error("Error picking image from camera:", error);
            Alert.alert("Error", "Failed to open camera");
        }
    };

    const pickImageFromGallery = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled && result.assets[0]) {
                setSelectedImage(result.assets[0].uri);
                setShowImageOptions(false);
            }
        } catch (error) {
            console.error("Error picking image from gallery:", error);
            Alert.alert("Error", "Failed to open gallery");
        }
    };

    const uploadProfilePicture = async (imageUri: string, userId: string): Promise<string | null> => {
        try {
            console.log('=== START UPLOAD PROFILE PICTURE ===');
            console.log('Image URI:', imageUri);
            console.log('User ID:', userId);

            const formData = new FormData();
            const uriParts = imageUri.split('.');
            const fileType = uriParts[uriParts.length - 1];

            formData.append('profile_picture', {
                uri: imageUri,
                name: `profile_${userId}.${fileType}`,
                type: `image/${fileType}`,
            } as any);

            formData.append('id_user', userId);

            const uploadUrl = `${API_URLS.USER}/upload-profile-picture`;
            console.log('Upload URL:', uploadUrl);

            console.log('Sending upload request...');
            const response = await fetch(uploadUrl, {
                method: 'POST',
                body: formData,
            });

            console.log('Upload response status:', response.status);
            console.log('Upload response headers:', response.headers);

            const contentType = response.headers.get("content-type");
            console.log('Content-Type:', contentType);

            const responseText = await response.text();
            console.log('Raw response:', responseText);

            if (!contentType || !contentType.includes("application/json")) {
                console.error("Non-JSON response received");
                throw new Error("Server returned non-JSON response");
            }

            const data = JSON.parse(responseText);
            console.log('Parsed upload data:', data);

            if (response.ok && data.success) {
                console.log('Upload successful, path:', data.data?.profile_picture);
                return data.data?.profile_picture || null;
            } else {
                throw new Error(data.message || 'Failed to upload image');
            }
        } catch (error) {
            console.error("=== ERROR UPLOADING PROFILE PICTURE ===");
            console.error("Error details:", error);
            throw error;
        }
    };

    const handleSave = async () => {
        console.log('=== START HANDLE SAVE ===');

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
        console.log('Loading state set to true');

        try {
            let profilePictureUrl: string | null | undefined = userData?.profile_picture;
            console.log('Initial profile picture:', profilePictureUrl);
            console.log('Selected image:', selectedImage);
            console.log('User data profile picture:', userData?.profile_picture);

            // Upload profile picture if changed
            if (selectedImage && selectedImage !== userData?.profile_picture) {
                console.log('Image changed, uploading new image...');
                try {
                    const uploadedPath = await uploadProfilePicture(selectedImage, userData!.id);
                    console.log('Upload completed, path:', uploadedPath);
                    if (uploadedPath) {
                        profilePictureUrl = uploadedPath;
                    }
                } catch (uploadError) {
                    console.error("Failed to upload image:", uploadError);
                    Alert.alert("Warning", "Failed to upload profile picture, but will save other changes");
                }
            } else {
                console.log('No image change detected');
            }

            // Prepare update data
            const updateData: any = {
                nama: editData.nama,
                gmail: editData.gmail,
            };

            if (editData.newPassword) {
                updateData.password = editData.newPassword;
                console.log('Password will be updated');
            }

            if (profilePictureUrl) {
                updateData.profile_picture = profilePictureUrl;
            }

            console.log('Update data:', JSON.stringify(updateData, null, 2));

            const updateUrl = `${API_URLS.USER}/${userData?.id}`;
            console.log('Update URL:', updateUrl);

            console.log('Sending update request...');
            const response = await fetch(updateUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            console.log('Update response status:', response.status);
            console.log('Update response headers:', response.headers);

            const contentType = response.headers.get("content-type");
            console.log('Content-Type:', contentType);

            const responseText = await response.text();
            console.log('Raw update response:', responseText);

            if (!contentType || !contentType.includes("application/json")) {
                console.error("Non-JSON response from update");
                throw new Error("Server returned non-JSON response");
            }

            const data = JSON.parse(responseText);
            console.log('Parsed update data:', data);

            if (response.ok) {
                console.log('Update successful!');

                // Update local storage
                const updatedUser: UserData = {
                    ...userData!,
                    nama: editData.nama,
                    gmail: editData.gmail,
                    profile_picture: profilePictureUrl || userData?.profile_picture,
                };

                console.log('Saving to AsyncStorage:', updatedUser);
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

                console.log('Save completed successfully!');
            } else {
                console.error('Update failed:', data.message);
                Alert.alert("Error", data.message || "Failed to save changes");
            }
        } catch (error) {
            console.error("=== ERROR IN HANDLE SAVE ===");
            console.error("Error type:", typeof error);
            console.error("Error details:", error);
            console.error("Error message:", error instanceof Error ? error.message : 'Unknown error');
            console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');

            Alert.alert(
                "Error",
                error instanceof Error ? error.message : "Failed to save changes. Please check your connection."
            );
        } finally {
            console.log('Setting loading to false');
            setLoading(false);
            console.log('=== END HANDLE SAVE ===');
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
                            const res = await fetch(API_URLS.LOGOUT, { method: "GET" });

                            if (res.ok) {
                                await AsyncStorage.removeItem("user");
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
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t("myProfile")}</Text>
                <TouchableOpacity onPress={handleEditToggle} style={styles.editButton}>
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
                    <View style={styles.avatarWrapper}>
                        {selectedImage ? (
                            <Image
                                source={{ uri: selectedImage }}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <View style={styles.avatarContainer}>
                                <Text style={styles.avatarText}>
                                    {userData.nama.substring(0, 2).toUpperCase()}
                                </Text>
                            </View>
                        )}
                        {isEditing && (
                            <TouchableOpacity
                                style={styles.cameraButton}
                                onPress={() => setShowImageOptions(true)}
                            >
                                <Camera size={18} color="#fff" />
                            </TouchableOpacity>
                        )}
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
                            style={[styles.textInput, !isEditing && styles.disabledInput]}
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
                            style={[styles.textInput, !isEditing && styles.disabledInput]}
                            value={editData.gmail}
                            onChangeText={(text) => setEditData(prev => ({ ...prev, gmail: text }))}
                            placeholder="Enter your email"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={isEditing}
                        />
                    </View>

                    {/* Role Display */}
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

                    {/* Password Section */}
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

            {/* Image Options Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showImageOptions}
                onRequestClose={() => setShowImageOptions(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.imageOptionsModal}>
                        <Text style={styles.modalTitle}>Change Profile Picture</Text>

                        <TouchableOpacity
                            style={styles.imageOptionButton}
                            onPress={pickImageFromCamera}
                        >
                            <Camera size={24} color={colors.primary} />
                            <Text style={styles.imageOptionText}>Take Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.imageOptionButton}
                            onPress={pickImageFromGallery}
                        >
                            <Upload size={24} color={colors.primary} />
                            <Text style={styles.imageOptionText}>Choose from Gallery</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowImageOptions(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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
    avatarWrapper: {
        position: "relative",
        marginBottom: 15,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    avatarText: {
        color: "#fff",
        fontSize: 32,
        fontWeight: "700",
    },
    cameraButton: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: colors.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: colors.card,
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
    imageOptionsModal: {
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 20,
        width: "100%",
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 20,
        textAlign: "center",
    },
    imageOptionButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: isDark ? colors.border : "#f5f5f5",
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        gap: 12,
    },
    imageOptionText: {
        fontSize: 16,
        color: colors.text,
        fontWeight: "500",
    },
    cancelButton: {
        backgroundColor: isDark ? "#2A1A1A" : "#FEE2E2",
        padding: 15,
        borderRadius: 12,
        marginTop: 10,
        alignItems: "center",
    },
    cancelButtonText: {
        fontSize: 16,
        color: colors.error,
        fontWeight: "600",
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