"use client";

import { useCallback, useEffect, useState } from "react";

const TOUR_STORAGE_PREFIX = "algoviz-tour-dismissed-";

export function useTour(pageId: string) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(`${TOUR_STORAGE_PREFIX}${pageId}`);
    if (!dismissed) {
      const timer = setTimeout(() => setIsActive(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [pageId]);

  const next = useCallback(() => {
    setCurrentStep((prev) => prev + 1);
  }, []);

  const skip = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem(`${TOUR_STORAGE_PREFIX}${pageId}`, "true");
  }, [pageId]);

  const finish = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem(`${TOUR_STORAGE_PREFIX}${pageId}`, "true");
  }, [pageId]);

  const restart = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
    localStorage.removeItem(`${TOUR_STORAGE_PREFIX}${pageId}`);
  }, [pageId]);

  return {
    currentStep,
    isActive,
    next,
    skip,
    finish,
    restart,
  };
}
