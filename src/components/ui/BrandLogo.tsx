import { Image, Text as NativeText, View } from "react-native"

const CHIP = require("../../../assets/images/android-icon-foreground.png")

export function BrandLogo({ size = 26 }: { size?: number }) {
  return (
    <View accessible accessibilityRole="image" accessibilityLabel="Cash-Out" className="flex-row items-center gap-0.5">
      <NativeText maxFontSizeMultiplier={1.2} className="font-brand text-foreground" style={{ fontSize: size * 0.72, letterSpacing: -0.4 }}>
        CASH-
      </NativeText>
      <Image source={CHIP} accessibilityIgnoresInvertColors style={{ width: size, height: size }} />
      <NativeText maxFontSizeMultiplier={1.2} className="font-brand text-foreground" style={{ fontSize: size * 0.72, letterSpacing: -0.4 }}>
        UT
      </NativeText>
    </View>
  )
}
