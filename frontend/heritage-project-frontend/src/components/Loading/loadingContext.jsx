// src/context/LoadingContext.jsx
import React, { useState } from "react";
import Loading from "./loading";
import { setGlobalLoadingSetter } from "./loadingUtils";

export const LoadingProvider = ({ children }) => {
  const [loadingCount, setLoadingCount] = useState(0);

  // Track multiple concurrent requests
  const startLoading = () => setLoadingCount((c) => c + 1);
  const stopLoading = () => setLoadingCount((c) => Math.max(0, c - 1));

  // Save setter globally so axios interceptor can access it
  setGlobalLoadingSetter((active) => {
    if (active) startLoading();
    else stopLoading();
  });

  return (
    <LoadingContext.Provider value={{ startLoading, stopLoading }}>
      {loadingCount > 0 && <Loading fullscreen />}
      {children}
    </LoadingContext.Provider>
  );
};
