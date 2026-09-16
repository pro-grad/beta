import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Image,
} from "react-native";

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.welcomeScreen}>

        <View style={styles.centerContent}>
          <Image
            style={styles.logo}
            source={require("../assets/logo.png")}
          />

	  <Text style={styles.catchpharse}>- Experience in your hands</Text>
        </View>

        <Pressable
          style={styles.proceedButton}
          onPress={() => navigation.navigate("Auth")}
        >
          <Text style={styles.proceedText}>
            Continue
          </Text>

          <Text style={styles.arrow}>
            →
          </Text>
        </Pressable>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  catchpharse:{
	  color:"white",
	  marginTop: -130,
	  fontSize: 15,

  },
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  welcomeScreen: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 40,
    paddingBottom: 35,
    justifyContent: "space-between",
  },

  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: 400,
    height: 400,
    resizeMode: "contain",
    marginBottom: 25,
  },

 proceedButton: {
  height: 70,
  width: "100%",
  backgroundColor: "#fff",
  borderRadius: 15,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
},
  proceedText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "600",
  },

  arrow: {
    color: "#000",
    fontSize: 28,
    marginLeft: 70,
  },
});
