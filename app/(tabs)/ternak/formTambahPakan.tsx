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
} from "react-native";
import MenuSidebar from "../sidebar";
import { API_URLS } from "../../api/apiConfig";

type Kandang = {
  id_kandang: number;
  nm_kandang: string;
  kapasitas: number;
  jumlah_hewan: number;
  jenis_hewan: string;
  keterangan: string;
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

  const handleSave = async () => {
    if (!nmKandang || !kapasitas || !jumlahHewan || !jenisHewan) {
      return Alert.alert("Error", "Field wajib harus diisi");
    }

    const payload = {
      nm_kandang: nmKandang,
      kapasitas: parseInt(kapasitas),
      jumlah_hewan: parseInt(jumlahHewan),
      jenis_hewan: jenisHewan,
      keterangan: keterangan || "",
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
                <TextInput
                  placeholder="Nama Kandang"
                  style={styles.input}
                  value={nmKandang}
                  onChangeText={setNmKandang}
                />
                <TextInput
                  placeholder="Kapasitas Maksimal"
                  style={styles.input}
                  value={kapasitas}
                  keyboardType="numeric"
                  onChangeText={setKapasitas}
                />
                <TextInput
                  placeholder="Jumlah Hewan"
                  style={styles.input}
                  value={jumlahHewan}
                  keyboardType="numeric"
                  onChangeText={setJumlahHewan}
                />
                <TextInput
                  placeholder="Jenis Hewan"
                  style={styles.input}
                  value={jenisHewan}
                  onChangeText={setJenisHewan}
                />
                <TextInput
                  placeholder="Keterangan"
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
  },
  kandangKeterangan: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
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
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1E3A3A",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
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