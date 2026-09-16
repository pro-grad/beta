import React, { useState } from "react";
import { Modal, SafeAreaView, ScrollView, View, Text, TextInput, Pressable, Image, ActivityIndicator, StyleSheet } from "react-native";

export default function CreateJobModal({ visible, onClose, onPickMedia, onSubmit, isUploading }) {
  const [title, setTitle] = useState("");
  const [jobType, setJobType] = useState("job");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [applicationLink, setApplicationLink] = useState("");
  const [mediaAsset, setMediaAsset] = useState(null);

  const handleSelectMedia = async () => {
    const asset = await onPickMedia();
    if (asset) setMediaAsset(asset);
  };

  const handleSubmit = async () => {
    const jobPayload = {
      title,
      job_type: jobType,
      description,
      requirements,
      application_link: applicationLink,
    };

    const success = await onSubmit(jobPayload, mediaAsset);
    if (success) {
      setTitle("");
      setJobType("job");
      setDescription("");
      setRequirements("");
      setApplicationLink("");
      setMediaAsset(null);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.modalOverlay}>
        <ScrollView style={styles.modalContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Job Listing</Text>
            <Pressable onPress={onClose} disabled={isUploading}>
              <Text style={styles.closeText}>Cancel</Text>
            </Pressable>
          </View>

          {/* Job Type Selector */}
          <Text style={styles.label}>Job Type</Text>
          <View style={styles.typeRow}>
            <Pressable
              style={[styles.typeBtn, jobType === "job" && styles.typeBtnActive]}
              onPress={() => setJobType("job")}
            >
              <Text style={[styles.typeBtnText, jobType === "job" && styles.typeBtnTextActive]}>Standard Job</Text>
            </Pressable>
            <Pressable
              style={[styles.typeBtn, jobType === "ejob" && styles.typeBtnActive]}
              onPress={() => setJobType("ejob")}
            >
              <Text style={[styles.typeBtnText, jobType === "ejob" && styles.typeBtnTextActive]}>⚡ E-Job</Text>
            </Pressable>
          </View>

          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Job Title..."
            placeholderTextColor="#666"
            value={title}
            onChangeText={setTitle}
            editable={!isUploading}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Job description..."
            placeholderTextColor="#666"
            value={description}
            onChangeText={setDescription}
            editable={!isUploading}
            multiline
          />

          <Text style={styles.label}>Requirements</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Key requirements..."
            placeholderTextColor="#666"
            value={requirements}
            onChangeText={setRequirements}
            editable={!isUploading}
            multiline
          />

          <Text style={styles.label}>Application Link</Text>
          <TextInput
            style={styles.input}
            placeholder="https://..."
            placeholderTextColor="#666"
            value={applicationLink}
            onChangeText={setApplicationLink}
            editable={!isUploading}
            autoCapitalize="none"
          />

          <Pressable style={styles.imagePickerButton} onPress={handleSelectMedia} disabled={isUploading}>
            <Text style={styles.imagePickerText}>
              {mediaAsset ? `Change ${mediaAsset.type === "video" ? "Video" : "Image"}` : "Select Optional Photo / Video"}
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
            {isUploading ? <ActivityIndicator color="#000" /> : <Text style={styles.submitButtonText}>Publish Listing</Text>}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: "#000" },
  modalContainer: { flex: 1, padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { color: "#fff", fontSize: 22, fontWeight: "600" },
  closeText: { color: "#999", fontSize: 16 },
  label: { color: "#aaa", fontSize: 13, marginBottom: 6 },
  typeRow: { flexDirection: "row", marginBottom: 15, gap: 10 },
  typeBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: "#111", borderWidth: 1, borderColor: "#292929", alignItems: "center" },
  typeBtnActive: { backgroundColor: "#fff" },
  typeBtnText: { color: "#aaa", fontSize: 14, fontWeight: "600" },
  typeBtnTextActive: { color: "#000" },
  input: { backgroundColor: "#111", borderColor: "#292929", borderWidth: 1, borderRadius: 12, padding: 14, color: "#fff", fontSize: 15, marginBottom: 15 },
  multilineInput: { height: 80, textAlignVertical: "top" },
  imagePickerButton: { backgroundColor: "#222", padding: 15, borderRadius: 12, alignItems: "center", marginBottom: 15 },
  imagePickerText: { color: "#fff", fontSize: 15 },
  previewContainer: { marginBottom: 20 },
  previewImage: { width: "100%", height: 200, borderRadius: 12 },
  videoPreviewText: { color: "#aaa", textAlign: "center", padding: 20, backgroundColor: "#111", borderRadius: 12 },
  submitButton: { backgroundColor: "#fff", padding: 16, borderRadius: 12, alignItems: "center", marginBottom: 40 },
  disabledButton: { opacity: 0.6 },
  submitButtonText: { color: "#000", fontSize: 16, fontWeight: "600" },
});