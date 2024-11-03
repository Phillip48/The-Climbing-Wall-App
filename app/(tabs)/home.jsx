import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FlatList,
  useWindowDimensions,
  Image,
  RefreshControl,
  Text,
  View,
} from "react-native";

import { images } from "../../constants";
import useAppwrite from "../../lib/useAppwrite";
import { getAllSends, getLatestSends, getUserSends } from "../../lib/appwrite";
import {
  EmptyState,
  SearchInput,
  Trending,
  SendCard,
  InfoBox,
} from "../../components";
import { useGlobalContext } from "../../context/GlobalProvider";
import {
  BarChart,
  LineChart,
  PieChart,
  PopulationPyramid,
} from "react-native-gifted-charts";

const Home = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();
  const { data: userPosts } = useAppwrite(() => getUserSends(user.$id));
  const { data: posts, refetch } = useAppwrite(() => getLatestSends(user.$id));
  const [refreshing, setRefreshing] = useState(false);
  const barData = [];
  const barDataTopRoping = [];
  const pieData = [];
  let count = 0;
  let countWarmUp = 0;
  const { width } = useWindowDimensions();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    // await climbingGraph();
    setRefreshing(false);
  };

  const totalAttempts = () => {
    let attemptTotal = 0;
    let funtioncount = 0;
    userPosts.forEach((send) => {
      if (funtioncount == userPosts.length) {
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

  // const warmUpChart = () => {
  //   posts.forEach((post) => {
  //     if (posts.length == countWarmUp) {
  //       if (pieData.length == 0) {
  //         const pieData = [{ value: 1 }, { value: 4 }, { value: 9 }];
  //         console.log("No sends to display", pieData);
  //         count = 0;
  //         return pieData;
  //       }
  //       console.log("Done", pieData);
  //       countWarmUp = 0;
  //       return pieData;
  //     }
  //     // for pie chart
  //     if (post.warmup == false) {
  //       let dataCount = 0;
  //       let newAttempts = Number(post.attempts);
  //       dataCount = newAttempts + dataCount;
  //       let dataObj = {
  //         value: dataCount,
  //         color: "#009FFF",
  //         gradientCenterColor: "#006DFF",
  //       };
  //       // console.log("warmup false", dataObj);
  //       pieData.push(dataObj);
  //     } else if (post.warmup == true) {
  //       let dataCount = 0;
  //       let newAttempts = Number(post.attempts);
  //       dataCount = newAttempts + dataCount;
  //       let dataObj = {
  //         left: 4,
  //         right: 4,
  //       };
  //       // let dataObj = {
  //       //   value: dataCount,
  //       //   color: "#93FCF8",
  //       //   gradientCenterColor: "#3BE9DE",
  //       // };
  //       // console.log("warmup true", dataObj);
  //       pieData.push(dataObj);
  //     }
  //   });
  // };

  useEffect(() => {
    // climbingGraph();
    // warmUpChart();
  }, []);
  return (
    <SafeAreaView className="bg-primary">
      <FlatList
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={() => (
          <View
            style={{ marginBottom: 30 }}
            className="mb-430 flex my-6 px-4 space-y-6"
          >
            <View className="flex justify-between items-start flex-row mb-6">
              <View>
                <Text className="font-pmedium text-sm text-gray-100">
                  Ready to climb?
                </Text>
                <Text className="text-2xl font-psemibold text-white">
                  Welcome Back
                </Text>
              </View>

              <View className="mt-1.5">
                <Image
                  source={images.tcwshortlogotop}
                  className="w-9 h-10"
                  resizeMode="contain"
                />
              </View>
            </View>

            <SearchInput />
            <View
              // style={{ minHeight: 40 }}
              className="w-full flex-1 pt-5 "
            >
              {/* <Text className="text-lg font-pregular text-gray-100 mb-3">
                Dashboard
              </Text> */}
              <Text className="font-pmedium text-lg text-gray-100">User Stats</Text>
              <View
                className="w-full "
                style={{
                  flex: 1,
                  // justifyContent: "center",
                  // alignItems: "center",
                }}
              >
                <View className="w-full flex justify-center items-center mt-6 mb-12 px-4">
                  <View className=" flex flex-row">
                    <InfoBox
                      title={userPosts.length || 0}
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
                        user?.maxTopRopingGrade ? user.maxTopRopingGrade : "N/A"
                      }
                      subtitle={"Max Top\n Roping"}
                      titleStyles="text-xl"
                      containerStyles="mr-6"
                    />
                    <InfoBox
                      title={
                        user?.maxBoulderingGrade
                          ? user.maxBoulderingGrade
                          : "N/A"
                      }
                      subtitle={"Max\n Bouldering "}
                      titleStyles="text-xl"
                    />
                  </View>
                </View>
              </View>
            </View>
            <Text className="font-pmedium text-lg text-gray-100">
              Latest Sends
            </Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState style={{marginTop: 40}} title="No Sends Found" subtitle="No sends created yet" />
        )}
      />
    </SafeAreaView>
  );
};

export default Home;
