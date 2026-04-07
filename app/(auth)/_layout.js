import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // iOS'ta sağdan sola kayma — native his
        animation: "slide_from_right",
        // Arka plan karanlık kalsın geçiş sırasında
        contentStyle: { backgroundColor: "#0f0f0f" },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen
        name="register"
        options={{
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="reset-password"
        options={{
          // Şifre sıfırlama aşağıdan gelsin — modal hissi
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}
