import { useAuth, useUser } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { LogOut, User as UserIcon } from "lucide-react-native";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  
  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <View className="flex-1 bg-white items-center justify-center p-6">
      <View className="items-center mb-10">
        {user?.imageUrl ? (
          <Image 
            source={{ uri: user.imageUrl }} 
            className="w-24 h-24 rounded-full mb-4 border-4 border-blue-50"
          />
        ) : (
          <View className="w-24 h-24 bg-blue-50 rounded-full items-center justify-center mb-4">
            <UserIcon size={40} color="#2563EB" />
          </View>
        )}
        <Text className="text-2xl font-bold text-gray-900">Hello, {user?.firstName || "User"}!</Text>
        <Text className="text-gray-500 font-medium">{user?.primaryEmailAddress?.emailAddress}</Text>
      </View>

      <View className="w-full space-y-4">
        <View className="bg-gray-50 p-8 rounded-3xl border border-gray-100 shadow-sm">
          <Text className="text-gray-900 font-bold text-xl mb-3 text-center">AI Calories Tracker</Text>
          <Text className="text-gray-500 text-center leading-5">
            Your account is verified and your data is securely synced with Cloud Firestore.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => signOut()}
          className="bg-red-50 py-4 rounded-2xl flex-row items-center justify-center mt-12"
        >
          <LogOut size={20} color="#EF4444" />
          <Text className="text-red-600 font-bold ml-2">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
