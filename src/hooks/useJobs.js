import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../screens/supabase";

export function useJobs() {
  const [jobs, setJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setIsLoadingJobs(true);
      const { data, error } = await supabase
        .from("jobs")
        .select("*");

      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error("Error fetching jobs:", err.message);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const pickMedia = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Allow access to your photo gallery to select media.");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      const isVideo = asset.type === "video";
      let ext = asset.uri ? asset.uri.split(".").pop() : isVideo ? "mp4" : "jpg";
      ext = (ext || "jpg").toLowerCase();

      return {
        uri: asset.uri,
        type: isVideo ? "video" : "image",
        ext,
        mimeType: isVideo
          ? `video/${ext === "mov" ? "quicktime" : "mp4"}`
          : `image/${ext === "png" ? "png" : "jpeg"}`,
      };
    }
    return null;
  };

  const createJob = async (jobPayload, mediaAsset) => {
    const { title, job_type, description, requirements, application_link } = jobPayload;

    if (!title) {
      Alert.alert("Missing Fields", "Please enter a job title.");
      return false;
    }

    try {
      setIsUploading(true);
      let mediaUrl = null;

      if (mediaAsset) {
        const fileName = `${Date.now()}.${mediaAsset.ext}`;
        const response = await fetch(mediaAsset.uri);
        const fileBlob = await response.blob();

        const { error: storageError } = await supabase.storage
          .from("post-images")
          .upload(fileName, fileBlob, { contentType: mediaAsset.mimeType, upsert: true });

        if (storageError) throw new Error(storageError.message);

        const { data: urlData } = supabase.storage.from("post-images").getPublicUrl(fileName);
        mediaUrl = urlData.publicUrl;
      }

      const { data: newJob, error: dbError } = await supabase
        .from("jobs")
        .insert([
          {
            title,
            job_type: job_type || "job",
            description,
            requirements,
            application_link,
            media_url: mediaUrl,
          },
        ])
        .select()
        .single();

      if (dbError) throw new Error(dbError.message);

      setJobs((prev) => [newJob, ...prev]);
      Alert.alert("Success", "Job listing posted!");
      return true;
    } catch (err) {
      Alert.alert("Upload Error", err.message || "An error occurred during upload.");
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return { jobs, isLoadingJobs, isUploading, pickMedia, createJob };
}