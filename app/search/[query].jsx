import { useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import useAppwrite from "../../lib/useAppwrite";
import { searchSendsGrade, searchProjectsGrade } from "../../lib/appwrite";
import { EmptyState, SearchInput, SendCard, ProjectCard } from "../../components";

const Search = () => {
  const { query } = useLocalSearchParams();
  const { data: posts, refetch } = useAppwrite(() => searchSendsGrade(query));
  const { data: projectPosts, projectRefetch } = useAppwrite(() => searchProjectsGrade(query));


  useEffect(() => {
    refetch();
  }, [query]);

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <SendCard
            grade={item.grade}
            thumbnail={item.thumbnail}
            video={item.video}
            climber={item.climber.username}
            avatar={item.climber.avatar}
          />
        )}
        ListHeaderComponent={() => (
          <>
            <View className="flex my-6 px-4">
              <Text className="font-pmedium text-gray-100 text-sm">
                Search Results for sends
              </Text>
              <Text className="text-2xl font-psemibold text-white mt-1">
                {query}
              </Text>

              <View className="mt-6 mb-8">
                <SearchInput initialQuery={query} refetch={refetch} />
              </View>
            </View>
          </>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Sends Found"
            subtitle="No sends found for this search query"
          />
        )}
      />
      <FlatList
        data={projectPosts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <ProjectCard
            grade={item.grade}
            thumbnail={item.thumbnail}
            video={item.video}
            climber={item.climber.username}
            avatar={item.climber.avatar}
          />
        )}
        ListHeaderComponent={() => (
          <>
            <View className="flex my-6 px-4">
              <Text className="font-pmedium text-gray-100 text-sm">
                Search Results for projects
              </Text>
              <Text className="text-2xl font-psemibold text-white mt-1">
                {query}
              </Text>

              <View className="mt-6 mb-8">
                <SearchInput initialQuery={query} refetch={refetch} />
              </View>
            </View>
          </>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Projetcs Found"
            subtitle="No projects found for this search query"
          />
        )}
      />
    </SafeAreaView>
  );
};

export default Search;
