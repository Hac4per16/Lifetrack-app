import React, { useEffect, useState, useRef } from "react";
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Message } from "@/types";

export default function ConversationScreen({ route }: any) {
  const { conversationId } = route.params;
  const { session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  async function load() {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    setMessages(data ?? []);
  }

  async function send() {
    if (!text.trim()) return;
    const content = text;
    setText("");
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: session!.user.id,
      content,
    });
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const mine = item.sender_id === session!.user.id;
          return (
            <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
              <Text style={styles.bubbleText}>{item.content}</Text>
            </View>
          );
        }}
      />
      <View style={styles.inputRow}>
        <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="Message" placeholderTextColor="#64748B" />
        <Pressable style={styles.sendButton} onPress={send}>
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  bubble: { maxWidth: "75%", borderRadius: 14, padding: 10, marginBottom: 8 },
  bubbleMine: { backgroundColor: "#22C55E", alignSelf: "flex-end" },
  bubbleTheirs: { backgroundColor: "#1E293B", alignSelf: "flex-start" },
  bubbleText: { color: "#fff" },
  inputRow: { flexDirection: "row", padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: "#1E293B" },
  input: { flex: 1, backgroundColor: "#1E293B", color: "#fff", borderRadius: 10, padding: 12 },
  sendButton: { backgroundColor: "#22C55E", borderRadius: 10, paddingHorizontal: 16, justifyContent: "center" },
  sendText: { color: "#0F172A", fontWeight: "600" },
});
