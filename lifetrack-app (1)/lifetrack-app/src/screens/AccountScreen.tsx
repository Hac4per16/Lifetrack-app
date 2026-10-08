import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Profile } from "@/types";

export default function AccountScreen({ navigation }: any) {
  const { session, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [connectionsCount, setConnectionsCount] = useState(0);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase.from("profiles").select("*").eq("id", session!.user.id).single();
    setProfile(data);

    const { count } = await supabase
      .from("connections")
      .select("*", { count: "exact", head: true })
      .or(`requester_id.eq.${session!.user.id},recipient_id.eq.${session!.user.id}`)
      .eq("status", "accepted");
    setConnectionsCount(count ?? 0);
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{profile?.full_name?.[0] ?? "?"}</Text>
      </View>
      <Text style={styles.name}>{profile?.full_name ?? "—"}</Text>
      <Text style={styles.email}>{session?.user.email}</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{connectionsCount}</Text>
          <Text style={styles.statLabel}>Connected</Text>
        </View>
      </View>

      <Pressable style={styles.row} onPress={() => navigation.navigate("FamilyConnect")}>
        <Text style={styles.rowText}>Connect partner / family</Text>
      </Pressable>
      <Pressable style={styles.row} onPress={() => navigation.navigate("Goals")}>
        <Text style={styles.rowText}>My goals</Text>
      </Pressable>
      <Pressable style={styles.row} onPress={() => navigation.navigate("Finance")}>
        <Text style={styles.rowText}>Finance history</Text>
      </Pressable>

      <Pressable style={styles.signOut} onPress={signOut}>
        <Text style={styles.signOutText}>Log out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A", padding: 20, alignItems: "center" },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#334155", alignItems: "center", justifyContent: "center", marginTop: 20 },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "600" },
  name: { color: "#fff", fontSize: 18, fontWeight: "600", marginTop: 12 },
  email: { color: "#94A3B8", fontSize: 13, marginBottom: 20 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 24, width: "100%" },
  statCard: { flex: 1, backgroundColor: "#1E293B", borderRadius: 12, padding: 16, alignItems: "center" },
  statNumber: { color: "#fff", fontSize: 22, fontWeight: "700" },
  statLabel: { color: "#94A3B8", fontSize: 12, marginTop: 4 },
  row: { width: "100%", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#1E293B" },
  rowText: { color: "#fff", fontSize: 15 },
  signOut: { marginTop: 32, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, borderWidth: 1, borderColor: "#F87171" },
  signOutText: { color: "#F87171", fontWeight: "600" },
});
