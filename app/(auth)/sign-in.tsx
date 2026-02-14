import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";
import { useOAuth, useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Eye, EyeOff, Chrome as Google, Lock, Mail } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  useWarmUpBrowser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const onSignInPress = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/");
      } else {
        console.log(result);
        setError("Something went wrong. Please check your credentials.");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignInPress = useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow();

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
        router.replace("/");
      } else {
        // Use signIn or signUp for next steps such as MFA
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-8 pt-20 pb-10">
          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-blue-50 rounded-3xl items-center justify-center mb-6 shadow-sm">
              <Image
                source={require("@/assets/images/logo.png")}
                className="w-12 h-12"
                resizeMode="contain"
              />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</Text>
            <Text className="text-gray-500 text-center">
              Please enter your details to sign in to your account
            </Text>
          </View>

          {error ? (
            <View className="bg-red-50 p-4 rounded-2xl mb-6">
              <Text className="text-red-600 text-sm text-center font-medium">{error}</Text>
            </View>
          ) : null}

          <View className="space-y-4">
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">Email Address</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4">
                <Mail size={20} color="#9CA3AF" />
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-3 text-gray-900 font-medium"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View className="mt-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">Password</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4">
                <Lock size={20} color="#9CA3AF" />
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-3 text-gray-900 font-medium"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color="#9CA3AF" />
                  ) : (
                    <Eye size={20} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity className="items-end mt-2">
              <Text className="text-blue-600 font-semibold text-sm">Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onSignInPress}
              disabled={loading || !email || !password}
              className={`mt-10 py-4 rounded-2xl items-center shadow-lg ${
                loading || !email || !password ? "bg-blue-300" : "bg-blue-600 shadow-blue-200"
              }`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center my-10">
            <View className="flex-1 h-[1px] bg-gray-100" />
            <Text className="mx-4 text-gray-400 font-medium">Or continue with</Text>
            <View className="flex-1 h-[1px] bg-gray-100" />
          </View>

          <View className="flex-row space-x-4">
            <TouchableOpacity 
              onPress={onGoogleSignInPress}
              className="flex-1 flex-row items-center justify-center bg-white border border-gray-100 py-4 rounded-2xl shadow-sm"
            >
              <Google size={20} color="#4285F4" />
              <Text className="ml-3 font-semibold text-gray-700">Google</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mt-auto pt-10">
            <Text className="text-gray-500 font-medium">Don't have an account? </Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity>
                <Text className="text-blue-600 font-bold">Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
