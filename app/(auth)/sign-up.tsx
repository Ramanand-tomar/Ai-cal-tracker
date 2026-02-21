import AppLoader from "@/components/ui/AppLoader";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUp() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");

    try {
      await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });

      // Send verification email
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace("/");
      } else {
        console.log(JSON.stringify(completeSignUp, null, 2));
        setError("Verification failed. Please check the code.");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || "Failed to verify email");
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <View className="flex-1 bg-white px-8 pt-10">
          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-primary-50 rounded-3xl items-center justify-center mb-6">
              <Mail size={40} color="#298f50" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">Verify Email</Text>
            <Text className="text-gray-500 text-center">
              We've sent a verification code to {email}
            </Text>
          </View>

          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">Verification Code</Text>
            <TextInput
              value={code}
              className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-center text-2xl font-bold tracking-widest"
              placeholder="000000"
              placeholderTextColor="#9CA3AF"
              onChangeText={setCode}
              keyboardType="number-pad"
            />
            
            <TouchableOpacity
              onPress={onPressVerify}
              disabled={loading || code.length < 6}
              className={`mt-10 py-4 rounded-2xl items-center shadow-lg ${
                loading || code.length < 6 ? "bg-primary-300" : "bg-primary shadow-primary-200"
              }`}
            >
              {loading ? (
                <AppLoader size={30} />
              ) : (
                <Text className="text-white font-bold text-lg">Verify & Register</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-white"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View className="flex-1 px-8 pt-10 pb-10">
            <View className="items-center mb-10">
              <Text className="text-3xl font-bold text-gray-900 mb-2">Create Account</Text>
              <Text className="text-gray-500 text-center">
                Join us to track your calories and stay healthy
              </Text>
            </View>

            {error ? (
              <View className="bg-red-50 p-4 rounded-2xl mb-6">
                <Text className="text-red-600 text-sm text-center font-medium">{error}</Text>
              </View>
            ) : null}

            <View className="space-y-4">
              <View className="flex-row space-x-4">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">First Name</Text>
                  <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4">
                    <User size={20} color="#9CA3AF" />
                    <TextInput
                      placeholder="John"
                      placeholderTextColor="#9CA3AF"
                      className="flex-1 ml-3 text-gray-900 font-medium"
                      value={firstName}
                      onChangeText={setFirstName}
                    />
                  </View>
                </View>
              </View>

              <View className="mt-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">Email Address</Text>
                <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4">
                  <Mail size={20} color="#9CA3AF" />
                  <TextInput
                    placeholder="name@example.com"
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
                    placeholder="Create a password"
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

              <TouchableOpacity
                onPress={onSignUpPress}
                disabled={loading || !email || !password || !firstName}
                className={`mt-10 py-4 rounded-2xl items-center shadow-lg ${
                  loading || !email || !password || !firstName ? "bg-primary-300" : "bg-primary shadow-primary-200"
                }`}
              >
                {loading ? (
                  <AppLoader size={30} />
                ) : (
                  <View className="flex-row items-center">
                    <Text className="text-white font-bold text-lg mr-2">Sign Up</Text>
                    <ArrowRight size={20} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center mt-auto pt-10 pb-4">
              <Text className="text-gray-500 font-medium">Already have an account? </Text>
              <Link href="/(auth)/sign-in" asChild>
                <TouchableOpacity>
                  <Text className="text-primary-600 font-bold">Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
