import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Image, Text, FlatList, TouchableOpacity } from "react-native";

import { icons } from "../../constants";
import useAppwrite from "../../lib/useAppwrite";
import { getUserSends, signOut, getUserProjects } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import { EmptyState, InfoBox, SendCard } from "../../components";

const Profile = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();
  const { data: posts } = useAppwrite(() => getUserSends(user.$id));
  // const { data: projectPosts } = useAppwrite(() => getUserProjects(user.$id));

  const totalAttempts = () => {
    let attemptTotal = 0;
    let funtioncount = 0;
    posts.forEach((send) => {
      if (funtioncount == posts.length) {
        // console.log('total', attemptTotal)
        return attemptTotal;
      }
      let functionAttempt = send.attempts;
      attemptTotal = +attemptTotal + +functionAttempt;
      // console.log(attemptTotal);
      funtioncount++;
    });
    return attemptTotal;
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLogged(false);
    router.replace("/sign-in");
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        removeClippedSubviews={false}
        data={posts}
        keyExtractor={(item) => item.$id}
        // renderItem={({ item }) => (
        //   <SendCard
        //     title={item.title}
        //     grade={item.grade}
        //     thumbnail={item.thumbnail}
        //     video={item.video}
        //     attempts={item.attempts}
        //     climber={item.users.username}
        //     notes={item.notes}
        //     user={user}
        //     itemId={item.$id}
        //     date={item.date}
        //     // avatar={item.climber.avatar}
        //   />
        // )}
        // ListEmptyComponent={() => (
        //   <EmptyState
        //     title="No Sends Found"
        //     subtitle="No sends found for this profile"
        //   />
        // )}
        ListHeaderComponent={() => (
          <View className="w-full flex justify-center items-center mt-6 mb-12 px-4">
            <TouchableOpacity
              onPress={logout}
              className="flex w-full items-end mb-10"
            >
              <Image
                source={icons.logout}
                resizeMode="contain"
                className="w-6 h-6"
              />
            </TouchableOpacity>

            <View className="w-16 h-16 border border-secondary rounded-lg flex justify-center items-center">
              <Image
                source={{ uri: user?.avatar }}
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
              />
            </View>

            <InfoBox
              title={user?.username}
              containerStyles="mt-5"
              titleStyles="text-lg"
            />

            <View className="mt-5 flex flex-row">
              <InfoBox
                title={posts.length || 0}
                subtitle="Sends"
                titleStyles="text-xl"
                containerStyles="mr-6"
              />
              <InfoBox
                title={totalAttempts() || 0}
                subtitle="Attempts"
                titleStyles="text-xl"
                containerStyles="mr-6"
              />
              <InfoBox
                title={user?.maxTopRopingGrade ? user.maxTopRopingGrade : "N/A"}
                subtitle={"Max Top\n Roping"}
                titleStyles="text-xl"
                containerStyles="mr-6"
              />
              <InfoBox
                title={
                  user?.maxBoulderingGrade ? user.maxBoulderingGrade : "N/A"
                }
                subtitle={"Max\n Bouldering "}
                titleStyles="text-xl"
              />
            </View>
            {/* <View style={{justifyContent: 'center', alignItems: 'start', marginTop: 20}} className="w-full mt-5 flex">
              <Text className="font-pmedium text-sm text-gray-100">Bio:</Text>
              <Text className="text-lg text-white font-psemibold">{user?.bio ? user.bio : ""}</Text>
            </View> */}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default Profile;
