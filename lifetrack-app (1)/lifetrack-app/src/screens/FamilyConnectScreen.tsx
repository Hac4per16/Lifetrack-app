import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export default function FamilyConnectScreen({ navigation }: any) {
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function connect() {
    setStatus(null);
    // In production: look up the recipient via a secure server-side function
    // (RPC) rather than querying auth.users directly from the client.
    const { data: recipient, error: lookupError } = await supabase.rpc("find_profile_by_email", { p_email: email });

    if (lookupError || !recipient) {
      setStatus("No account found with that email.");
      return;
    }

    await supabase.from("connections").insert({
      requester_id: session!.user.id,
      recipient_id: recipient.id,
      status: "pending",
    });

    const { data: convo } = await supabase.from("conversations").insert({ is_group: false }).select().single();
    if (convo) {
      await supabase.from("conversation_participants").insert([
        { conversation_id: convo.id, profile_id: session!.user.id },
        { conversation_id: convo.id, profile_id: recipient.id },
      ]);
    }

    setStatus("Connection request sent.");
    setTimeout(() => navigation.goBack(), 1200);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect with your partner or family</Text>
      <Text style={styles.subtitle}>
        They'll be able to see the goals and progress you choose to share, message you, and cheer you on.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Their email"
        placeholderTextColor="#64748B"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      {status && <Text style={styles.status}>{status}</Text>}
      <Pressable style={styles.button} onPress={connect}>
        <Text style={styles.buttonText}>Send invite</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A", padding: 20 },
  title: { fontSize: 20, fontWeight: "700", color: "#fff", marginBottom: 8 },
  subtitle: { color: "#94A3B8", marginBottom: 20, lineHeight: 20 },
  input: { backgroundColor: "#1E293B", color: "#fff", borderRadius: 10, padding: 12, marginBottom: 12 },
  button: { backgroundColor: "#22C55E", borderRadius: 10, padding: 14, alignItems: "center" },
  buttonText: { color: "#0F172A", fontWeight: "600" },
  status: { color: "#38BDF8", marginBottom: 12 },
});
