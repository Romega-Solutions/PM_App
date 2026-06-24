/**
 * useSwipeGesture Hook
 *
 * SOLID Principle: Single Responsibility
 * - Only handles swipe gesture detection and animation
 * - Delegates actions to callbacks (Open/Closed Principle)
 *
 * DRY: Reusable gesture logic across any swipeable card
 * KISS: Simple API - just provide callbacks
 */

import { useEffect, useRef } from "react";
import { Animated, Dimensions, PanResponder } from "react-native";

const { width, height } = Dimensions.get("window");

export interface SwipeGestureCallbacks {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
  onShowDetails?: () => void;
}

export interface SwipeGestureReturn {
  pan: Animated.ValueXY;
  swipeUpValue: Animated.Value;
  rotate: Animated.AnimatedInterpolation<number>;
  panResponder: any;
  resetPosition: () => void;
  animateSwipe: (direction: "left" | "right" | "up") => void;
}

/**
 * Hook for handling card swipe gestures
 *
 * @param callbacks - Swipe action callbacks
 * @returns Gesture handlers and animation values
 */
export function useSwipeGesture(
  callbacks: SwipeGestureCallbacks,
): SwipeGestureReturn {
  const callbacksRef = useRef(callbacks);

  // Animation values
  const pan = useRef(new Animated.ValueXY()).current;
  const swipeUpValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  // Rotation based on horizontal drag
  const rotate = pan.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });

  /**
   * Reset card to center position
   */
  const resetPosition = () => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();

    Animated.spring(swipeUpValue, {
      toValue: 0,
      useNativeDriver: false,
    }).start();
  };

  /**
   * Animate card swipe in specific direction
   */
  const animateSwipe = (direction: "left" | "right" | "up") => {
    let toValue: { x: number; y: number };

    switch (direction) {
      case "left":
        toValue = { x: -width * 1.5, y: 0 };
        break;
      case "right":
        toValue = { x: width * 1.5, y: 0 };
        break;
      case "up":
        toValue = { x: 0, y: -height };
        break;
    }

    Animated.spring(pan, {
      toValue,
      useNativeDriver: false,
    }).start(() => {
      // Reset position after animation
      pan.setValue({ x: 0, y: 0 });
    });
  };

  // Gesture handler
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderMove: (_, gesture) => {
        // Prioritize vertical swipe (up for super like)
        if (gesture.dy < -10 && Math.abs(gesture.dy) > Math.abs(gesture.dx)) {
          swipeUpValue.setValue(gesture.dy);
        }
        // Horizontal swipe (left/right)
        else {
          pan.setValue({ x: gesture.dx, y: gesture.dy });
        }
      },

      onPanResponderRelease: (_, gesture) => {
        // Swipe left (Pass)
        if (gesture.dx < -120) {
          animateSwipe("left");
          callbacksRef.current.onSwipeLeft();
        }
        // Swipe right (Like)
        else if (gesture.dx > 120) {
          animateSwipe("right");
          callbacksRef.current.onSwipeRight();
        }
        // Swipe up (Super Like)
        else if (gesture.dy < -100) {
          animateSwipe("up");
          callbacksRef.current.onSwipeUp();
        }
        // Tap or small swipe up (Show Details)
        else if (gesture.dy < -20 && callbacksRef.current.onShowDetails) {
          callbacksRef.current.onShowDetails();
          resetPosition();
        }
        // Not enough swipe - reset
        else {
          resetPosition();
        }
      },
    }),
  ).current;

  return {
    pan,
    swipeUpValue,
    rotate,
    panResponder,
    resetPosition,
    animateSwipe,
  };
}
