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
  const barData = [];
  let count = 0;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    await climbingGraph();
    setRefreshing(false);
  };

  const climbingGraph = async () => {
    posts.forEach((post) => {
      if (posts.length == count) {
        if (barData.length == 0) {
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
          count = 0;
          return barData;
        }
        count = 0;
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
      barData.push(dataObj);
      count++;
    });
  };

  useEffect(() => {
    climbingGraph();
  }, [climbingGraph]);
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
          <View style={{marginBottom:430}} className="flex my-6 px-4 space-y-6">
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
              style={{ minHeight: 300 }}
              className="w-full flex-1 pt-5 pb-8"
            >
              <Text className="text-lg font-pregular text-gray-100 mb-3">
                Dashboard
              </Text>
              <View
                className="w-full mb-3"
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
                  barWidth={20}
                  width={260}
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

export default Home;
