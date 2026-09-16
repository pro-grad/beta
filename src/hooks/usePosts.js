import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";
import { supabase } from "../../screens/supabase";

export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoadingFeed(true);
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error("Error fetching feed:", err.message);
    } finally {
      setIsLoadingFeed(false);
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

  const createPost = async (title, mediaAsset) => {
    if (!title || !mediaAsset) {
      Alert.alert("Missing Fields", "Please enter a title and select a photo or video.");
      return false;
    }

    try {
      setIsUploading(true);

      const { data: { user } } = await supabase.auth.getUser();
      const userName =
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        user?.email?.split("@")[0] ||
        "ProGrad User";

      const fileName = `${Date.now()}.${mediaAsset.ext}`;

      const base64 = await FileSystem.readAsStringAsync(mediaAsset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { error: storageError } = await supabase.storage
        .from("post-images")
        .upload(fileName, decode(base64), {
          contentType: mediaAsset.mimeType,
          upsert: true,
        });

      if (storageError) throw new Error(storageError.message);

      const { data: urlData } = supabase.storage.from("post-images").getPublicUrl(fileName);

      const { data: newPost, error: dbError } = await supabase
        .from("posts")
        .insert([{ title, image_url: urlData.publicUrl, user_name: userName }])
        .select()
        .single();

      if (dbError) throw new Error(dbError.message);

      setPosts((prev) => [newPost, ...prev]);
      Alert.alert("Success", "Post created and saved!");
      return true;
    } catch (err) {
      Alert.alert("Upload Error", err.message || "An error occurred during upload.");
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return { posts, isLoadingFeed, isUploading, pickMedia, createPost };
}