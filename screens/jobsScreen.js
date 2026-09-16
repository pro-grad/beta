// JobsScreen.js
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  Linking,
  StatusBar,
  Platform,
  TextInput,
} from "react-native";

// Sub-components & hooks from src/
import { useJobs } from "../src/hooks/useJobs";
import FeedVideoItem from "../src/components/FeedVideoItem";
import CreateJobModal from "../src/components/CreateJobModal";
import { supabase } from "./supabase"; // Adjust path if needed

export default function JobsScreen() {
  const { jobs, isLoadingJobs, isUploading, pickMedia, createJob } = useJobs();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchUserRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const roleFromMetadata = user.user_metadata?.user_role;

        if (roleFromMetadata) {
          setUserRole(roleFromMetadata.toLowerCase());
        } else {
          const fallbackRole = user.user_metadata?.role || user.user_metadata?.account_type;
          if (fallbackRole) {
            setUserRole(fallbackRole.toLowerCase());
          }
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
      }
    }

    fetchUserRole();
  }, []);

  // Filter jobs dynamically based on title matching search input
  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;
    return jobs.filter((job) =>
      job.title?.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
  }, [jobs, searchQuery]);

  const isBusiness = userRole === "business";

  const isVideoUrl = (url) => {
    if (!url) return false;
    const cleanUrl = url.split("?")[0].toLowerCase();
    return [".mp4", ".mov", ".m4v", ".webm"].some((ext) => cleanUrl.endsWith(ext));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.dashboard}>
        {/* Header - Identical brand banner with safe padding */}
        <View style={styles.dashboardHeader}>
          <View style={styles.brandContainer}>
            <Image
              source={require("../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.separator}>|</Text>
            <Text style={styles.brandTitle}>PROGRAD</Text>
          </View>

          {isBusiness && (
            <Pressable style={styles.addButton} onPress={() => setIsModalVisible(true)}>
              <View style={styles.addButtonInner}>
                <Text style={styles.addIcon}>+</Text>
              </View>
            </Pressable>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.dashboardContent}>
          <Text style={styles.greeting}>Experiences & Jobs</Text>

          {/* Jobs Feed Section */}
          <View style={styles.feedSection}>
            <Text style={styles.feedHeading}>Listings</Text>

            {/* Dark Mode Search Bar */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search jobs by title..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")} style={styles.clearBtn}>
                  <Text style={styles.clearBtnText}>✕</Text>
                </Pressable>
              )}
            </View>

            {isLoadingJobs ? (
              <ActivityIndicator size="small" color="#fff" style={{ marginTop: 20 }} />
            ) : filteredJobs.length === 0 ? (
              <Text style={styles.emptyFeedText}>
                {searchQuery ? `No jobs found matching "${searchQuery}"` : "No job listings yet."}
              </Text>
            ) : (
              filteredJobs.map((job) => {
                const isVideo = isVideoUrl(job.media_url);
                const isEJob = job.job_type === "ejob";

                return (
                  <View key={job.id} style={styles.postCard}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.postTitle}>
                        {job.title}
                      </Text>
                      <View style={[styles.badge, isEJob && styles.ejobBadge]}>
                        <Text style={[styles.badgeText, isEJob && styles.ejobBadgeText]}>
                          {isEJob ? "E-Job" : "Job"}
                        </Text>
                      </View>
                    </View>

                    {job.media_url && (
                      isVideo ? <FeedVideoItem uri={job.media_url} /> : <Image source={{ uri: job.media_url }} style={styles.postMedia} resizeMode="cover" />
                    )}

                    {job.description ? (
                      <View style={styles.fieldSection}>
                        <Text style={styles.fieldLabel}>Description:</Text>
                        <Text style={styles.fieldValue}>{job.description}</Text>
                      </View>
                    ) : null}

                    {job.requirements ? (
                      <View style={styles.fieldSection}>
                        <Text style={styles.fieldLabel}>Requirements:</Text>
                        <Text style={styles.fieldValue}>{job.requirements}</Text>
                      </View>
                    ) : null}

                    {job.application_link ? (
                      <Pressable
                        style={[styles.applyBtn, isEJob && styles.ejobApplyBtn]}
                        onPress={() => Linking.openURL(job.application_link)}
                      >
                        <Text style={[styles.applyBtnText, isEJob && styles.ejobApplyBtnText]}>
                          {isEJob ? "Start" : "Apply Now"}
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>

      {isBusiness && (
        <CreateJobModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onPickMedia={pickMedia}
          onSubmit={createJob}
          isUploading={isUploading}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  dashboard: { flex: 1, backgroundColor: "#000" },
  dashboardHeader: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 12 : 20,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 60,
    height: 60,
  },
  separator: {
    color: "#333",
    fontSize: 20,
    fontWeight: "300",
    marginHorizontal: 10,
  },
  brandTitle: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  addButton: {
    backgroundColor: "#fff",
    width: 38,
    height: 38,
    borderRadius: 19,
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonInner: {
    backgroundColor: "#222",
    width: "100%",
    height: "100%",
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  addIcon: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "300",
    lineHeight: 24,
  },
  dashboardContent: { paddingHorizontal: 20, paddingBottom: 20 },
  greeting: { color: "#fff", fontSize: 32, fontWeight: "600", marginTop: 10, marginBottom: 15 },
  feedSection: { marginTop: 15 },
  feedHeading: { color: "#fff", fontSize: 20, fontWeight: "600", marginBottom: 15 },
  
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#080808",
    borderWidth: 1,
    borderColor: "#292929",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
  },
  clearBtn: {
    padding: 4,
  },
  clearBtnText: {
    color: "#777",
    fontSize: 14,
  },

  emptyFeedText: { color: "#666", textAlign: "center", marginTop: 20 },
  postCard: { backgroundColor: "#080808", borderWidth: 1, borderColor: "#292929", borderRadius: 15, padding: 15, marginBottom: 15 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  postTitle: { color: "#fff", fontSize: 18, fontWeight: "600", flex: 1 },
  badge: { backgroundColor: "#fff", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginLeft: 10 },
  ejobBadge: { backgroundColor: "#007AFF" },
  badgeText: { color: "#000", fontSize: 11, fontWeight: "700" },
  ejobBadgeText: { color: "#fff" },
  postMedia: { width: "100%", height: 200, borderRadius: 10, marginVertical: 10 },
  fieldSection: { marginTop: 8 },
  fieldLabel: { color: "#777", fontSize: 12, fontWeight: "600" },
  fieldValue: { color: "#ccc", fontSize: 14, marginTop: 2 },
  applyBtn: { backgroundColor: "#fff", paddingVertical: 10, borderRadius: 8, alignItems: "center", marginTop: 12 },
  ejobApplyBtn: { backgroundColor: "#007AFF" },
  applyBtnText: { color: "#000", fontWeight: "600", fontSize: 14 },
  ejobApplyBtnText: { color: "#fff" },
});