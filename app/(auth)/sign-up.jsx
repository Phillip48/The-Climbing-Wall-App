import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";

import { images } from "../../constants";
import { createUser } from "../../lib/appwrite";
import { CustomButton, FormField } from "../../components";
import { useGlobalContext } from "../../context/GlobalProvider";
import { Picker } from "@react-native-picker/picker";

const SignUp = () => {
  const { setUser, setIsLogged } = useGlobalContext();

  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    maxBoulderingGrade: "",
    maxTopRopingGrade: "",
    bio: "",
  });

  const submit = async () => {
    if (form.username === "" || form.email === "" || form.password === "") {
      Alert.alert("Error", "Please fill in all fields");
    }

    setSubmitting(true);
    try {
      const result = await createUser(
        form.email,
        form.password,
        form.username,
        form.bio,
        form.maxBoulderingGrade,
        form.maxTopRopingGrade
      );
      setUser(result);
      setIsLogged(true);

      router.replace("/home");
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
            className="w-[315px] h-[74px]"
          />

          <Text className="text-2xl font-semibold text-white mt-10 font-psemibold">
            Sign Up to The Climbing Wall
          </Text>

          <FormField
            title="Username"
            value={form.username}
            handleChangeText={(e) => setForm({ ...form, username: e })}
            otherStyles="mt-10"
          />

          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
          />

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
          />

          <FormField
            title="Max Bouldering Grade"
            value={form.maxBoulderingGrade}
            handleChangeText={(e) =>
              setForm({ ...form, maxBoulderingGrade: e })
            }
            otherStyles="mt-7"
          />
          <p>Max Bouldering Grade</p>
          <Picker
            value={form.maxBoulderingGrade}
            onValueChange={(currentCurrency) => setCurrency(currentCurrency)}>
            <Picker.Item label="V0" value="V0" />
            <Picker.Item label="V1" value="V1" />
            <Picker.Item label="V2" value="V2" />
            <Picker.Item label="V3" value="V3" />
            <Picker.Item label="V4" value="V4" />
            <Picker.Item label="V5" value="V5" />
            <Picker.Item label="V6" value="V6" />
            <Picker.Item label="V7" value="V7" />
            <Picker.Item label="V8" value="V8" />
            <Picker.Item label="V9" value="V9" />
            <Picker.Item label="V10" value="V10" />
            <Picker.Item label="V11" value="V11" />
            <Picker.Item label="V12" value="V12" />
            <Picker.Item label="V13" value="V13" />
            <Picker.Item label="V14" value="V14" />
            <Picker.Item label="V15" value="V15" />
            <Picker.Item label="V16" value="V16" />
            <Picker.Item label="V17" value="V17" />
          </Picker>

          <FormField
            title="Max Top-Roping Grade"
            value={form.maxTopRopingGrade}
            handleChangeText={(e) => setForm({ ...form, maxTopRopingGrade: e })}
            otherStyles="mt-7"
          />

          <FormField
            title="Bio"
            value={form.bio}
            handleChangeText={(e) => setForm({ ...form, bio: e })}
            otherStyles="mt-7"
          />

          <CustomButton
            title="Sign Up"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />

          <View className="flex justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Have an account already?
            </Text>
            <Link
              href="/sign-in"
              className="text-lg font-psemibold text-secondary"
            >
              Login
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
