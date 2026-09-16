import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert
} from "react-native";
import { supabase } from "./supabase";

export default function AuthenticationScreen({ navigation }) {
  const [authMode, setAuthMode] = useState("login");
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isValidStudentEmail = (emailStr) => {
    if (!emailStr.includes("@")) return false;
    const domain = emailStr.trim().toLowerCase().split("@")[1];
    return (
      domain === "my.richfield.ac.za" ||
      domain === "richfield.ac.za" ||
      domain === "my.aaa.ac.za" ||
      domain === "aaa.ac.za"
    );
  };

  const handleAuth = async () => {
    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both an email and a password.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    if (authMode === "signup") {
      if (!fullName.trim()) {
        setErrorMessage("Please enter your full name.");
        setLoading(false);
        return;
      }

      if (role === "student" && !isValidStudentEmail(email)) {
        setErrorMessage(
          "Students must register using an official email (@my.richfield.ac.za)."
        );
        setLoading(false);
        return;
      }

      if (role === "alumni") {
        const cleanedId = idNumber.trim();
        if (cleanedId.length !== 13 || !/^\d+$/.test(cleanedId)) {
          setErrorMessage("Alumni registration requires a valid 13-digit National ID number.");
          setLoading(false);
          return;
        }
      }

      // 1. Create user in auth.users with metadata
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName,
            user_role: role,
            id_number: role === "alumni" ? idNumber.trim() : null,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      // 2. Kill the auto-generated session so unapproved users can't enter
      await supabase.auth.signOut();

      // 3. Reset form states and notify user
      setPassword("");
      Alert.alert(
        "Application Submitted",
        "Your registration has been submitted for admin approval. You can log in once your account is activated."
      );

      setAuthMode("login");
    } else {
      // Login Flow
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setErrorMessage(error.message);
      } else if (data?.user) {
        // Block unapproved users from entering the dashboard
        if (!data.user.email_confirmed_at) {
          await supabase.auth.signOut();
          setErrorMessage("Your account is pending admin approval. Please check back later.");
        } else {
          navigation.navigate("Main");
        }
      }
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.authScreen}
        keyboardShouldPersistTaps="handled"
      >
        {/* Role Selector Above Login/Sign Up Tabs */}
        <Text style={styles.inputLabel}>Select Account Role</Text>
        <View style={styles.roleContainer}>
          {["student", "alumni", "business"].map((item) => (
            <Pressable
              key={item}
              style={[styles.roleButton, role === item && styles.roleButtonActive]}
              onPress={() => {
                setRole(item);
                setErrorMessage("");
              }}
            >
              <Text style={[styles.roleText, role === item && styles.roleTextActive]}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Login / Sign Up Mode Switcher */}
        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, authMode === "login" && styles.activeTab]}
            onPress={() => {
              setAuthMode("login");
              setErrorMessage("");
            }}
          >
            <Text style={[styles.tabText, authMode === "login" && styles.activeTabText]}>
              Login
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tab, authMode === "signup" && styles.activeTab]}
            onPress={() => {
              setAuthMode("signup");
              setErrorMessage("");
            }}
          >
            <Text style={[styles.tabText, authMode === "signup" && styles.activeTabText]}>
              Sign Up
            </Text>
          </Pressable>
        </View>

        {/* Native Error Banner */}
        {!!errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        )}

        {authMode === "signup" && (
          <>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Your Full Name"
              placeholderTextColor="#777"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                setErrorMessage("");
              }}
            />

            {role === "alumni" && (
              <>
                <Text style={styles.inputLabel}>13-Digit National ID Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter 13-Digit ID Code"
                  placeholderTextColor="#777"
                  value={idNumber}
                  onChangeText={(text) => {
                    setIdNumber(text);
                    setErrorMessage("");
                  }}
                  keyboardType="numeric"
                  maxLength={13}
                />
              </>
            )}
          </>
        )}

        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder={
            authMode === "signup"
              ? role === "student"
                ? "username@my.richfield.ac.za"
                : "Enter Your Personal Email"
              : "Enter Your Email"
          }
          placeholderTextColor="#777"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrorMessage("");
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Your Password"
          placeholderTextColor="#777"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrorMessage("");
          }}
          secureTextEntry={true}
        />

        {authMode === "login" && (
          <Pressable>
            <Text style={styles.forgotPassword}>Forgot Password</Text>
          </Pressable>
        )}

        <Pressable
          style={styles.primaryButton}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {authMode === "login" ? "Login" : "Create Account"}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  authScreen: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    justifyContent: "center",
    paddingBottom: 50,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    marginBottom: 20,
    marginTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 15,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#fff",
  },
  tabText: {
    color: "#777",
    fontSize: 17,
  },
  activeTabText: {
    color: "#fff",
  },
  errorContainer: {
    backgroundColor: "rgba(255, 69, 58, 0.15)",
    borderColor: "#FF453A",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  errorBannerText: {
    color: "#FF453A",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  inputLabel: {
    color: "#fff",
    fontSize: 15,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#292929",
    backgroundColor: "#111",
    color: "#fff",
    paddingHorizontal: 18,
    fontSize: 15,
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
    backgroundColor: "#111",
  },
  roleButtonActive: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },
  roleText: {
    color: "#aaa",
    fontSize: 13,
  },
  roleTextActive: {
    color: "#000",
    fontWeight: "bold",
  },
  forgotPassword: {
    color: "#bbb",
    textAlign: "right",
    marginTop: 15,
  },
  primaryButton: {
    height: 60,
    backgroundColor: "#fff",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },
  primaryButtonText: {
    color: "#000",
    fontSize: 17,
    fontWeight: "600",
  },
});