import { useState, React } from "react";
import { Link, router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";

import { images } from "../../constants";
import { CustomButton, FormField } from "../../components";
import { getCurrentUser, signIn, resetPassword, findUserEmail } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
const newPass = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const {email} = useLocalSearchParams();
  const [form, setForm] = useState({
    email: email,
    newPassword: "",
    confirmPassword: "",
  });

  const submit = async () => {
    if (form.newPassword === "" || form.confirmPassword === "") {
      Alert.alert("Error", "Please fill in all fields");
    }

    if (form.newPassword != form.confirmPassword) {
      Alert.alert("Error", "Passwords do not match please try again");
    }
    setSubmitting(true);

    try {
      await findUserEmail(form);
      Alert.alert("Success", "Password reset");
      router.replace("/sign-in");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View
          className="w-full flex justify-center h-full px-4 my-6"
          style={{
            minHeight: Dimensions.get("window").height - 100,
          }}
        >
          <Image
            source={images.tcwlogo}
            resizeMode="contain"
            className="w-[215px] h-[54px]"
          />

          <Text className="text-2xl font-semibold text-white mt-10 font-psemibold">
            Reset Password
          </Text>
          <Text className="text-lg font-pregular text-gray-100 mb-3">
            Choose a new password.
          </Text>

          <FormField
            title="Password"
            value={form.newPassword}
            handleChangeText={(e) => setForm({ ...form, newPassword: e })}
            otherStyles="mt-7"
          />

          <FormField
            title="Confirm Password"
            value={form.confirmPassword}
            handleChangeText={(e) => setForm({ ...form, confirmPassword: e })}
            otherStyles="mt-7"
          />

          <CustomButton
            title="Submit password"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />
          <View
            style={{ marginTop: 2 }}
            className="flex justify-center flex-row gap-2"
          >
            <Text className="text-lg text-gray-100 font-pregular">
              Don't have an account?
            </Text>
            <Link
              href="/sign-up"
              className="text-lg font-psemibold text-secondary"
            >
              Signup
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default newPass;
