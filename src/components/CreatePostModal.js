import React, { useState } from "react";
import { Modal, SafeAreaView, View, Text, TextInput, Pressable, Image, ActivityIndicator, StyleSheet } from "react-native";

export default function CreatePostModal({ visible, onClose, onPickMedia, onSubmit, isUploading }) {
  const [title, setTitle] = useState("");
  const [mediaAsset, setMediaAsset] = useState(null);

  const handleSelectMedia = async () => {
    const asset = await onPickMedia();
    if (asset) setMediaAsset(asset);
  };

  const handleSubmit = async () => {
    const success = await onSubmit(title, mediaAsset);
    if (success) {
      setTitle("");
      setMediaAsset(null);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Post</Text>
            <Pressable onPress={onClose} disabled={isUploading}>
              <Text style={styles.closeText}>Cancel</Text>
            </Pressable>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Post Title..."
            placeholderTextColor="#666"
            value={title}
            onChangeText={setTitle}
            editable={!isUploading}
          />

          <Pressable style={styles.imagePickerButton} onPress={handleSelectMedia} disabled={isUploading}>
            <Text style={styles.imagePickerText}>
              {mediaAsset ? `Change ${mediaAsset.type === "video" ? "Video" : "Image"}` : "Select Photo / Video"}
            </Text>
          </Pressable>

          {mediaAsset && (
            <View style={styles.previewContainer}>
              {mediaAsset.type === "video" ? (
                <Text style={styles.videoPreviewText}>🎬 Video Selected</Text>
              ) : (
                <Image source={{ uri: mediaAsset.uri }} style={styles.previewImage} />
              )}
            </View>
          )}

          <Pressable style={[styles.submitButton, isUploading && styles.disabledButton]} onPress={handleSubmit} disabled={isUploading}>
            {isUploading ? <ActivityIndicator color="#000" /> : <Text style={styles.submitButtonText}>Publish</Text>}
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: "#000" },
  modalContainer: { flex: 1, padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25 },
  modalTitle: { color: "#fff", fontSize: 22, fontWeight: "600" },
  closeText: { color: "#999", fontSize: 16 },
  input: { backgroundColor: "#111", borderColor: "#292929", borderWidth: 1, borderRadius: 12, padding: 15, color: "#fff", fontSize: 16, marginBottom: 15 },
  imagePickerButton: { backgroundColor: "#222", padding: 15, borderRadius: 12, alignItems: "center", marginBottom: 15 },
  imagePickerText: { color: "#fff", fontSize: 15 },
  previewContainer: { marginBottom: 20 },
  previewImage: { width: "100%", height: 200, borderRadius: 12 },
  videoPreviewText: { color: "#aaa", textAlign: "center", padding: 20, backgroundColor: "#111", borderRadius: 12 },
  submitButton: { backgroundColor: "#fff", padding: 16, borderRadius: 12, alignItems: "center" },
  disabledButton: { opacity: 0.6 },
  submitButtonText: { color: "#000", fontSize: 16, fontWeight: "600" },
});