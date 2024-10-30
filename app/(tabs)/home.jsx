import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, Image, RefreshControl, Text, View } from "react-native";

import { images } from "../../constants";
import useAppwrite from "../../lib/useAppwrite";
import { getAllSends, getLatestSends } from "../../lib/appwrite";
import { EmptyState, SearchInput, Trending, SendCard } from "../../components";
import { useGlobalContext } from "../../context/GlobalProvider";
import {
  BarChart,
  LineChart,
  PieChart,
  PopulationPyramid,
} from "react-native-gifted-charts";

const Home = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();

  const { data: posts, refetch } = useAppwrite(getAllSends);
  // const { data: latestPosts } = useAppwrite(getLatestSends);

  const [refreshing, setRefreshing] = useState(false);
  // const barData = [
  //   { value: 1, label: "V2" },
  //   { value: 4, label: "V5", frontColor: "#177AD5" },
  //   { value: 1, label: "V3", frontColor: "#177AD5" },
  //   { value: 6, label: "V6" },
  //   { value: 1, label: "V2", frontColor: "#177AD5" },
  //   { value: 6, label: "V7" },
  //   { value: 8, label: "V8" },
  // ];
  const barData = [];
  const barDataTest = [
    { label: "V10", value: 3 },
    { label: "V8", value: 2 },
  ];
  let count = 0;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const climbingGraph = async () => {
    posts.forEach((post) => {
      // console.log(posts.length === count, posts.length, count );
      if (posts.length == count) {
        if (barData.length === 0) {
          const barData = [
            { value: 1, label: "V2" },
            { value: 4, label: "V5", frontColor: "#177AD5" },
            { value: 1, label: "V3", frontColor: "#177AD5" },
            { value: 6, label: "V6" },
            { value: 1, label: "V2", frontColor: "#177AD5" },
            { value: 6, label: "V7" },
            { value: 8, label: "V8" },
          ];
          console.log("No sends to display", barData);
          return barData;
        }
        console.log("Bar Data", barData);
        return barData;
      }
      let dataObj = {
        value: post.attempts,
        label: post.grade,
        topLabelComponent: () => (
          <Text
            style={{
              color: "white",
              fontSize: 12,
              marginBottom: 8,
              fontWeight: 700,
            }}
          >
            {post.attempts}
          </Text>
        ),
      };
      // parseInt(dataObj.value)
      // console.log(dataObj)
      barData.push(dataObj);
      count++;
    });
  };
  // one flatlist
  // with list header
  // and horizontal flatlist

  //  we cannot do that with just scrollview as there's both horizontal and vertical scroll (two flat lists, within trending)
  useEffect(() => {
    climbingGraph();
    // console.log(barData)
  }, [climbingGraph]);
  return (
    <SafeAreaView className="bg-primary">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <SendCard
            title={item.title}
            // Added user below and the require import
            // to display the thumbnail on sendcard comp.
            user={user}
            grade={item.grade}
            attempts={item.attempts}
            thumbnail={item.thumbnail}
            video={item.video}
            notes={item.notes}
            climber={item.users.username}
            avatar={item.users.avatar}
          />
        )}
        ListHeaderComponent={() => (
          <View className="flex my-6 px-4 space-y-6">
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

            <View className="w-full flex-1 pt-5 pb-8">
              <Text className="text-lg font-pregular text-gray-100 mb-3">
                Dashboard
              </Text>
              <View
                className="w-full"
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <BarChart
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  barWidth={22}
                  width={330}
                  noOfSections={5}
                  barBorderRadius={4}
                  frontColor="white"
                  data={barData}
                  yAxisThickness={1}
                  xAxisThickness={1}
                  xAxisLabelTextStyle={{ color: "white", textAlign: "center" }}
                  yAxisLabelTextStyle={{ color: "white", textAlign: "center" }}
                  // yAxisLabelTexts={[
                  //   "0",
                  //   "2",
                  //   "4",
                  //   "6",
                  //   "8",
                  //   "10",
                  //   "12",
                  //   "14",
                  //   "16",
                  // ]}
                  xAxisColor={"white"}
                  yAxisTextStyle={{ color: "white" }}
                  isAnimated
                />
              </View>
              {/* <Trending posts={latestPosts ?? []} /> */}
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState title="No Sends Found" subtitle="No sends created yet" />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default Home;
