import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  ScrollView,
} from "react-native";
import LottieView from "lottie-react-native";
import { API_BASE } from "../config"; // We will create this file next

export default function ChatScreen() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (message.trim() === "" || loading) return;

    const userMessage = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: message,
          context: [],
          agent_type: "document",
        }),
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: Could not reach the backend." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.autogeneral}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          <LottieView
            source={require("../assets/ai-blob.json")}
            autoPlay
            resizeMode="contain"
            loop
            style={styles.animation}
          />

          {messages.map((msg, i) => (
            <View
              key={i}
              style={
                msg.role === "user" ? styles.userBubble : styles.assistantBubble
              }
            >
              <Text style={styles.bubbleText}>{msg.content}</Text>
            </View>
          ))}
          {loading && <Text style={styles.loadingText}>Thinking...</Text>}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.promptbox}
            placeholder="Ask anything..."
            placeholderTextColor="#777"
            value={message}
            onChangeText={setMessage}
            multiline
            textAlignVertical="center"
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              message.trim().length === 0 && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={message.trim().length === 0 || loading}
            activeOpacity={0.7}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  autogeneral: { flex: 1, backgroundColor: "black" },
  keyboardView: { flex: 1 },
  chatArea: { flex: 1 },
  chatContent: { alignItems: "center", paddingTop: 20, paddingBottom: 30 },
  animation: { width: 100, height: 100 },
  inputContainer: {
    width: "92%",
    minHeight: 65,
    maxHeight: 140,
    alignSelf: "center",
    marginBottom: 15,
    backgroundColor: "#0e0e0e",
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 10,
    borderWidth: 1,
    borderColor: "#1f1f1f",
  },
  promptbox: {
    flex: 1,
    color: "white",
    fontSize: 16,
    paddingTop: 15,
    paddingBottom: 15,
    paddingRight: 10,
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: { opacity: 0.3 },
  sendIcon: { color: "black", fontSize: 25, fontWeight: "bold", marginTop: -3 },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#1e3a8a",
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
    maxWidth: "80%",
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#1a1a1a",
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
    maxWidth: "80%",
  },
  bubbleText: { color: "white", fontSize: 15 },
  loadingText: {
    color: "#777",
    fontStyle: "italic",
    marginVertical: 8,
  },
});