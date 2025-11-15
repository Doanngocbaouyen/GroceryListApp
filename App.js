import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, View, Button } from 'react-native';
import { initDB, getDB, executeSql } from './database/db';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function setup() {
      try {
        await initDB();
        console.log('Database initialized successfully');
        // optional: test insert + select
        // await executeSql('INSERT INTO grocery_items (name, quantity, category, bought, created_at) VALUES (?, ?, ?, ?, ?)', ['Test item', 1, 'Misc', 0, Date.now()]);
        const rows = await executeSql('SELECT * FROM grocery_items LIMIT 5');
        console.log('sample rows:', rows);
        setReady(true);
      } catch (err) {
        console.error('DB init error:', err);
      }
    }

    setup();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View>
        <Text style={{ fontSize: 18, marginBottom: 12 }}>Grocery List — DB init: {ready ? 'OK' : 'Starting...'}</Text>
        <Button title="Open Expo logs" onPress={() => { /* hướng dẫn mở logs từ terminal hoặc Expo Go */ }} />
      </View>
    </SafeAreaView>
  );
}
