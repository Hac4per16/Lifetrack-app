import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, FlatList } from "react-native";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Goal } from "@/types";

const GOAL_PRESETS = ["Buy a car", "Buy a house", "Trip", "Savings target"];

export default function GoalsScreen() {
  const { session } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("goals")
      .select("*")
      .eq("profile_id", session!.user.id)
      .order("created_at", { ascending: false });
    setGoals(data ?? []);
  }

  async function addGoal() {
    if (!title.trim()) return;
    await supabase.from("goals").insert({
      profile_id: session!.user.id,
      category_id: "finance",
      title,
      target_amount: Number(targetAmount) || null,
      current_amount: 0,
    });
    setTitle("");
    setTargetAmount("");
    load();
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>Your goals</Text>

          <View style={styles.presetsRow}>
            {GOAL_PRESETS.map((p) => (
              <Pressable key={p} style={styles.preset} onPress={() => setTitle(p)}>
                <Text style={styles.presetText}>{p}</Text>
              </Pressable>
            ))}
          </View>

          <TextInput style={styles.input} placeholder="Goal title" placeholderTextColor="#64748B" value={title} onChangeText={setTitle} />
          <TextInput
            style={styles.input}
            placeholder="Target amount ($, optional)"
            placeholderTextColor="#64748B"
            keyboardType="numeric"
            value={targetAmount}
            onChangeText={setTargetAmount}
          />
          <Pressable style={styles.button} onPress={addGoal}>
            <Text style={styles.buttonText}>Add goal</Text>
          </Pressable>
        </>
      }
      data={goals}
      keyExtractor={(g) => g.id}
      renderItem={({ item }) => {
        const pct = item.target_amount ? Math.min(100, Math.round((item.current_amount / item.target_amount) * 100)) : 0;
        return (
          <View style={styles.card}>
            <Text style={styles.goalTitle}>{item.title}</Text>
            {item.target_amount ? (
              <>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${pct}%` }]} />
                </View>
                <Text style={styles.goalMeta}>
                  ${item.current_amount} / ${item.target_amount} ({pct}%)
                </Text>
              </>
            ) : (
              <Text style={styles.goalMeta}>{item.status}</Text>
            )}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  title: { fontSize: 20, fontWeight: "700", color: "#fff", marginBottom: 16 },
  presetsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  preset: { backgroundColor: "#1E293B", borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12 },
  presetText: { color: "#94A3B8", fontSize: 12 },
  input: { backgroundColor: "#1E293B", color: "#fff", borderRadius: 10, padding: 12, marginBottom: 10 },
  button: { backgroundColor: "#22C55E", borderRadius: 10, padding: 14, alignItems: "center", marginBottom: 24 },
  buttonText: { color: "#0F172A", fontWeight: "600" },
  card: { backgroundColor: "#1E293B", borderRadius: 12, padding: 16, marginBottom: 12 },
  goalTitle: { color: "#fff", fontWeight: "600", marginBottom: 8 },
  progressTrack: { height: 6, backgroundColor: "#334155", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, backgroundColor: "#22C55E" },
  goalMeta: { color: "#94A3B8", marginTop: 6, fontSize: 12 },
});
