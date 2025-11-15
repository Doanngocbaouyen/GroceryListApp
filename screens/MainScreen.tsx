import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { db } from "../database/db";

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

  const loadItems = () => {
    // @ts-ignore
    db.transaction((tx: any) => {
      console.log("Transaction bắt đầu");

      tx.executeSql(
        `SELECT * FROM grocery_items ORDER BY created_at DESC;`,
        [],
        (_, { rows }: any) => {
          console.log("Rows found:", rows.length);
          const data: GroceryItem[] = [];
          for (let i = 0; i < rows.length; i++) {
            data.push(rows.item(i));
          }
          setItems(data);
          setLoading(false);
        },
        (_, error: any) => {
          console.log("❌ Lỗi load dữ liệu:", error);
          setLoading(false);
          return true;
        }
      );
    });
  };

  useEffect(() => {
    loadItems();
  }, []);

  const renderItem = ({ item }: { item: GroceryItem }) => (
    <View style={styles.itemContainer}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.detail}>
          Số lượng: {item.quantity} | Loại: {item.category}
        </Text>
      </View>
      <Text
        style={[styles.status, item.bought ? styles.bought : styles.notBought]}
      >
        {item.bought ? "Đã mua" : "Chưa mua"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Đang tải dữ liệu...</Text>
      ) : items.length === 0 ? (
        <Text style={styles.emptyText}>
          Danh sách trống, thêm món cần mua nhé!
        </Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
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
});
