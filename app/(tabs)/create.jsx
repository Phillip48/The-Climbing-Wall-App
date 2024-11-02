import { useState } from "react";
import { router } from "expo-router";
import { ResizeMode, Video } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  Button,
  TextInput,
  Modal,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  RefreshControl,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

import { icons } from "../../constants";
import { createSendPost, getUserSends } from "../../lib/appwrite";
import useAppwrite from "../../lib/useAppwrite";
import { images } from "../../constants";
import {
  CustomButton,
  FormField,
  EmptyState,
  SendCard,
} from "../../components";
import { useGlobalContext } from "../../context/GlobalProvider";

const Create = () => {
  const { user } = useGlobalContext();
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { data: posts, refetch } = useAppwrite(() => getUserSends(user.$id));
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
  const [form, setForm] = useState({
    warmup: false,
    title: "",
    grade: "",
    video: null,
    thumbnail: null,
    attempts: 1,
    notes: "",
    date: "",
  });

  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState("date");
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    setShow(false);
    setDate(selectedDate);
    setForm({ ...form, date: selectedDate });
  };

  const showMode = (modeToShow) => {
    setShow(true);
    setMode(modeToShow);
  };

  const showDatepicker = () => {
    showMode("date");
  };

  const showTimepicker = () => {
    showMode("time");
  };

  const openPicker = async (selectType) => {
    const result = await DocumentPicker.getDocumentAsync({
      type:
        selectType === "image"
          ? ["image/png", "image/heic", "image/jpg"]
          : ["video/mp4", "video/mov", "video/gif"],
    });

    if (!result.canceled) {
      if (selectType === "image") {
        setForm({
          ...form,
          thumbnail: result.assets[0],
        });
      }

      if (selectType === "video") {
        setForm({
          ...form,
          video: result.assets[0],
        });
      }
    } else {
      setTimeout(() => {
        Alert.alert("Document picked", JSON.stringify(result, null, 2));
      }, 100);
    }
  };

  const submit = async () => {
    if (form.grade === "" || form.attempts === "") {
      return Alert.alert("Please provide all fields");
    }
    // Check if attemnpts is a number
    // function isNumber(value) {
    //   return typeof value == "number";
    // }
    // if (isNumber(form.attempts) == false) {
    //   Alert.alert("Error", "Please input a number");
    // }

    setUploading(true);
    try {
      // console.log('date before creating', form.date)
      await createSendPost({
        ...form,
        userId: user.$id,
        userMaxBoulderingGrade: user.maxBoulderingGrade,
        userMaxTopRopingGrade: user.maxTopRopingGrade,
      });
      Alert.alert("Success", "Post uploaded successfully");
      setModalVisible(!modalVisible);
      router.push("/home");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setForm({
        warmup: false,
        title: "",
        grade: "",
        video: null,
        thumbnail: null,
        attempts: "",
        notes: "",
        date: "",
      });

      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        removeClippedSubviews={false}
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <SendCard
            title={item.title}
            user={user}
            grade={item.grade}
            attempts={item.attempts}
            thumbnail={item.thumbnail}
            video={item.video}
            notes={item.notes}
            climber={item.users.username}
            avatar={item.users.avatar}
            date={item.date}
            itemId={item.$id}
          />
        )}
        ListHeaderComponent={() => (
          <View className="flex my-6 px-4 ">
            <View className="flex my-6 px-4 ">
              <View className="flex justify-between items-start flex-row mb-6">
                <View>
                  <Text className="font-pmedium text-sm text-gray-100">
                    Ready to climb?
                  </Text>
                  <Text className="text-2xl font-psemibold text-white">
                    View Your Sends
                  </Text>
                  {/* <Text
                    style={{ width: 230 }}
                    className="font-pmedium text-sm text-gray-100"
                  >
                    Once you have sent your project we will automatically move
                    it to sends!
                  </Text> */}
                </View>

                <View className="mt-1.5">
                  <Image
                    source={images.tcwshortlogotop}
                    className="w-9 h-10"
                    resizeMode="contain"
                  />
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              activeOpacity={0.7}
              style={{ marginTop: 0, marginLeft: 0, marginRight: 0 }}
              className={` bg-secondary rounded-xl min-h-[62px] flex flex-row justify-center items-center`}
            >
              <Text className={`text-primary font-psemibold text-lg`}>
                Log Send
              </Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Projects Found"
            subtitle="No projects created yet"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      <Modal
        animationType="slide"
        swipeToClose={true}
        swipeArea={20} // The height in pixels of the swipeable area, window height by default
        swipeThreshold={50} // The threshold to reach in pixels to close the modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <ScrollView>
          <View style={styles.centeredView}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 20,
                width: "100%",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16 }} className="font-psemibold">
                Log a send!
              </Text>
              <TouchableOpacity
                className={` bg-secondary rounded-xl min-h-[6px] w-[26px] flex flex-row justify-center items-center`}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text className={`text-primary font-psemibold text-lg`}>X</Text>
              </TouchableOpacity>
            </View>
            <View>
              <View style={{ flex: 1, flexDirection: "column", width: "100%" }}>
                <Text
                  className="font-psemibold"
                  style={{
                    fontSize: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Poppins-Medium",
                    marginBottom: 0,
                    marginTop: 30,
                  }}
                >
                  Name Your Send
                </Text>
                <View className="w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 focus:border-secondary flex flex-row items-center">
                  <TextInput
                    className="flex-1 text-white font-psemibold text-base"
                    placeholderTextColor="#7B7B8B"
                    value={form.title}
                    style={{ fontFamily: "Poppins-SemiBold", marginTop: 0 }}
                    onChangeText={(e) => setForm({ ...form, title: e })}
                  />
                </View>
                <Text
                  className="font-psemibold"
                  style={{
                    fontSize: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Poppins-Medium",
                    marginBottom: -10,
                    marginTop: 30,
                  }}
                >
                  Select bouldering or top roping grade*
                </Text>
                <Picker
                  style={{
                    fontSize: 14,
                    // color: "#CDCDE0",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Poppins-SemiBold",
                  }}
                  className="font-psemibold"
                  selectedValue={form.grade}
                  onValueChange={(value) => setForm({ ...form, grade: value })}
                >
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
                  <Picker.Item label="5.2" value="5.2" />
                  <Picker.Item label="5.3" value="5.3" />
                  <Picker.Item label="5.4" value="5.4" />
                  <Picker.Item label="5.5" value="5.5" />
                  <Picker.Item label="5.6" value="5.6" />
                  <Picker.Item label="5.7" value="5.7" />
                  <Picker.Item label="5.8" value="5.8" />
                  <Picker.Item label="5.9" value="5.9" />
                  <Picker.Item label="5.10a" value="5.10a" />
                  <Picker.Item label="5.10b" value="5.10b" />
                  <Picker.Item label="5.10c" value="5.10c" />
                  <Picker.Item label="5.10d" value="5.10d" />
                  <Picker.Item label="5.11a" value="5.11a" />
                  <Picker.Item label="5.11b" value="5.11b" />
                  <Picker.Item label="5.11c" value="5.11c" />
                  <Picker.Item label="5.11d" value="5.11d" />
                  <Picker.Item label="5.12a" value="5.12a" />
                  <Picker.Item label="5.12b" value="5.12b" />
                  <Picker.Item label="5.12c" value="5.12c" />
                  <Picker.Item label="5.12d" value="5.12d" />
                  <Picker.Item label="5.13a" value="5.13a" />
                  <Picker.Item label="5.13b" value="5.13b" />
                  <Picker.Item label="5.13c" value="5.13c" />
                  <Picker.Item label="5.13d" value="5.13d" />
                  <Picker.Item label="5.14a" value="5.14a" />
                  <Picker.Item label="5.14b" value="5.14b" />
                  <Picker.Item label="5.14c" value="5.14c" />
                  <Picker.Item label="5.14d" value="5.14d" />
                </Picker>
                <Text
                  className="font-psemibold"
                  style={{
                    fontSize: 16,

                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Poppins-Medium",
                    marginBottom: -20,
                    marginTop: 10,
                  }}
                >
                  Attempts*
                </Text>
                <FormField
                  title=""
                  style={{ fontFamily: "Poppins-SemiBold", marginTop: 0 }}
                  value={form.attempts}
                  handleChangeText={(e) => setForm({ ...form, attempts: e })}
                  otherStyles=""
                />
                <Text
                  className="font-psemibold"
                  style={{
                    fontSize: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Poppins-Medium",
                    marginBottom: -10,
                    marginTop: 30,
                  }}
                >
                  Was this a warmup send?
                </Text>
                <Picker
                  // selectedValue={status}
                  // style={{ height: 50, width: 150 }}
                  // onValueChange={setStatus}
                  selectedValue={form.warmup}
                  onValueChange={(value) =>
                    setForm({ ...form, warmup: value })
                  }
                >
                  <Picker.Item label="Yes" value={true} />
                  <Picker.Item label="No" value={false} />
                </Picker>
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "space-around",
                    alignItems: "center",
                    marginTop: 10,
                  }}
                >
                  <TouchableOpacity
                    onPress={showDatepicker}
                    activeOpacity={0.7}
                    style={{
                      marginTop: 0,
                      marginLeft: 0,
                      marginRight: 0,
                      paddingLeft: 10,
                      paddingRight: 10,
                    }}
                    className={` bg-secondary rounded-xl min-h-[62px] flex flex-row justify-center items-center`}
                  >
                    <Text className={`text-primary font-psemibold text-lg`}>
                      Select Date
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={showTimepicker}
                    activeOpacity={0.7}
                    style={{
                      marginTop: 0,
                      marginLeft: 0,
                      marginRight: 0,
                      paddingLeft: 10,
                      paddingRight: 10,
                    }}
                    className={` bg-secondary rounded-xl min-h-[62px] flex flex-row justify-center items-center`}
                  >
                    <Text className={`text-primary font-psemibold text-lg`}>
                      Select Time
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    color: "black",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Poppins-Medium",
                    marginTop: 10,
                  }}
                >
                  Selected: {date.toLocaleString()}
                </Text>
                {show && (
                  <DateTimePicker
                    value={date}
                    mode={mode}
                    is24Hour={true}
                    onChange={onChange}
                  />
                )}
                <Text
                  className="font-psemibold"
                  style={{
                    fontSize: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Poppins-Medium",
                    marginBottom: -20,
                    marginTop: 30,
                  }}
                >
                  Notes
                </Text>
                <FormField
                  title=""
                  value={form.notes}
                  handleChangeText={(e) => setForm({ ...form, notes: e })}
                  otherStyles=""
                />
                {/* <Text className="text-2xl text-white font-psemibold">Upload Video</Text> */}
                <View className="mt-7 space-y-2">
                  <Text className="text-base font-pmedium">Upload Video</Text>

                  <TouchableOpacity onPress={() => openPicker("video")}>
                    {form.video ? (
                      <Video
                        source={{ uri: form.video.uri }}
                        className="w-full h-64 rounded-2xl"
                        useNativeControls
                        resizeMode={ResizeMode.COVER}
                        isLooping
                      />
                    ) : (
                      <View className="w-full h-40 px-4 bg-black-100 rounded-2xl border border-black-200 flex justify-center items-center">
                        <View className="w-14 h-14 border border-dashed border-secondary-100 flex justify-center items-center">
                          <Image
                            source={icons.upload}
                            resizeMode="contain"
                            alt="upload"
                            className="w-1/2 h-1/2"
                          />
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                <View className="mt-7 space-y-2">
                  <Text className="text-base font-pmedium">
                    Thumbnail Image
                  </Text>

                  <TouchableOpacity onPress={() => openPicker("image")}>
                    {form.thumbnail ? (
                      <Image
                        source={{ uri: form.thumbnail.uri }}
                        resizeMode="cover"
                        className="w-full h-64 rounded-2xl"
                      />
                    ) : (
                      <View className="w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 flex justify-center items-center flex-row space-x-2">
                        <Image
                          source={icons.upload}
                          resizeMode="contain"
                          alt="upload"
                          className="w-5 h-5"
                        />
                        <Text className="text-sm text-gray-100 font-pmedium">
                          Choose a file
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                <CustomButton
                  title="Submit & Publish"
                  handlePress={submit}
                  containerStyles="mt-7"
                  isLoading={uploading}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    height: "auto",
    width: "100%",
    margin: 10,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
  },
  modalView: {
    flex: 1,
    justifyContent: "space-between",
    // flexDirection: 'row',
    // alignItems: "center",
    flexDirection: "row",
    height: "auto",
    width: "100%",
    margin: 10,
    // backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    // alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    // width: 25,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    // width: 75,
  },
  width75: {
    width: 75,
  },
  width25: {
    width: 25,
  },
});

export default Create;
