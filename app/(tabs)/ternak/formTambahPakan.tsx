import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import MenuSidebar from "../sidebar";
import { API_URLS } from "../../api/apiConfig";

type Kandang = {
  id_kandang: number;
  nm_kandang: string;
  kapasitas: number;
  jumlah_hewan: number;
  jenis_hewan: string;
  keterangan: string;
  Hasil_Produksi: string;
  Jml_produksi: number;
  tgl_produksi: string;
  lama_produksi: string;
};

export default function KandangScreen() {
  const params = useLocalSearchParams();
  const gmail = (params.gmail as string) || "";
  const nama = (params.nama as string) || "";

  const [data, setData] = useState<Kandang[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [nmKandang, setNmKandang] = useState("");
  const [kapasitas, setKapasitas] = useState("");
  const [jumlahHewan, setJumlahHewan] = useState("");
  const [jenisHewan, setJenisHewan] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [hasilProduksi, setHasilProduksi] = useState("");
  const [jmlProduksi, setJmlProduksi] = useState("");
  const [tglProduksi, setTglProduksi] = useState(new Date());
  const [lamaProduksi, setLamaProduksi] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URLS.KANDANG);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert("Error", "Gagal mengambil data kandang");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setTglProduksi(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('id-ID', options);
  };

  const handleSave = async () => {
    if (!nmKandang || !kapasitas || !jumlahHewan || !jenisHewan || !hasilProduksi || !jmlProduksi || !lamaProduksi) {
      return Alert.alert("Error", "Semua field wajib harus diisi");
    }

    const payload = {
      nm_kandang: nmKandang,
      kapasitas: parseInt(kapasitas),
      jumlah_hewan: parseInt(jumlahHewan),
      jenis_hewan: jenisHewan,
      keterangan: keterangan || "",
      Hasil_Produksi: hasilProduksi,
      Jml_produksi: parseInt(jmlProduksi),
      tgl_produksi: formatDate(tglProduksi),
      lama_produksi: lamaProduksi,
    };

    try {
      const url = selectedId
        ? `${API_URLS.KANDANG}/${selectedId}`
        : API_URLS.KANDANG;

      const options: RequestInit = {
        method: selectedId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      };

      console.log("Request URL:", url);
      console.log("Request Method:", options.method);
      console.log("Request Payload:", payload);

      const res = await fetch(url, options);
      const json = await res.json();

      console.log("Response status:", res.status);
      console.log("Response data:", json);

      if (res.ok) {
        Alert.alert("Sukses", json.message || "Berhasil disimpan");
        resetForm();
        fetchData();
      } else {
        Alert.alert("Error", json.message || `Gagal menyimpan data (${res.status})`);
      }
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", `Gagal menyimpan data: ${error}`);
    }
  };

  const resetForm = () => {
    setNmKandang("");
    setKapasitas("");
    setJumlahHewan("");
    setJenisHewan("");
    setKeterangan("");
    setHasilProduksi("");
    setJmlProduksi("");
    setTglProduksi(new Date());
    setLamaProduksi("");
    setSelectedId(null);
    setModalVisible(false);
  };

  const handleEdit = (item: Kandang) => {
    setSelectedId(item.id_kandang);
    setNmKandang(item.nm_kandang);
    setKapasitas(item.kapasitas.toString());
    setJumlahHewan(item.jumlah_hewan.toString());
    setJenisHewan(item.jenis_hewan);
    setKeterangan(item.keterangan || "");
    setHasilProduksi(item.Hasil_Produksi || "");
    setJmlProduksi(item.Jml_produksi?.toString() || "");
    setTglProduksi(item.tgl_produksi ? new Date(item.tgl_produksi) : new Date());
    setLamaProduksi(item.lama_produksi || "");
    setModalVisible(true);
  };

  const handleDelete = async (id_kandang: number) => {
    Alert.alert(
      "Konfirmasi Hapus",
      "Apakah Anda yakin ingin menghapus kandang ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              const url = `${API_URLS.KANDANG}/${id_kandang}`;
              console.log("Delete URL:", url);

              const response = await fetch(url, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  "Accept": "application/json",
                },
              });

              console.log("Delete response status:", response.status);
              const responseData = await response.json();
              console.log("Delete response data:", responseData);

              if (response.ok) {
                Alert.alert("Sukses", "Data kandang berhasil dihapus");
                fetchData();
              } else {
                Alert.alert("Error", responseData.message || "Gagal menghapus data");
              }
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", `Gagal menghubungi server: ${error}`);
            }
          },
        },
      ]
    );
  };

  const getPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  const getOvercrowdedItems = () => {
    return data.filter((item) => {
      const percentage = getPercentage(item.jumlah_hewan, item.kapasitas);
      return percentage >= 90;
    });
  };

  const renderWarningItem = (item: Kandang) => (
    <View style={styles.warningCard} key={item.id_kandang}>
      <Text style={styles.warningIcon}>⚠️</Text>
      <Text style={styles.warningText}>
        {item.nm_kandang} penuh ({item.jumlah_hewan}/{item.kapasitas} {item.jenis_hewan})!
      </Text>
    </View>
  );

  const renderKandangItem = ({ item }: { item: Kandang }) => {
    const percentage = getPercentage(item.jumlah_hewan, item.kapasitas);
    const isOvercrowded = percentage >= 90;
    const isAlmostFull = percentage >= 75 && percentage < 90;

    return (
      <View style={styles.kandangCard}>
        <View style={styles.kandangHeader}>
          <View style={styles.kandangInfo}>
            <Text style={styles.kandangName}>{item.nm_kandang}</Text>
            <Text style={styles.kandangJenis}>🐾 {item.jenis_hewan}</Text>
            {item.Hasil_Produksi && (
              <Text style={styles.kandangProduksi}>🥚 {item.Hasil_Produksi}</Text>
            )}
            {item.keterangan && (
              <Text style={styles.kandangKeterangan}>📝 {item.keterangan}</Text>
            )}
          </View>
          <View style={styles.kandangStats}>
            <Text style={styles.kandangAmount}>
              {item.jumlah_hewan}/{item.kapasitas}
            </Text>
            <Text style={styles.kandangPercentage}>{percentage}% Terisi</Text>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${percentage}%`,
                backgroundColor: isOvercrowded
                  ? "#FF6B6B"
                  : isAlmostFull
                    ? "#FFA500"
                    : "#1E3A3A",
              },
            ]}
          />
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.id_kandang)}
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

  const overcrowdedItems = getOvercrowdedItems();

  return (
    <View style={styles.mainContainer}>
      <MenuSidebar activeMenu="Ternak" gmail={gmail} nama={nama} />

      <View style={styles.container}>
        <View style={styles.topNavContainer}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/ternak/hewan" as any,
                params: { gmail, nama },
              })
            }
          >
            <Text style={styles.navText}>Hewan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.navButton, styles.navButtonActive]}>
            <Text style={[styles.navText, styles.navTextActive]}>Kandang</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/ternak/DataTernak" as any,
                params: { gmail, nama },
              })
            }
          >
            <Text style={styles.navText}>Inventori Pakan</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Manajemen Kandang</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+ Tambah Kandang</Text>
          </TouchableOpacity>
        </View>

        {overcrowdedItems.length > 0 && (
          <View style={styles.warningSection}>
            {overcrowdedItems.map((item) => renderWarningItem(item))}
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#1E3A3A" style={styles.loader} />
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id_kandang.toString()}
            renderItem={renderKandangItem}
            contentContainerStyle={styles.listContainer}
          />
        )}

        {/* MODAL FORM */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={resetForm}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {selectedId ? "Edit Data Kandang" : "Tambah Data Kandang"}
              </Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.inputLabel}>Nama Kandang *</Text>
                <TextInput
                  placeholder="Contoh: Kandang A1"
                  style={styles.input}
                  value={nmKandang}
                  onChangeText={setNmKandang}
                />

                <Text style={styles.inputLabel}>Kapasitas Maksimal *</Text>
                <TextInput
                  placeholder="Contoh: 100"
                  style={styles.input}
                  value={kapasitas}
                  keyboardType="number-pad"
                  onChangeText={setKapasitas}
                />

                <Text style={styles.inputLabel}>Jumlah Hewan Saat Ini *</Text>
                <TextInput
                  placeholder="Contoh: 50"
                  style={styles.input}
                  value={jumlahHewan}
                  keyboardType="number-pad"
                  onChangeText={setJumlahHewan}
                />

                <Text style={styles.inputLabel}>Jenis Hewan *</Text>
                <TextInput
                  placeholder="Contoh: Ayam Petelur"
                  style={styles.input}
                  value={jenisHewan}
                  onChangeText={setJenisHewan}
                />

                <Text style={styles.inputLabel}>Hasil Produksi *</Text>
                <TextInput
                  placeholder="Contoh: Telur"
                  style={styles.input}
                  value={hasilProduksi}
                  onChangeText={setHasilProduksi}
                />

                <Text style={styles.inputLabel}>Jumlah Produksi per Siklus *</Text>
                <TextInput
                  placeholder="Contoh: 50"
                  style={styles.input}
                  value={jmlProduksi}
                  keyboardType="number-pad"
                  onChangeText={setJmlProduksi}
                />

                <Text style={styles.inputLabel}>Tanggal Mulai Produksi *</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.datePickerText}>
                    📅 {formatDisplayDate(tglProduksi)}
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={tglProduksi}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                )}

                {Platform.OS === 'ios' && showDatePicker && (
                  <TouchableOpacity
                    style={styles.datePickerDoneButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.datePickerDoneText}>Selesai</Text>
                  </TouchableOpacity>
                )}

                <Text style={styles.inputLabel}>Lama Produksi (hari) *</Text>
                <TextInput
                  placeholder="Contoh: 30 atau 30 hari"
                  style={styles.input}
                  value={lamaProduksi}
                  onChangeText={setLamaProduksi}
                />

                <Text style={styles.inputLabel}>Keterangan</Text>
                <TextInput
                  placeholder="Keterangan tambahan (opsional)"
                  style={[styles.input, styles.textArea]}
                  value={keterangan}
                  onChangeText={setKeterangan}
                  multiline
                  numberOfLines={3}
                />
              </ScrollView>

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
    padding: 20,
  },
  topNavContainer: {
    flexDirection: "row",
    backgroundColor: "#1E3A3A",
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
  loader: {
    marginTop: 50,
    alignSelf: "center",
  },
  navButtonActive: {
    backgroundColor: "#4A3A2A",
  },
  navText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  navTextActive: {
    fontWeight: "600",
  },
  header: {
    backgroundColor: "white",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
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
  },
  warningSection: {
    marginBottom: 15,
  },
  warningCard: {
    flexDirection: "row",
    backgroundColor: "#FFF4E6",
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  warningText: {
    fontSize: 14,
    color: "#E65100",
  },
  listContainer: {
    paddingBottom: 15,
  },
  kandangCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
  },
  kandangHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  kandangInfo: {
    flex: 1,
  },
  kandangName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E3A3A",
  },
  kandangJenis: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  kandangProduksi: {
    fontSize: 13,
    color: "#4CAF50",
    marginTop: 2,
    fontWeight: "500",
  },
  kandangKeterangan: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
    marginTop: 2,
  },
  kandangStats: {
    alignItems: "flex-end",
  },
  kandangAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  kandangPercentage: {
    fontSize: 13,
    color: "#666",
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
    backgroundColor: "#1E3A3A",
    flexDirection: "row",
    padding: 8,
    borderRadius: 6,
  },
  editBtn: {
    backgroundColor: "#1E3A3A",
    flexDirection: "row",
    padding: 8,
    borderRadius: 6,
  },
  btnIcon: {
    marginRight: 4,
  },
  btnText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
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
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1E3A3A",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#F9F9F9",
  },
  datePickerText: {
    fontSize: 14,
    color: "#333",
  },
  datePickerDoneButton: {
    backgroundColor: "#1E3A3A",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  datePickerDoneText: {
    color: "white",
    fontWeight: "600",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    alignItems: "center",
    borderRadius: 8,
  },
  cancelBtn: {
    backgroundColor: "#F5F5F5",
  },
  saveBtn: {
    backgroundColor: "#1E3A3A",
  },
  cancelBtnText: {
    color: "#555",
    fontWeight: "600",
  },
  saveBtnText: {
    color: "white",
    fontWeight: "600",
  },
});