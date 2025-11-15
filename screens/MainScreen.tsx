import React, { useEffect, useState, useMemo } from "react";
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
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [category, setCategory] = useState("");

  // Search
  const [searchText, setSearchText] = useState("");

  // Load dữ liệu từ SQLite
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

  // Thêm hoặc cập nhật món
  const saveItem = async () => {
    if (!name.trim()) {
      Alert.alert("Lỗi", "Tên món không được rỗng!");
      return;
    }
    const qty = parseInt(quantity) || 1;

    try {
      if (editingItem) {
        await db.runAsync(
          `UPDATE grocery_items SET name = ?, quantity = ?, category = ? WHERE id = ?;`,
          [name, qty, category || "", editingItem.id]
        );
      } else {
        const now = Math.floor(Date.now() / 1000);
        await db.runAsync(
          `INSERT INTO grocery_items (name, quantity, category, created_at, bought)
           VALUES (?, ?, ?, ?, 0);`,
          [name, qty, category || "", now]
        );
      }

      setModalVisible(false);
      setEditingItem(null);
      setName("");
      setQuantity("1");
      setCategory("");
      loadItems();
    } catch (error) {
      console.log("❌ Lỗi lưu món:", error);
    }
  };

  // Toggle bought
  const toggleBought = async (item: GroceryItem) => {
    try {
      const newStatus = item.bought ? 0 : 1;
      await db.runAsync(
        `UPDATE grocery_items SET bought = ? WHERE id = ?;`,
        [newStatus, item.id]
      );
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, bought: newStatus } : i))
      );
    } catch (error) {
      console.log("❌ Lỗi toggle bought:", error);
    }
  };

  const editItem = (item: GroceryItem) => {
    setEditingItem(item);
    setName(item.name);
    setQuantity(item.quantity.toString());
    setCategory(item.category);
    setModalVisible(true);
  };

  // ✅ Filter danh sách theo search text (useMemo để tối ưu)
  const filteredItems = useMemo(() => {
    const lower = searchText.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(lower));
  }, [items, searchText]);

  const renderItem = ({ item }: { item: GroceryItem }) => (
    <TouchableOpacity onPress={() => toggleBought(item)}>
      <View style={styles.itemContainer}>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.name,
              item.bought ? { textDecorationLine: "line-through", color: "#888" } : {},
            ]}
          >
            {item.name}
          </Text>
          <Text style={styles.detail}>
            Số lượng: {item.quantity} | Loại: {item.category || "-"}
          </Text>
        </View>

        <TouchableOpacity onPress={() => editItem(item)}>
          <Text style={{ color: "#2196F3", marginTop: 4 }}>Sửa</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search */}
      <TextInput
        placeholder="Tìm kiếm..."
        style={styles.searchInput}
        value={searchText}
        onChangeText={setSearchText}
      />

      {/* Nút + */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* FlatList */}
      {loading ? (
        <Text>Đang tải dữ liệu...</Text>
      ) : filteredItems.length === 0 ? (
        <Text style={styles.emptyText}>Danh sách trống hoặc không tìm thấy kết quả</Text>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Modal thêm/sửa */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{editingItem ? "Sửa món" : "Thêm món mới"}</Text>

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
                onPress={() => {
                  setModalVisible(false);
                  setEditingItem(null);
                }}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#4CAF50" }]}
                onPress={saveItem}
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
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
  },
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
