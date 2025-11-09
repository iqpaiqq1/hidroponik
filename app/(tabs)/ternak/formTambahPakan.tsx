import React, { useEffect, useState } from "react";
import MenuSidebar from "../sidebar";
import { useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

type Pakan = {
  id_pakan: number;
  nm_pakan: string;
  jumlah_stok: number;
  tgl_beli: string;
};

const API_URL = "http://192.168.1.7:8000/api/pakan";

export default function formTambahPakan() {
  const params = useLocalSearchParams();
  const gmail = (params.gmail as string) || "";
  const nama = (params.nama as string) || "";

  const [data, setData] = useState<Pakan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [nmPakan, setNmPakan] = useState("");
  const [jumlahStok, setJumlahStok] = useState("");
  const [tglBeli, setTglBeli] = useState(""); // Format: YYYY-MM-DD
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(API_URL);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!nmPakan || !jumlahStok || !tglBeli) {
      return Alert.alert("Error", "Semua field harus diisi");
    }
    try {
      const method = selectedId ? "PUT" : "POST";
      const url = selectedId ? `${API_URL}/${selectedId}` : API_URL;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nm_pakan: nmPakan,
          jumlah_stok: parseInt(jumlahStok),
          tgl_beli: tglBeli, // SELALU YYYY-MM-DD
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Gagal menyimpan");
      }

      const json = await res.json();
      Alert.alert("Sukses", json.message || "Berhasil disimpan");
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error.message || "Gagal menyimpan data");
    }
  };

  const resetForm = () => {
    setNmPakan("");
    setJumlahStok("");
    setTglBeli("");
    setSelectedId(null);
    setModalVisible(false);
    setShowDatePicker(false);
  };

  const handleEdit = (item: Pakan) => {
    setSelectedId(item.id_pakan);
    setNmPakan(item.nm_pakan);
    setJumlahStok(item.jumlah_stok.toString());
    setTglBeli(item.tgl_beli); // Harus YYYY-MM-DD dari API
    setModalVisible(true);
    setShowDatePicker(false);
  };

  const handleDelete = (id: number) => {
  Alert.alert(
    "Hapus Pakan",
    "Yakin ingin menghapus data pakan ini? Tindakan ini tidak bisa dibatalkan.",
    [
      {
        text: "Batal",
        style: "cancel",
      },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            if (res.ok) {
              Alert.alert("Sukses", "Data berhasil dihapus");
              fetchData();
            } else {
              const error = await res.text();
              Alert.alert("Error", error || "Gagal menghapus");
            }
          } catch (error) {
            console.error(error);
            Alert.alert("Error", "Koneksi gagal");
          }
        },
      },
    ],
    { cancelable: true }
  );
};

  const getWarningItems = () => {
    return data.filter((item) => item.jumlah_stok < 30);
  };

  const renderWarningItem = (item: Pakan) => (
    <View style={styles.warningCard} key={item.id_pakan}>
      <View style={styles.warningIcon}>
        <Text style={styles.warningIconText}>Warning</Text>
      </View>
      <Text style={styles.warningText}>
        {item.nm_pakan} Tersisa {item.jumlah_stok} Kg!
      </Text>
    </View>
  );

  const renderPakanItem = ({ item }: { item: Pakan }) => {
    const isLowStock = item.jumlah_stok < 30;
    return (
      <View style={styles.pakanCard}>
        <View style={styles.pakanHeader}>
          <View style={styles.pakanInfo}>
            <Text style={styles.pakanName}>{item.nm_pakan}</Text>
            <Text style={styles.pakanDate}>
              Terakhir Diisi: {new Date(item.tgl_beli).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
          <View style={styles.pakanStats}>
            <Text style={[styles.pakanAmount, isLowStock && { color: "#FF6B6B" }]}>
              {item.jumlah_stok} Kg
            </Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
         <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.id_pakan)} // Langsung panggil handleDelete
            >
            <Text style={styles.btnIcon}>Trash</Text>
            <Text style={styles.btnText}>Hapus</Text>
        </TouchableOpacity>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => handleEdit(item)}
          >
            <Text style={styles.btnIcon}>Edit</Text>
            <Text style={styles.btnText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const warningItems = getWarningItems();

  return (
    <View style={styles.mainContainer}>
      <MenuSidebar activeMenu="Ternak" gmail={gmail} nama={nama} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Inventori Pakan Ternak</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+ Tambah Stok</Text>
          </TouchableOpacity>
        </View>

        {warningItems.length > 0 && (
          <View style={styles.warningSection}>
            {warningItems.map((item) => renderWarningItem(item))}
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#1E3A3A" style={styles.loader} />
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id_pakan.toString()}
            renderItem={renderPakanItem}
            contentContainerStyle={styles.listContainer}
          />
        )}

        {/* MODAL */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={resetForm}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {selectedId ? "Edit Data Pakan" : "Tambah Data Pakan"}
              </Text>

              <TextInput
                placeholder="Nama Pakan"
                style={styles.input}
                value={nmPakan}
                onChangeText={setNmPakan}
              />

              <TextInput
                placeholder="Jumlah Stok (Kg)"
                style={styles.input}
                value={jumlahStok}
                keyboardType="numeric"
                onChangeText={setJumlahStok}
              />

              {/* TANGGAL: DATE PICKER (TIDAK BISA KETIK) */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                  Tanggal Beli
                </Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: tglBeli ? "#000" : "#999", fontSize: 14 }}>
                    {tglBeli || "Pilih tanggal..."}
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={tglBeli ? new Date(tglBeli) : new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(Platform.OS === "ios");
                      if (selectedDate) {
                        const year = selectedDate.getFullYear();
                        const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
                        const day = String(selectedDate.getDate()).padStart(2, "0");
                        const formatted = `${year}-${month}-${day}`;
                        setTglBeli(formatted);
                      }
                    }}
                  />
                )}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={resetForm}
                >
                  <Text style={styles.cancelBtnText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.saveBtn]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveBtnText}>Simpan</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#E8F4F8",
  },
  container: {
    flex: 1,
    backgroundColor: "#E8F4F8",
  },
  header: {
    backgroundColor: "white",
    padding: 20,
    paddingTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E3A3A",
  },
  addButton: {
    backgroundColor: "#1E3A3A",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  warningSection: {
    padding: 15,
  },
  warningCard: {
    backgroundColor: "#FFF4E6",
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  warningIcon: {
    marginRight: 10,
  },
  warningIconText: {
    fontSize: 20,
  },
  warningText: {
    color: "#E65100",
    fontSize: 14,
    fontWeight: "500",
  },
  listContainer: {
    padding: 15,
  },
  pakanCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pakanHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  pakanInfo: {
    flex: 1,
  },
  pakanName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E3A3A",
    marginBottom: 4,
  },
  pakanDate: {
    fontSize: 12,
    color: "#757575",
  },
  pakanStats: {
    alignItems: "flex-end",
  },
  pakanAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E3A3A",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 12,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E3A3A",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E3A3A",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  btnIcon: {
    marginRight: 4,
    fontSize: 14,
  },
  btnText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },
  loader: {
    marginTop: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E3A3A",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#F5F5F5",
  },
  cancelBtnText: {
    color: "#757575",
    fontWeight: "600",
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: "#1E3A3A",
  },
  saveBtnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },
});