import React from 'react';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function AnimatedMount({ children, delay = 0, slide = false, duration = 300, style }) {
  let entering = slide ? FadeInDown.duration(duration) : FadeIn.duration(duration);
  if (delay > 0) {
    entering = entering.delay(delay);
  }

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}
