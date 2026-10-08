import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from "react-native";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export default function FinanceScreen() {
  const { session } = useAuth();
  const [savings, setSavings] = useState("");
  const [expenses, setExpenses] = useState("");
  const [creditScore, setCreditScore] = useState("");
  const [saved, setSaved] = useState(false);

  async function save() {
    await supabase.from("finance_snapshots").insert({
      profile_id: session!.user.id,
      savings: Number(savings) || 0,
      monthly_expenses: Number(expenses) || 0,
      credit_score: Number(creditScore) || null,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>Update your finances</Text>
      <Text style={styles.label}>Total savings ($)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={savings} onChangeText={setSavings} />
      <Text style={styles.label}>Monthly expenses ($)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={expenses} onChangeText={setExpenses} />
      <Text style={styles.label}>Credit score</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={creditScore} onChangeText={setCreditScore} />

      <Pressable style={styles.button} onPress={save}>
        <Text style={styles.buttonText}>Save snapshot</Text>
      </Pressable>
      {saved && <Text style={styles.saved}>Saved</Text>}

      <Text style={styles.note}>
        Tip: this feeds directly into your Goals progress (car, house, travel, savings target) on the Home tab.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  title: { fontSize: 20, fontWeight: "700", color: "#fff", marginBottom: 16 },
  label: { color: "#94A3B8", marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: "#1E293B", color: "#fff", borderRadius: 10, padding: 12 },
  button: { backgroundColor: "#22C55E", borderRadius: 10, padding: 14, alignItems: "center", marginTop: 24 },
  buttonText: { color: "#0F172A", fontWeight: "600" },
  saved: { color: "#22C55E", textAlign: "center", marginTop: 10 },
  note: { color: "#64748B", fontSize: 12, marginTop: 24, lineHeight: 18 },
});
