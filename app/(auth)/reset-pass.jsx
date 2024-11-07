import { useState, React } from "react";
import { Link, router, useLocalSearchParams  } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";

import { images } from "../../constants";
import { CustomButton, FormField } from "../../components";
import { getCurrentUser, signIn, resetPassword, findUserEmail } from "../../lib/appwrite";
import { sendEmail } from "../../lib/sendEmail"
// import { useGlobalContext } from "../../context/GlobalProvider";

const resetPass = () => {
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
  });

  const submit = async () => {
    if (form.email === "") {
      Alert.alert("Error", "Please fill in all fields");
    }
    setSubmitting(true);
    try {
      const result = await sendEmail(form.email);
      Alert.alert("Email Sent", "A 6 digit code was sent to your email. Please confirm the code to reset your password!");
      router.push({ pathname: "/reset-pass-auth", params: {email: result.email, code: result.code}});
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
            We'll send you a one time code to your email to reset your password.
          </Text>

          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
          />

          {/* <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
          /> */}

          <CustomButton
            title="Send Code"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />

          <View className="flex justify-center pt-5 flex-row gap-2">
            <Link
              href="/sign-in"
              className="text-lg font-psemibold text-secondary"
            >
              Sign In
            </Link>
          </View>
          <View
            style={{ marginTop: 2 }}
            className="flex justify-center flex-row gap-2"
          >
            <Link
              href="/sign-up"
              className="text-lg font-psemibold text-secondary"
            >
              Sign up
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default resetPass;
