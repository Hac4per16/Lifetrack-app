import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Goal, FinanceSnapshot } from "@/types";

export default function HomeScreen() {
  const { session } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [finance, setFinance] = useState<FinanceSnapshot | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!session) return;
    loadGoals();
    loadFinance();
    loadStreak();
  }, [session]);

  async function loadGoals() {
    const { data } = await supabase
      .from("goals")
      .select("*")
      .eq("profile_id", session!.user.id)
      .eq("status", "in_progress")
      .limit(3);
    setGoals(data ?? []);
  }

  async function loadFinance() {
    const { data } = await supabase
      .from("finance_snapshots")
      .select("*")
      .eq("profile_id", session!.user.id)
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .maybeSingle();
    setFinance(data);
  }

  async function loadStreak() {
    // Simple version: count consecutive days with at least one completed log.
    // For production, replace with a SQL function / view for performance.
    const { data } = await supabase
      .from("daily_logs")
      .select("log_date, completed")
      .eq("profile_id", session!.user.id)
      .eq("completed", true)
      .order("log_date", { ascending: false })
      .limit(60);

    if (!data || data.length === 0) return setStreak(0);
    const days = [...new Set(data.map((d) => d.log_date))].sort().reverse();
    let count = 0;
    let cursor = new Date();
    for (const day of days) {
      const expected = cursor.toISOString().slice(0, 10);
      if (day === expected) {
        count++;
        cursor.setDate(cursor.getDate() - 1);
      } else break;
    }
    setStreak(count);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.greeting}>Welcome back</Text>
      <Text style={styles.streak}>{streak} day streak</Text>

      <Text style={styles.sectionTitle}>Your finances</Text>
      <View style={styles.card}>
        <Row label="Savings" value={finance ? `$${finance.savings}` : "—"} />
        <Row label="Monthly expenses" value={finance ? `$${finance.monthly_expenses}` : "—"} />
        <Row label="Credit score" value={finance ? `${finance.credit_score}` : "—"} />
      </View>

      <Text style={styles.sectionTitle}>Active goals</Text>
      {goals.length === 0 && <Text style={styles.empty}>No active goals yet. Add one from Categories.</Text>}
      {goals.map((g) => {
        const pct = g.target_amount ? Math.min(100, Math.round((g.current_amount / g.target_amount) * 100)) : 0;
        return (
          <View key={g.id} style={styles.card}>
            <Text style={styles.goalTitle}>{g.title}</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${pct}%` }]} />
            </View>
            <Text style={styles.goalMeta}>
              {g.target_amount ? `$${g.current_amount} / $${g.target_amount} (${pct}%)` : g.status}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 }}>
      <Text style={{ color: "#94A3B8" }}>{label}</Text>
      <Text style={{ color: "#fff", fontWeight: "600" }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  greeting: { fontSize: 24, fontWeight: "700", color: "#fff" },
  streak: { color: "#22C55E", marginBottom: 20 },
  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "600", marginTop: 20, marginBottom: 8 },
  card: { backgroundColor: "#1E293B", borderRadius: 12, padding: 16, marginBottom: 12 },
  empty: { color: "#64748B" },
  goalTitle: { color: "#fff", fontWeight: "600", marginBottom: 8 },
  progressTrack: { height: 6, backgroundColor: "#334155", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, backgroundColor: "#22C55E" },
  goalMeta: { color: "#94A3B8", marginTop: 6, fontSize: 12 },
});
