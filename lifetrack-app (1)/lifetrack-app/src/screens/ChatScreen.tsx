import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, FlatList } from "react-native";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Conversation } from "@/types";

export default function ChatScreen({ navigation }: any) {
  const { session } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    // Conversations the current user participates in, with the other
    // participant's display name resolved for 1-to-1 chats.
    const { data: participantRows } = await supabase
      .from("conversation_participants")
      .select("conversation_id, conversations(id, is_group)")
      .eq("profile_id", session!.user.id);

    if (!participantRows) return setConversations([]);

    const result: Conversation[] = [];
    for (const row of participantRows) {
      const convo = (row as any).conversations;
      if (!convo) continue;

      let otherName = "Group";
      if (!convo.is_group) {
        const { data: others } = await supabase
          .from("conversation_participants")
          .select("profiles(full_name)")
          .eq("conversation_id", convo.id)
          .neq("profile_id", session!.user.id)
          .maybeSingle();
        otherName = (others as any)?.profiles?.full_name ?? "Unknown";
      }
      result.push({ id: convo.id, is_group: convo.is_group, otherParticipantName: otherName });
    }
    setConversations(result);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chat</Text>
        <Pressable onPress={() => navigation.navigate("FamilyConnect")}>
          <Text style={styles.addLink}>+ Connect someone</Text>
        </Pressable>
      </View>

      <FlatList
        contentContainerStyle={{ padding: 20 }}
        data={conversations}
        keyExtractor={(c) => c.id}
        ListEmptyComponent={<Text style={styles.empty}>No conversations yet. Connect with your partner or family first.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => navigation.navigate("Conversation", { conversationId: item.id, title: item.otherParticipantName })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(item.otherParticipantName ?? "?")[0]}</Text>
            </View>
            <Text style={styles.rowText}>{item.otherParticipantName}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingBottom: 0 },
  title: { fontSize: 24, fontWeight: "700", color: "#fff" },
  addLink: { color: "#38BDF8", fontSize: 13 },
  empty: { color: "#64748B", textAlign: "center", marginTop: 40 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#1E293B" },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#334155", alignItems: "center", justifyContent: "center", marginRight: 12 },
  avatarText: { color: "#fff", fontWeight: "600" },
  rowText: { color: "#fff", fontSize: 15 },
});
