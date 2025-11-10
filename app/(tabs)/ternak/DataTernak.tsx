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
} from "react-native";

type Pakan = {
  id_pakan: number;
  nm_pakan: string;
  jumlah_stok: number;
  tgl_beli: string;
  stok_maksimal?: number;
};

const API_URL = "http://10.102.220.183:8000/api/pakan";

export default function DataTernak() {
  // Ambil params dari router
  const params = useLocalSearchParams();
  const gmail = (params.gmail as string) || "";
  const nama = (params.nama as string) || "";

  const [data, setData] = useState<Pakan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [nmPakan, setNmPakan] = useState("");
  const [jumlahStok, setJumlahStok] = useState("");
  const [stokMaksimal, setStokMaksimal] = useState("");
  const [tglBeli, setTglBeli] = useState("");
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
    if (!nmPakan || !jumlahStok || !tglBeli || !stokMaksimal) {
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
          stok_maksimal: parseInt(stokMaksimal),
          tgl_beli: tglBeli,
        }),
      });

      const json = await res.json();
      Alert.alert("Sukses", json.message || "Berhasil disimpan");
      resetForm();
      fetchData();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Gagal menyimpan data");
    }
  };

  const resetForm = () => {
    setNmPakan("");
    setJumlahStok("");
    setStokMaksimal("");
    setTglBeli("");
    setSelectedId(null);
    setModalVisible(false);
  };

  const handleEdit = (item: Pakan) => {
    setSelectedId(item.id_pakan);
    setNmPakan(item.nm_pakan);
    setJumlahStok(item.jumlah_stok.toString());
    setStokMaksimal(item.stok_maksimal?.toString() || "");
    setTglBeli(item.tgl_beli);
    setModalVisible(true);
  };

  const handleDelete = async (id_pakan: number) => {
    try {
      const response = await fetch(`http://10.102.220.183:8000/api/pakan/${id_pakan}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message); // "Data pakan berhasil dihapus"
        alert("✅ Data pakan berhasil dihapus");
        fetchData(); // fungsi untuk refresh daftar pakan
      } else {
        const errorData = await response.json();
        alert(`⚠️ Gagal: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Terjadi kesalahan koneksi ke server");
    }
  };


  const getPercentage = (current: number, max: number = 100) => {
    return Math.round((current / max) * 100);
  };

  const getWarningItems = () => {
    return data.filter((item) => {
      const percentage = getPercentage(item.jumlah_stok, item.stok_maksimal || 100);
      return percentage < 30;
    });
  };

  const renderWarningItem = (item: Pakan) => (
    <View style={styles.warningCard} key={item.id_pakan}>
      <View style={styles.warningIcon}>
        <Text style={styles.warningIconText}>⚠️</Text>
      </View>
      <Text style={styles.warningText}>
        {item.nm_pakan} Tersisa {item.jumlah_stok} Kg!
      </Text>
    </View>
  );

  const renderPakanItem = ({ item }: { item: Pakan }) => {
    const maxStok = item.stok_maksimal || 100;
    const percentage = getPercentage(item.jumlah_stok, maxStok);
    const isLowStock = percentage < 30;

    return (
      <View style={styles.pakanCard}>
        <View style={styles.pakanHeader}>
          <View style={styles.pakanInfo}>
            <Text style={styles.pakanName}>{item.nm_pakan}</Text>
            <Text style={styles.pakanDate}>
              Terakhir Diisi: {new Date(item.tgl_beli).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </Text>
          </View>
          <View style={styles.pakanStats}>
            <Text style={styles.pakanAmount}>
              {item.jumlah_stok}/{maxStok} Kg
            </Text>
            <Text style={styles.pakanPercentage}>{percentage}%</Text>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${percentage}%`,
                backgroundColor: isLowStock ? "#FF6B6B" : "#1E3A3A",
              },
            ]}
          />
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.id_pakan)}
          >
            <Text style={styles.btnIcon}>🗑️</Text>
            <Text style={styles.btnText}>Hapus</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => handleEdit(item)}
          >
            <Text style={styles.btnIcon}>✏️</Text>
            <Text style={styles.btnText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const warningItems = getWarningItems();

  return (
    <View style={styles.mainContainer}>
      {/* Sidebar */}
      <MenuSidebar activeMenu="Ternak" gmail={gmail} nama={nama} />

      {/* Content Area */}
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Inventori Pakan Ternak</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+ Tambah Stok</Text>
          </TouchableOpacity>
        </View>

        {/* Warning Cards */}
        {warningItems.length > 0 && (
          <View style={styles.warningSection}>
            {warningItems.map((item) => renderWarningItem(item))}
          </View>
        )}

        {/* Data List */}
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

        {/* Modal Form */}
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
              <TextInput
                placeholder="Stok Maksimal (Kg)"
                style={styles.input}
                value={stokMaksimal}
                keyboardType="numeric"
                onChangeText={setStokMaksimal}
              />
              <TextInput
                placeholder="Tanggal Beli (YYYY-MM-DD)"
                style={styles.input}
                value={tglBeli}
                onChangeText={setTglBeli}
              />

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
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E3A3A",
  },
  pakanPercentage: {
    fontSize: 14,
    color: "#757575",
    marginTop: 2,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
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
    marginBottom: 12,
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