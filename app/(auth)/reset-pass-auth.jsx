import { useState, React } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";

import { images } from "../../constants";
import { CustomButton, FormField } from "../../components";
import { getCurrentUser, signIn, resetPassword } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";

const resetPassAuth = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    code: "",
  });

  const submit = async () => {
    if (form.code === "") {
      Alert.alert("Error", "Please enter the code");
    }
    setSubmitting(true);
    try {
      await resetPassword(form);
      //   const result = await getCurrentUser();
      //   setUser(result);
      //   setIsLogged(true);

      Alert.alert("Success", "Set a new password");
      router.replace("/new-pass");
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
            Enter 4 Digit Code
          </Text>
          <Text className="text-lg font-pregular text-gray-100 mb-3">
            A 4 digit code was sent to your email. To reset your password please enter the code here.
          </Text>

          <FormField
            title="Number"
            value={form.code}
            handleChangeText={(e) => setForm({ ...form, code: e })}
            otherStyles="mt-7"
            // keyboardType="email-address"
          />

          <CustomButton
            title="Send Code"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />

          <View className="flex justify-center pt-5 flex-row gap-2">
            <Link
              href="/reset-pass"
              className="text-lg font-psemibold text-secondary"
            >
              Reset Password
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
              Signup
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default resetPassAuth;
