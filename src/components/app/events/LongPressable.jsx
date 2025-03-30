import React, { useRef, useState } from "react";

const LongPressable = ({ children, onLongPress, longPressDuration = 500 }) => {
  const timeoutRef = useRef(null);
  const [isPressing, setIsPressing] = useState(false);

  const startLongPress = (event) => {
    setIsPressing(true);
    timeoutRef.current = setTimeout(() => {
      if (onLongPress) {
        onLongPress(event);
      }
      setIsPressing(false);
    }, longPressDuration);
  };

  const stopLongPress = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setIsPressing(false);
    }
  };

  return (
    <div
      onMouseDown={startLongPress}
      onMouseUp={stopLongPress}
      onMouseLeave={stopLongPress}
      onTouchStart={startLongPress}
      onTouchEnd={stopLongPress}
      onTouchCancel={stopLongPress}
      style={{
        userSelect: "none",
        background: isPressing ? "#f0f0f0" : "transparent",
        display: "inline-block",
      }}
    >
      {children}
    </div>
  );
};

export default LongPressable;