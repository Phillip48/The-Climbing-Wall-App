import { useState, React } from "react";
import { Link, router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";

import { images } from "../../constants";
import { CustomButton, FormField } from "../../components";
import { getCurrentUser, signIn, resetPassword } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import { sendEmail } from "../../lib/sendEmail";

const resetPassAuth = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  // const { emailCode, setEmailCode } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const { email, code } = useLocalSearchParams();
  const [form, setForm] = useState({
    code: "",
  });

  const submit = async () => {
    if (form.code === "") {
      Alert.alert("Error", "Please enter the code");
    }
    // console.log(form.code, email, code, "obj", { email, code });
    if (form.code != code) {
      Alert.alert("Error", "The code doesn't match");
      return;
    }
    setSubmitting(true);
    try {
      // Alert.alert("Success", "Set a new password");
      let paramsForPassword = { email };
      router.push({ pathname: "/new-pass", params: paramsForPassword });
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
            Enter 6 Digit Code
          </Text>
          <Text className="text-lg font-pregular text-gray-100 mb-3">
            A 6 digit code was sent to your email. To reset your password please
            enter the code here. Make sure to check your spam and trash folder.
          </Text>

          <FormField
            title="Number"
            value={form.code}
            handleChangeText={(e) => setForm({ ...form, code: e })}
            otherStyles="mt-7"
            // keyboardType="email-address"
          />

          <CustomButton
            title="Enter Code"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />
          <View
            style={{ marginTop: 2 }}
            className="flex justify-center flex-row gap-2"
          >
            <Text className="text-lg text-gray-100 font-pregular">
              Didn't receieve an email?
            </Text>
            <Link
              href="/sign-up"
              className="text-lg font-psemibold text-secondary"
            >
              Resend code
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default resetPassAuth;
