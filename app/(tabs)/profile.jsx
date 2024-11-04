import { router } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Image,
  Text,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
  RefreshControl,
} from "react-native";

import { icons } from "../../constants";
import useAppwrite from "../../lib/useAppwrite";
import {
  getUserSends,
  signOut,
  getUserProjects,
  editProfile,
} from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import { EmptyState, InfoBox, SendCard } from "../../components";
import { BarChart } from "react-native-gifted-charts";
import {
  LineChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
} from "react-native-chart-kit";

const Profile = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();
  const [refreshing, setRefreshing] = useState(false);
  const { data: posts, refetch } = useAppwrite(() => getUserSends(user.$id));
  const [form, setForm] = useState({
    username: user?.username,
    maxBoulderingGrade: user?.maxBoulderingGrade,
    maxTopRopingGrade: user?.maxTopRopingGrade,
    avatar: user?.avatar,
    userId: user?.$id,
    // bio: bio,
  });

  const barData = [];
  const barDataTopRoping = [];
  const pieData = [];
  const sendDates = [];
  let dateCount = 0;
  let count = 0;
  const { width } = useWindowDimensions();

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

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    await climbingGraph();
    await postsDate();
    setRefreshing(false);
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLogged(false);
    router.replace("/sign-in");
  };

  const editUserProfile = async () => {
    await editProfile(form);
    return;
  };

  const climbingGraph = async () => {
    posts.forEach((post) => {
      // if done
      if (posts.length - 1 == count) {
        if (barData.length == 0) {
          // const barData = [
          //   { value: 1, label: "V2" },
          //   { value: 4, label: "V5", frontColor: "#177AD5" },
          //   { value: 1, label: "V3", frontColor: "#177AD5" },
          //   { value: 6, label: "V6" },
          //   { value: 1, label: "V2", frontColor: "#177AD5" },
          //   { value: 6, label: "V7" },
          //   { value: 8, label: "V8" },
          // ];
          console.log("No sends to display", barData, pieData);
          count = 0;
          return barData, pieData;
        }
        count = 0;
        barData.sort((a, b) => {
          let newAGrade = Number(a.label.substring(1));
          let newBGrade = Number(b.label.substring(1));
          // console.log(newAGrade, newBGrade);
          return newAGrade - newBGrade;
        });
        barDataTopRoping.sort((a, b) => {
          let newAGrade = Number(a.label.substring(1));
          let newBGrade = Number(b.label.substring(1));
          // console.log(newAGrade, newBGrade);
          return newAGrade - newBGrade;
        });
        return barData, barDataTopRoping;
      }
      if (post.grade.startsWith("V")) {
        // for bar chart 1 graph bouldering
        let dataObj = {
          value: post.attempts,
          label: post.grade,
          topLabelComponent: () => (
            <Text
              style={{
                color: "white",
                fontSize: 12,
                marginBottom: 4,
                fontWeight: 700,
              }}
            >
              {post.attempts}
            </Text>
          ),
        };
        barData.push(dataObj);
        count++;
      } else {
        // for bar chart top roping 2 graph
        let dataObj = {
          value: post.attempts,
          label: post.grade,
          topLabelComponent: () => (
            <Text
              style={{
                color: "white",
                fontSize: 12,
                marginBottom: 4,
                fontWeight: 700,
              }}
            >
              {post.attempts}
            </Text>
          ),
        };
        barDataTopRoping.push(dataObj);
        count++;
        // return barData, pieData;
      }
    });
  };

  const postsDate = async () => {
    if (posts.length - 1 == dateCount) {
      if (sendDates.length == 0) {
        console.log("No send dates to display", sendDates);
        dateCount = 0;
        return sendDates;
      }
      console.log("Loop done", sendDates);
      return sendDates;
    }
    posts.forEach((send) => {
      let formDate = send.date; //2024-10-30T17:57:00.000+00:00
      let newDate = new Date(formDate);
      let formattedDate = newDate.toISOString().split("T")[0]; //2024-10-30
      let dataObj = {
        date: formattedDate,
        count: Number(send.attempts),
      };
      // console.log(dataObj);
      sendDates.push(dataObj);
      // console.log("Loop working count-", dateCount, dataObj);
      dateCount++;
    });
  };

  useEffect(() => {
    climbingGraph();
    // warmUpChart();
    postsDate();
  }, [climbingGraph, postsDate]);
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={() => (
          <View className="w-full flex justify-center items-center mt-6 mb-12 px-4">
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                marginBottom: 10,
                justifyContent: "space-between",
              }}
              className="w-full justify-center items-center"
            >
              <TouchableOpacity
                onPress={editUserProfile}
                // className="flex w-full items-start mb-10"
              >
                <Image
                  source={icons.settings}
                  resizeMode="contain"
                  className="w-6 h-6"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={logout}
                // className="flex w-full items-end mb-10"
              >
                <Image
                  source={icons.logout}
                  resizeMode="contain"
                  className="w-6 h-6"
                />
              </TouchableOpacity>
            </View>
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
                title={
                  user?.maxTopRopingGrade ? user?.maxTopRopingGrade : "N/A"
                }
                subtitle={"Max Top\n Roping"}
                titleStyles="text-xl"
                containerStyles="mr-6"
              />
              <InfoBox
                title={
                  user?.maxBoulderingGrade ? user?.maxBoulderingGrade : "N/A"
                }
                subtitle={"Max\n Bouldering "}
                titleStyles="text-xl"
              />
            </View>
            {/* <View style={{justifyContent: 'center', alignItems: 'start', marginTop: 20}} className="w-full mt-5 flex">
              <Text className="font-pmedium text-sm text-gray-100">Bio:</Text>
              <Text className="text-lg text-white font-psemibold">{user?.bio ? user.bio : ""}</Text>
            </View> */}
            <View
              style={{ minHeight: 300 }}
              className="w-full flex-1 pt-5 pb-8"
            >
              <Text className="text-lg font-pregular text-gray-100 mb-3">
                Stats
              </Text>

              <View
                className="w-full mb-3"
                style={{
                  flex: 1,
                  // justifyContent: "center",
                  // alignItems: "center",
                }}
              >
                <Text className="text-sm font-pregular text-gray-100 mb-3">
                  Calendar Heatmap
                </Text>
                <View style={{flex:1, justifyContent: 'center'}}>
                  <ContributionGraph
                    values={sendDates}
                    // startDate={new Date("2024-08-01")}
                    endDate={new Date("2025-01-01")}
                    numDays={100}
                    width={width}
                    height={220}
                    chartConfig={{
                      backgroundGradientFrom: "#161622",
                      backgroundGradientFromOpacity: 0,
                      backgroundGradientTo: "#161622",
                      backgroundGradientToOpacity: 0,
                      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                      strokeWidth: 3, // optional, default 3
                      barPercentage: 0.5,
                      useShadowColorFromDataset: false, // optional
                    }}
                  />
                </View>
                <Text className="text-sm font-pregular text-gray-100 mb-3">
                  Bouldering
                </Text>
                <BarChart
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  barWidth={20}
                  width={width * 0.8}
                  height={300}
                  noOfSections={5}
                  barBorderRadius={4}
                  frontColor="white"
                  data={barData}
                  yAxisThickness={1}
                  yAxisStyle={{ color: "white", textAlign: "center" }}
                  xAxisThickness={1}
                  xAxisLabelTextStyle={{ color: "white", textAlign: "center" }}
                  xAxisColor={"white"}
                  yAxisColor={"white"}
                  yAxisTextStyle={{ color: "white" }}
                  // isAnimated
                />
                <Text className="font-pmedium text-sm text-gray-100">
                  x axis is the grade - y axis is the attempts
                </Text>
              </View>
              <View
                className="w-full mb-3"
                style={{
                  flex: 1,
                  // justifyContent: "center",
                  // alignItems: "center",
                  marginTop: 20,
                }}
              >
                <Text className="text-sm font-pregular text-gray-100 mb-3">
                  Top Roping
                </Text>
                <BarChart
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  barWidth={20}
                  width={width * 0.8}
                  height={300}
                  noOfSections={5}
                  barBorderRadius={4}
                  frontColor="white"
                  data={barDataTopRoping}
                  yAxisThickness={1}
                  yAxisStyle={{ color: "white", textAlign: "center" }}
                  xAxisThickness={1}
                  xAxisLabelTextStyle={{ color: "white", textAlign: "center" }}
                  xAxisColor={"white"}
                  yAxisColor={"white"}
                  yAxisTextStyle={{ color: "white" }}
                  // isAnimated
                />
                <Text className="font-pmedium text-sm text-gray-100">
                  x axis is the grade - y axis is the attempts
                </Text>

                {/* <PopulationPyramid 
                  showTextBackground
                  textBackgroundRadius={26}
                  data={pieData}
                /> */}
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState title="No Sends Found" subtitle="No sends created yet" />
        )}
      />
    </SafeAreaView>
  );
};

export default Profile;
