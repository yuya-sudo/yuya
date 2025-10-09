import { useState, useCallback, RefObject, useRef } from 'react';

interface UseTouchSwipeProps {
  scrollRef: RefObject<HTMLDivElement>;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  velocityThreshold?: number;
}

export function useTouchSwipe({
  scrollRef,
  onSwipeLeft,
  onSwipeRight,
  threshold = 75,
  velocityThreshold = 0.5
}: UseTouchSwipeProps) {
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeVelocity, setSwipeVelocity] = useState(0);
  const touchStartTime = useRef(0);
  const lastTouchX = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    lastTouchX.current = e.touches[0].clientX;
    touchStartTime.current = Date.now();
    setIsDragging(true);
    setSwipeVelocity(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return;

    const touchCurrentX = e.touches[0].clientX;
    const touchCurrentY = e.touches[0].clientY;
    const diffX = Math.abs(touchStartX - touchCurrentX);
    const diffY = Math.abs(touchStartY - touchCurrentY);

    // Calculate velocity for smoother interactions
    const deltaX = touchCurrentX - lastTouchX.current;
    const deltaTime = Date.now() - touchStartTime.current;
    const velocity = Math.abs(deltaX) / (deltaTime || 1);
    setSwipeVelocity(velocity);

    lastTouchX.current = touchCurrentX;

    // Prevent scroll if horizontal swipe is dominant
    if (diffX > diffY && diffX > 10) {
      e.preventDefault();
    }
  }, [isDragging, scrollRef, touchStartX]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;

    const touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchStartX - touchEndX;
    const swipeTime = Date.now() - touchStartTime.current;
    const velocity = Math.abs(swipeDistance) / swipeTime;

    // Trigger swipe if distance OR velocity threshold is met
    const shouldSwipe = Math.abs(swipeDistance) > threshold || velocity > velocityThreshold;

    if (shouldSwipe) {
      if (swipeDistance > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (swipeDistance < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    setIsDragging(false);
    setTouchStartX(0);
    setTouchStartY(0);
    setSwipeVelocity(0);
  }, [isDragging, touchStartX, threshold, velocityThreshold, onSwipeLeft, onSwipeRight]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isDragging,
    swipeVelocity
  };
}
