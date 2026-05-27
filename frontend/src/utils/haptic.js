// Haptic feedback — uses Vibration API on mobile, silent on desktop
const vibe = (pattern) => {
  try { navigator.vibrate?.(pattern) } catch {}
}

export const haptic = {
  light:   () => vibe(10),
  medium:  () => vibe(25),
  heavy:   () => vibe(50),
  success: () => vibe([10, 40, 10]),
  error:   () => vibe([60, 40, 60]),
  match:   () => vibe([30, 60, 30, 60, 120]),   // 🎉 big match celebration
  like:    () => vibe([15, 20, 30]),
  pass:    () => vibe([40]),
  tap:     () => vibe(8),
  swipe:   () => vibe(12),
}
