import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import db from "../database/db";

interface GroceryItem {
  id: number;
  name: string;
  quantity: number;
  category: string;
  bought: number;
  created_at: number;
}

export default function MainScreen() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [category, setCategory] = useState("");

  // Load dữ liệu
  const loadItems = async () => {
    try {
      const rows = await db.getAllAsync(
        `SELECT * FROM grocery_items ORDER BY created_at DESC`
      );
      setItems(rows);
    } catch (error) {
      console.log("❌ Lỗi load dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // Thêm mới
  const addItem = async () => {
    if (!name.trim()) {
      Alert.alert("Lỗi", "Tên món không được rỗng!");
      return;
    }
    const qty = parseInt(quantity) || 1;
    const now = Math.floor(Date.now() / 1000);

    try {
      await db.runAsync(
        `INSERT INTO grocery_items (name, quantity, category, created_at, bought)
         VALUES (?, ?, ?, ?, 0);`,
        [name, qty, category || "", now]
      );
      setModalVisible(false);
      setName("");
      setQuantity("1");
      setCategory("");
      loadItems(); // reload danh sách ngay
    } catch (error) {
      console.log("❌ Lỗi thêm món:", error);
    }
  };

  const renderItem = ({ item }: { item: GroceryItem }) => (
    <View style={styles.itemContainer}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.detail}>
          Số lượng: {item.quantity} | Loại: {item.category || "-"}
        </Text>
      </View>
      <Text style={[styles.status, item.bought ? styles.bought : styles.notBought]}>
        {item.bought ? "Đã mua" : "Chưa mua"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Nút + */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* FlatList */}
      {loading ? (
        <Text>Đang tải dữ liệu...</Text>
      ) : items.length === 0 ? (
        <Text style={styles.emptyText}>Danh sách trống, thêm món cần mua nhé!</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Modal thêm mới */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Thêm món mới</Text>

            <TextInput
              placeholder="Tên món *"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              placeholder="Số lượng"
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Loại"
              style={styles.input}
              value={category}
              onChangeText={setCategory}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#4CAF50" }]}
                onPress={addItem}
              >
                <Text style={{ color: "#fff" }}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  itemContainer: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  name: { fontSize: 16, fontWeight: "bold" },
  detail: { fontSize: 14, color: "#555" },
  status: { fontWeight: "bold" },
  bought: { color: "green" },
  notBought: { color: "red" },
  emptyText: { textAlign: "center", marginTop: 20, fontSize: 16, color: "#888" },

  addButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  addButtonText: { fontSize: 36, color: "#fff", lineHeight: 36 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 10,
  },
});
