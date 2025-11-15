import React, { useEffect } from "react";
import MainScreen from "./screens/MainScreen";
import { initDatabase } from "./database/db";

export default function App() {
  useEffect(() => {
    initDatabase();
  }, []);

  return <MainScreen/>;
}
