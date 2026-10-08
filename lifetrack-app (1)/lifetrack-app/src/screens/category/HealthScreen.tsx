import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const HEALTH_ITEMS = [
  { key: "workout", label: "Workout" },
  { key: "no_alcohol", label: "No alcohol / smoking" },
  { key: "balanced_meals", label: "3 balanced meals" },
  { key: "sleep_7h", label: "7+ hours of sleep" },
  { key: "screens_off", label: "Screens off before bed" },
];

export default function HealthScreen() {
  const { session } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("daily_logs")
      .select("item_key, completed")
      .eq("profile_id", session!.user.id)
      .eq("category_id", "health")
      .eq("log_date", today);
    const map: Record<string, boolean> = {};
    (data ?? []).forEach((d) => (map[d.item_key] = d.completed));
    setDone(map);
  }

  async function toggle(itemKey: string) {
    const newValue = !done[itemKey];
    setDone((prev) => ({ ...prev, [itemKey]: newValue }));
    await supabase.from("daily_logs").upsert(
      {
        profile_id: session!.user.id,
        category_id: "health",
        log_date: today,
        item_key: itemKey,
        completed: newValue,
      },
      { onConflict: "profile_id,category_id,log_date,item_key" }
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>Today's health checklist</Text>
      {HEALTH_ITEMS.map((item) => (
        <Pressable key={item.key} style={styles.row} onPress={() => toggle(item.key)}>
          <View style={[styles.checkbox, done[item.key] && styles.checkboxChecked]} />
          <Text style={styles.label}>{item.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  title: { fontSize: 20, fontWeight: "700", color: "#fff", marginBottom: 16 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#1E293B" },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#475569", marginRight: 12 },
  checkboxChecked: { backgroundColor: "#22C55E", borderColor: "#22C55E" },
  label: { color: "#fff", fontSize: 15 },
});
