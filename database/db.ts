import * as SQLite from "expo-sqlite";

// @ts-ignore: TypeScript không nhận transaction
export const db = SQLite.openDatabase("grocery.db");

export const initDatabase = () => {
  db.transaction((tx: any) => {
    // 1️⃣ Tạo bảng nếu chưa tồn tại
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS grocery_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        category TEXT,
        bought INTEGER DEFAULT 0,
        created_at INTEGER
      );`,
      [],
      () => console.log("✔ Tạo bảng grocery_items thành công"),
      (_, error: any) => {
        console.log("❌ Lỗi tạo bảng:", error);
        return true;
      }
    );

    // 2️⃣ Kiểm tra bảng có rỗng không
    tx.executeSql(
      `SELECT COUNT(*) as count FROM grocery_items;`,
      [],
      (_, { rows }: any) => {
        const count = rows.item(0).count;
        console.log("Số lượng bản ghi hiện tại:", count);

        if (count === 0) {
          // 3️⃣ Seed dữ liệu mẫu
          tx.executeSql(
            `INSERT INTO grocery_items (name, quantity, category, created_at)
             VALUES 
              ('Sữa', 1, 'Thực phẩm', strftime('%s','now')),
              ('Trứng', 12, 'Thực phẩm', strftime('%s','now')),
              ('Bánh mì', 1, 'Bếp', strftime('%s','now'));`,
            [],
            () => console.log("✔ Seed dữ liệu mẫu thành công"),
            (_, error: any) => {
              console.log("❌ Lỗi seed dữ liệu:", error);
              return true;
            }
          );
        }
      },
      (_, error: any) => {
        console.log("❌ Lỗi kiểm tra dữ liệu:", error);
        return true;
      }
    );
  });
};
import * as SQLite from "expo-sqlite";

// @ts-ignore: TypeScript không nhận transaction
export const db = SQLite.openDatabase("grocery.db");

export const initDatabase = () => {
  db.transaction((tx: any) => {
    // 1️⃣ Tạo bảng nếu chưa tồn tại
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS grocery_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        category TEXT,
        bought INTEGER DEFAULT 0,
        created_at INTEGER
      );`,
      [],
      () => console.log("✔ Tạo bảng grocery_items thành công"),
      (_, error: any) => {
        console.log("❌ Lỗi tạo bảng:", error);
        return true;
      }
    );

    // 2️⃣ Kiểm tra bảng có rỗng không
    tx.executeSql(
      `SELECT COUNT(*) as count FROM grocery_items;`,
      [],
      (_, { rows }: any) => {
        const count = rows.item(0).count;
        console.log("Số lượng bản ghi hiện tại:", count);

        if (count === 0) {
          // 3️⃣ Seed dữ liệu mẫu
          tx.executeSql(
            `INSERT INTO grocery_items (name, quantity, category, created_at)
             VALUES 
              ('Sữa', 1, 'Thực phẩm', strftime('%s','now')),
              ('Trứng', 12, 'Thực phẩm', strftime('%s','now')),
              ('Bánh mì', 1, 'Bếp', strftime('%s','now'));`,
            [],
            () => console.log("✔ Seed dữ liệu mẫu thành công"),
            (_, error: any) => {
              console.log("❌ Lỗi seed dữ liệu:", error);
              return true;
            }
          );
        }
      },
      (_, error: any) => {
        console.log("❌ Lỗi kiểm tra dữ liệu:", error);
        return true;
      }
    );
  });
};
