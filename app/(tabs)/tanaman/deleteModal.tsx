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
                    <Text style={styles.text}>Anda yakin ingin menghapus data ini?</Text>
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.yesBtn} onPress={onConfirm}>
                            <Text style={styles.yesText}>Ya</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.noBtn} onPress={onClose}>
                            <Text style={styles.noText}>Tidak</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0008" },
    box: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "75%", alignItems: "center" },
    text: { fontSize: 16, marginBottom: 20, textAlign: "center" },
    row: { flexDirection: "row", justifyContent: "space-around", width: "100%" },
    yesBtn: { backgroundColor: "#4A7C2C", paddingVertical: 10, paddingHorizontal: 25, borderRadius: 8 },
    noBtn: { backgroundColor: "#ccc", paddingVertical: 10, paddingHorizontal: 25, borderRadius: 8 },
    yesText: { color: "#fff", fontWeight: "bold" },
    noText: { color: "#000" },
});
