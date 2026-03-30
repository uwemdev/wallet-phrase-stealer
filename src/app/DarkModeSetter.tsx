"use client";
import { useEffect } from "react";

export default function DarkModeSetter() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);
  return null;
}
