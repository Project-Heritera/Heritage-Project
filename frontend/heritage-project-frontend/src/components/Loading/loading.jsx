import React from "react";
import "./loading.css"; // we'll add styles for animations

const Loading = ({ size, fullscreen }) => {
  // size: 'small', 'medium', 'large'
  // fullscreen: boolean

  const variant = (() => {
    if (fullscreen) return "fullscreen";
    if (size === "small") return "circular";
    if (size === "medium") return "horizontal";
    return "circular";
  })();

  return (
    <div className={`loading-wrapper ${variant}`}>
      {variant === "fullscreen" && <div className="overlay" />}
      <div className={`loader ${variant}`} />
    </div>
  );
};

export default Loading;
