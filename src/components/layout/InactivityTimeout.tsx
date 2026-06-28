"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes inactivity limit
const KEEPALIVE_INTERVAL_MS = 2 * 60 * 1000; // Keep-alive ping every 2 minutes
const WARNING_MS = 30 * 1000; // 30 seconds warning duration

export function InactivityTimeout() {
  const lastActiveRef = useRef<number>(Date.now());
  const keepAliveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef<boolean>(false);

  useEffect(() => {
    // 1. Intercept URL search params for unauthorized redirects
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const err = params.get("error");
      if (err === "unauthorized") {
        toast.error("Access Denied: You do not have permission to access that module.", {
          id: "unauthorized-warning",
          duration: 5000,
        });

        // Clean the URL bar so the query param doesn't persist on page reloads
        const url = new URL(window.location.href);
        url.searchParams.delete("error");
        window.history.replaceState({}, document.title, url.toString());
      }
    }

    // 2. Activity listeners to reset the timer
    const handleActivity = () => {
      lastActiveRef.current = Date.now();
      if (warningShownRef.current) {
        warningShownRef.current = false;
        toast.dismiss("session-timeout-warning");
        toast.success("Session extended.", {
          id: "session-extended-success",
          duration: 2000,
        });
      }
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // 3. Periodic inactivity check (runs every 1s when near expiration, 5s otherwise)
    const checkInactivity = () => {
      const inactiveTime = Date.now() - lastActiveRef.current;
      const remainingTime = TIMEOUT_MS - inactiveTime;

      if (remainingTime <= 0) {
        toast.dismiss("session-timeout-warning");
        signOut({ callbackUrl: "/login?reason=timeout" });
        return;
      }

      // Show warning toast if remaining time is <= 30 seconds
      if (remainingTime <= WARNING_MS && !warningShownRef.current) {
        warningShownRef.current = true;
        toast.warning(
          "Your session is about to expire due to inactivity. Move the mouse or press a key to extend.",
          {
            id: "session-timeout-warning",
            duration: WARNING_MS,
          }
        );
      }

      const nextCheckInterval = remainingTime <= WARNING_MS ? 1000 : 5000;
      timeoutTimerRef.current = setTimeout(checkInactivity, nextCheckInterval);
    };

    // Initial check timer trigger
    timeoutTimerRef.current = setTimeout(checkInactivity, 5000);

    // 4. Send background keep-alive ping to extend NextAuth server session
    const keepAlive = async () => {
      const inactiveTime = Date.now() - lastActiveRef.current;
      // Only ping if the user had some activity within the keep-alive interval
      if (inactiveTime < KEEPALIVE_INTERVAL_MS) {
        try {
          await fetch("/api/auth/session");
        } catch (err) {
          console.error("Failed to send session keep-alive ping:", err);
        }
      }
    };

    keepAliveTimerRef.current = setInterval(keepAlive, KEEPALIVE_INTERVAL_MS);

    // Cleanup listeners and timers
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
      if (keepAliveTimerRef.current) clearInterval(keepAliveTimerRef.current);
      toast.dismiss("session-timeout-warning");
    };
  }, []);

  return null;
}
