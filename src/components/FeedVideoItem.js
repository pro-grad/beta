import React from "react";
import { StyleSheet } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";

export default function FeedVideoItem({ uri }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.play();
  });

  return (
    <VideoView
      style={styles.postMedia}
      player={player}
      allowsFullscreen
      allowsPictureInPicture
      contentFit="cover"
    />
  );
}

const styles = StyleSheet.create({
  postMedia: { width: "100%", height: 250, borderRadius: 10, marginBottom: 12 },
});