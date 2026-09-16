import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
} from "react-native";

export default function SocialFeed() {
  const posts = [
    {
      id: 1,
      username: "Alex",
      time: "2h ago",
      text: "Just finished my Data Structures assignment! 🎓",
    },
    {
      id: 2,
      username: "Lebogang",
      time: "4h ago",
      text: "Good luck everyone with the upcoming exams!",
    },
    {
      id: 3,
      username: "Thando",
      time: "6h ago",
      text: "Finally completed today's study quest! 🔥",
    },
  ];

  // Store comments for each post
  const [comments, setComments] = useState({});

  // Store what the user is currently typing
  const [commentText, setCommentText] = useState({});

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Social Feed</Text>

        <Pressable>
          <Text style={styles.viewAll}>View all</Text>
        </Pressable>
      </View>

      {/* SINGLE SOCIAL FEED CARD */}
      <View style={styles.postCard}>

        {posts.map((post, index) => (
          <View
            key={post.id}
            style={[
              styles.post,
              index !== posts.length - 1 && styles.postDivider,
            ]}
          >

            {/* POST HEADER */}
            <View style={styles.postHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {post.username.charAt(0)}
                </Text>
              </View>

              <View>
                <Text style={styles.username}>
                  {post.username}
                </Text>

                <Text style={styles.time}>
                  {post.time}
                </Text>
              </View>
            </View>

            {/* POST TEXT */}
            <Text style={styles.postText}>
              {post.text}
            </Text>

            {/* POST ACTIONS */}
            <View style={styles.actions}>

              <Pressable style={styles.actionButton}>
                <Text style={styles.actionText}>
                  ♡ Like
                </Text>
              </Pressable>

              <Pressable style={styles.actionButton}>
                <Text style={styles.actionText}>
                  💬 Comment
                </Text>
              </Pressable>

              <Pressable style={styles.actionButton}>
                <Text style={styles.actionText}>
                  ↗️ Share
                </Text>
              </Pressable>

            </View>

            {/* COMMENTS */}
            <View style={styles.commentSection}>

              {/* DISPLAY COMMENTS */}
              {comments[post.id]?.map((comment, commentIndex) => (
                <View
                  key={commentIndex}
                  style={styles.comment}
                >
                  <Text style={styles.commentUsername}>
                    You
                  </Text>

                  <Text style={styles.commentText}>
                    {comment}
                  </Text>
                </View>
              ))}

              {/* COMMENT INPUT */}
              <View style={styles.commentInputRow}>

                <TextInput
                  style={styles.commentInput}
                  placeholder="Write a comment..."
                  placeholderTextColor="#666"
                  value={commentText[post.id] || ""}
                  onChangeText={(text) =>
                    setCommentText({
                      ...commentText,
                      [post.id]: text,
                    })
                  }
                />

                <Pressable
                  style={styles.commentButton}
                  onPress={() => {
                    const text = commentText[post.id]?.trim();

                    if (!text) return;

                    setComments({
                      ...comments,
                      [post.id]: [
                        ...(comments[post.id] || []),
                        text,
                      ],
                    });

                    setCommentText({
                      ...commentText,
                      [post.id]: "",
                    });
                  }}
                >
                  <Text style={styles.commentButtonText}>
                    Post
                  </Text>
                </Pressable>

              </View>

            </View>

          </View>
        ))}

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    width: "100%",
    marginBottom: 15,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },

  viewAll: {
    color: "#777",
    fontSize: 13,
  },

  /* SINGLE SOCIAL FEED CARD */
  postCard: {
    backgroundColor: "#111",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#222",
    padding: 17,
  },

  /* INDIVIDUAL POST */
  post: {
    paddingBottom: 18,
    marginBottom: 18,
  },

  /* DIVIDER BETWEEN POSTS */
  postDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },

  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  avatarText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },

  username: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  time: {
    color: "#666",
    fontSize: 12,
    marginTop: 3,
  },

  postText: {
    color: "#ddd",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 15,
  },

  actions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#222",
    paddingTop: 12,
  },

  actionButton: {
    marginRight: 25,
  },

  actionText: {
    color: "#888",
    fontSize: 13,
  },

  /* COMMENTS */
  commentSection: {
    marginTop: 15,
  },

  comment: {
    backgroundColor: "#181818",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },

  commentUsername: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 3,
  },

  commentText: {
    color: "#bbb",
    fontSize: 13,
  },

  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  commentInput: {
    flex: 1,
    backgroundColor: "#181818",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#292929",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
  },

  commentButton: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginLeft: 8,
  },

  commentButtonText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "600",
  },

});