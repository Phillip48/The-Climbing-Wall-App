import { useState } from "react";
import { ResizeMode, Video } from "expo-av";
import { View, Text, TouchableOpacity, Image } from "react-native";

import { icons } from "../constants";

const SendCard = ({ user, grade, attempts, climber, notes, avatar, thumbnail, video }) => {
  const [play, setPlay] = useState(false);

  // Function to check if there is a video with the send. If there isnt
  // then display text, if there is show video
  const videoUploaded = (video) => {
    if (video == null){
      return <Text style={{color:'#fff', marginTop: 10}}>No video for the send!</Text>
    } else {
      // HTML/CODE to play video
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
    }
  }

  return (
    <View className="flex flex-col items-center px-4 mb-14">
      <View className="flex flex-row gap-3 items-start">
        <View className="flex justify-center items-center flex-row flex-1">
          <View style={{marginTop: 0}} className="w-[60px] h-[60px] rounded-lg border border-secondary flex justify-center items-center p-0.5">
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
              className="font-psemibold text-sm text-white"
              numberOfLines={1}
            >
              Grade: {grade}    -     Attempts: {attempts}
            </Text>
            {/* <Text
              className="font-psemibold text-sm text-white"
              numberOfLines={1}
            >
              
            </Text> */}
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
          <Image source={icons.menu} className="w-5 h-5" resizeMode="contain" />
        </View>
      </View>

      {videoUploaded(video)}

      {/* {play ? (
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
      )} */}
    </View>
  );
};

export default SendCard;
