import { useState } from "react";
import { ResizeMode, Video } from "expo-av";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
} from "react-native";
import { editSendPost, deleteSendPost } from "../lib/appwrite";
import { router } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
// import { CustomButton, FormField } from "../components";
import { icons } from "../constants";

const SendCard = ({
  user,
  title,
  grade,
  attempts,
  climber,
  notes,
  avatar,
  thumbnail,
  video,
  itemId,
  date,
  warmup,
}) => {
  const [play, setPlay] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [pickerDate, setDate] = useState(new Date());
  const [mode, setMode] = useState("date");
  const [show, setShow] = useState(false);
  const [sendUpdate, setSendUpdate] = useState("");
  // Convert to string to display in edit modal
  let newAttempts = attempts.toString();
  let formDate = date; //2024-10-30T17:57:00.000+00:00
  let newDate = new Date(formDate);
  let formattedDate = newDate.toISOString().slice(0, 16); //2024-10-30T17:57
  const [form, setForm] = useState({
    warmup: warmup,
    title: title,
    grade: grade,
    video: video,
    thumbnail: thumbnail,
    attempts: newAttempts,
    notes: notes,
    date: date,
  });

  const openPicker = async (selectType) => {
    const result = await DocumentPicker.getDocumentAsync({
      type:
        selectType === "image"
          ? ["image/png", "image/jpg"]
          : ["video/mp4", "video/gif"],
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

  const updateSend = async (str, itemId, grade) => {
    setSendUpdate(str);
    setModalVisible(!modalVisible);
    if (str == "edit") {
      setModalEditVisible(true);
      return;
    } else if (str == "delete") {
      try {
        await deleteSendPost(itemId, grade, user.$id);
        Alert.alert("Success", "Post deleted successfully");
        router.push("/home");
      } catch (error) {
        Alert.alert("Error", error.message);
      } finally {
        setSendUpdate("");
      }
      return;
    }
  };

  // Submit function for editting the send
  const submit = async () => {
    if (form.attempts == "" || form.grade == "") {
      Alert.alert("Error", "Please fill in all fields");
    }
    // if(isNumber(!form.attempts)){
    //   Alert.alert("Error", "Attempts must be number only");
    // }
    setModalEditVisible(!modalEditVisible);
    setUploading(true);
    try {
      await editSendPost({
        ...form,
        userId: user.$id,
        itemId: itemId,
        userMaxBoulderingGrade: user.maxBoulderingGrade,
        userMaxTopRopingGrade: user.maxTopRopingGrade,
      });
      Alert.alert("Success", "Send updated successfully");
      router.push("/profile");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setForm({
        warmup: warmup,
        title: title,
        grade: grade,
        video: video,
        thumbnail: thumbnail,
        attempts: newAttempts,
        notes: notes,
        date: date,
      });

      setUploading(false);
    }
  };
  return (
    <View className="flex flex-col items-center px-4 mb-14">
      <View className="flex flex-row gap-3 items-start">
        <View className="flex justify-center items-center flex-row flex-1">
          <View
            style={{ marginTop: 0 }}
            className="w-[60px] h-[60px] rounded-lg border border-secondary flex justify-center items-center p-0.5"
          >
            <Image
              // {...{ uri:avatar} == null ? source={ uri: avatar } : source={ uri: user?.avatar }}
              source={{ uri: user?.avatar }}
              // Changed source from below to above
              // for user to have thumbnail by passing using to card comp.
              // source={{ uri: avatar }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          </View>

          <View className="flex justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="font-psemibold text-xs text-white"
              numberOfLines={1}
            >
              Title: {title}
            </Text>
            <Text
              className="font-psemibold text-sm text-white"
              numberOfLines={1}
            >
              Grade: {grade} - Attempts: {attempts}
            </Text>
            {/* <Text
              className="font-psemibold text-sm text-white"
              numberOfLines={1}
            >
              
            </Text> */}
            {/* Date: {date? date:'No Date Recorded'} */}
            <Text
              className="text-sm text-gray-100 font-pregular"
              numberOfLines={1}
            >
              Date: {date ? formattedDate : "No Date Recorded"}
            </Text>
            <Text
              className="text-sm text-gray-100 font-pregular"
              numberOfLines={1}
            >
              Climber: {climber}
            </Text>
            <Text
              className="text-sm text-gray-100 font-pregular"
              // numberOfLines={1}
            >
              Notes: {notes}
            </Text>
          </View>
        </View>

        <View className="pt-2">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setModalVisible(true)}
            className=""
            // w-full h-60 rounded-xl mt-3 relative flex justify-center items-center
          >
            <Image
              source={icons.menu}
              className="w-5 h-5"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
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
          <View
            style={{
              // flex: 1,
              // justifyContent: "center",
              // alignItems: "center",
              // flexDirection: "column",
              // height: "auto",
              // width: "100%",
              // margin: 10,
              backgroundColor: "white",
              borderRadius: 20,
              padding: 20,
            }}
          >
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
                Edit or Delete Send!
              </Text>
              <TouchableOpacity
                className={` bg-secondary rounded-xl min-h-[6px] w-[26px] flex flex-row justify-center items-center`}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text className={`text-primary font-psemibold text-lg`}>X</Text>
              </TouchableOpacity>
            </View>
            <Picker
              style={{
                fontSize: 14,
                // color: "#CDCDE0",
                // alignItems: "center",
                // justifyContent: "center",
                fontFamily: "Poppins-SemiBold",
              }}
              selectedValue={sendUpdate}
              onValueChange={(value) => updateSend(value, itemId, grade)}
            >
              <Picker.Item label="Edit" value="edit" />
              <Picker.Item label="Delete" value="delete" />
            </Picker>
          </View>
        </Modal>
      </View>

      {video == null ? (
        <Text style={{marginTop:10}} className={"text-sm text-gray-100 font-pregular"}>No Video</Text>
      ) : (
        <>
          {play ? (
            <Video
              source={{ uri: video }}
              className="w-full h-60 rounded-xl mt-3"
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls
              shouldPlay
              onPlaybackStatusUpdate={(status) => {
                if (status.didJustFinish) {
                  setPlay(false);
                }
              }}
            />
          ) : (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setPlay(true)}
              className="w-full h-60 rounded-xl mt-3 relative flex justify-center items-center"
            >
              <Image
                source={{ uri: thumbnail }}
                className="w-full h-full rounded-xl mt-3"
                resizeMode="cover"
              />

              <Image
                source={icons.play}
                className="w-12 h-12 absolute"
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </>
      )}
      <Modal
        animationType="slide"
        swipeToClose={false}
        swipeArea={20} // The height in pixels of the swipeable area, window height by default
        swipeThreshold={50} // The threshold to reach in pixels to close the modal
        transparent={true}
        visible={modalEditVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalEditVisible(!modalEditVisible);
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
                Edit Send!
              </Text>
              <TouchableOpacity
                className={` bg-secondary rounded-xl min-h-[6px] w-[26px] flex flex-row justify-center items-center`}
                onPress={() => setModalEditVisible(!modalEditVisible)}
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
                  <Picker.Item label="5.15a" value="5.15a" />
                  <Picker.Item label="5.15b" value="5.15b" />
                  <Picker.Item label="5.15c" value="5.15c" />
                  <Picker.Item label="5.15d" value="5.15d" />
                </Picker>
                <Text
                  className="font-psemibold"
                  style={{
                    fontSize: 16,

                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Poppins-Medium",
                    marginBottom: 0,
                    marginTop: 10,
                  }}
                >
                  Attempts*
                </Text>
                <View className="w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 focus:border-secondary flex flex-row items-center">
                  <TextInput
                    className="flex-1 text-white font-psemibold text-base"
                    placeholderTextColor="#7B7B8B"
                    value={form.attempts}
                    onChangeText={(e) => setForm({ ...form, attempts: e })}
                  />
                </View>

                <Text
                  className="font-psemibold"
                  style={{
                    fontSize: 16,

                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Poppins-Medium",
                    marginBottom: 0,
                    marginTop: 10,
                  }}
                >
                  Was this a warmup
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
                  selectedValue={form.warmup}
                  onValueChange={(value) => setForm({ ...form, warmup: value })}
                >
                  <Picker.Item label="Yes" value={true} />
                  <Picker.Item label="No" value={false} />
                </Picker>
                {/* <FormField
                    title=""
                    style={{ fontFamily: "Poppins-SemiBold", marginTop: 0 }}
                    value={form.attempts}
                    handleChangeText={(e) => setForm({ ...form, attempts: e })}
                    otherStyles=""
                  /> */}
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
                  Selected: {pickerDate.toLocaleString()}
                </Text>
                {show && (
                  <DateTimePicker
                    value={pickerDate}
                    mode={mode}
                    is24Hour={true}
                    onChange={onChange}
                  />
                )}
                <Text
                  // className="font-psemibold"
                  style={{
                    fontSize: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Poppins-Medium",
                    marginBottom: 5,
                    marginTop: 10,
                  }}
                >
                  Notes
                </Text>
                <View className="w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 focus:border-secondary flex flex-row items-center">
                  <TextInput
                    className="flex-1 text-white font-psemibold text-base"
                    placeholderTextColor="#7B7B8B"
                    value={form.notes}
                    onChangeText={(e) => setForm({ ...form, notes: e })}
                  />
                </View>

                {/* <FormField
                    title=""
                    value={form.notes}
                    handleChangeText={(e) => setForm({ ...form, notes: e })}
                    otherStyles=""
                  /> */}
                {/* <Text className="text-2xl text-white font-psemibold">Upload Video</Text> */}
                <View className="mt-7 space-y-2">
                  <Text
                    style={{
                      fontSize: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "Poppins-Medium",
                      marginBottom: 0,
                      marginTop: 30,
                      color: "white",
                    }}
                  >
                    Upload Video
                  </Text>

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

                <TouchableOpacity
                  onPress={submit}
                  activeOpacity={0.7}
                  className={`bg-secondary rounded-xl min-h-[62px] flex flex-row justify-center items-center`}
                  // disabled={uploading}
                  style={{ marginTop: 20 }}
                >
                  <Text className={`text-primary font-psemibold text-lg`}>
                    Submit & Publish
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </Modal>
    </View>
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

export default SendCard;
