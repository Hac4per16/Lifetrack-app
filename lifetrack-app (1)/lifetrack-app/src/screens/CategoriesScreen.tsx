import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";

const CATEGORIES = [
  { id: "health", label: "Health", desc: "Workouts, sleep, nutrition", route: "Health" },
  { id: "finance", label: "Finance", desc: "Savings, expenses, credit score", route: "Finance" },
  { id: "goals", label: "Goals", desc: "Car, house, travel, savings targets", route: "Goals" },
  { id: "career", label: "Career / Business", desc: "Coming soon" },
  { id: "family", label: "Family", desc: "Coming soon" },
  { id: "dreams", label: "Dreams", desc: "Coming soon" },
] as const;

export default function CategoriesScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>Categories</Text>
      {CATEGORIES.map((c) => (
        <Pressable
          key={c.id}
          style={styles.card}
          onPress={() => "route" in c && c.route && navigation.navigate(c.route)}
        >
          <Text style={styles.cardTitle}>{c.label}</Text>
          <Text style={styles.cardDesc}>{c.desc}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  title: { fontSize: 24, fontWeight: "700", color: "#fff", marginBottom: 16 },
  card: { backgroundColor: "#1E293B", borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTitle: { color: "#fff", fontWeight: "600", fontSize: 16 },
  cardDesc: { color: "#94A3B8", marginTop: 4, fontSize: 13 },
});
