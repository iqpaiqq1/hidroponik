import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

type DeleteModalProps = {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

export default function DeleteModal({ visible, onClose, onConfirm }: DeleteModalProps) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.box}>
                    <Text style={styles.text}>
                        Anda yakin ingin menghapus data sensor ini?
                    </Text>
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.yesBtn} onPress={onConfirm}>
                            <Text style={styles.yesText}>Ya, Hapus</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.noBtn} onPress={onClose}>
                            <Text style={styles.noText}>Batal</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0008",
    },
    box: {
        backgroundColor: "#fff",
        padding: 25,
        borderRadius: 12,
        width: "80%",
        alignItems: "center",
    },
    text: {
        fontSize: 16,
        marginBottom: 25,
        textAlign: "center",
        color: "#333",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        gap: 15,
    },
    yesBtn: {
        backgroundColor: "#E91E63",
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        flex: 1,
        alignItems: "center",
    },
    noBtn: {
        backgroundColor: "#E0E0E0",
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        flex: 1,
        alignItems: "center",
    },
    yesText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },
    noText: {
        color: "#333",
        fontWeight: "600",
        fontSize: 14,
    },
});