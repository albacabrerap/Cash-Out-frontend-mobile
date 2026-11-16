import { BrandLogo } from "@/components/ui/BrandLogo"
import { Button } from "@/components/ui/Button"
import { SilkBackground } from "@/components/welcome/SilkBackground"

import { router, useFocusEffect } from "expo-router"
import { ShieldCheck } from "lucide-react-native"
import { useCallback, useState } from "react"
import { ScrollView, Text, View, useWindowDimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function WelcomeScreen() {
  const { height } = useWindowDimensions()
  const compact = height < 720
  const [focused, setFocused] = useState(true)

  useFocusEffect(
    useCallback(() => {
      setFocused(true)
      return () => setFocused(false)
    }, []),
  )

  return (
    <View className="flex-1 bg-neutral-950">
      <SilkBackground active={focused} />
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerClassName="w-full max-w-[480px] flex-grow self-center px-6" showsVerticalScrollIndicator={false}>
          <View className="pt-3">
            <BrandLogo />
          </View>

          <View className="flex-1 justify-center py-6">
            <View className="gap-3 pb-2">
              <Text
                maxFontSizeMultiplier={1.15}
                className={`font-bold text-white ${compact ? "text-[36px] leading-[38px]" : "text-[44px] leading-[46px]"}`}
              >
                Ahorra, planifica e invierte{" "}
                <Text className="italic text-neutral-300">sin arriesgar tu dinero</Text>
              </Text>
              <Text className="text-base leading-6 text-neutral-400">
                Cumple tus metas de ahorro y gana fichas para practicar con precios reales del mercado.
              </Text>
              <View className="flex-row items-center gap-2">
                <ShieldCheck size={16} color="#a3a3a3" />
                <Text className="flex-1 text-[13px] text-neutral-400">
                  Inviertes con fichas: tu dinero real nunca está en juego.
                </Text>
              </View>
            </View>

            <View className="gap-2.5 pb-4 pt-4">
              <Button label="Crear cuenta gratis" onPress={() => router.push("/register")} />
              <Button label="Ya tengo cuenta" variant="outline" onPress={() => router.push("/login")} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}