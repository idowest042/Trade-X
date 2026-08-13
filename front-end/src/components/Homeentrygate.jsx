import { useEffect, useState } from "react";
import LoadingScreen from "./Loadingscreen";
import SecurityWarningModal from "./Securitywarningmodal";

/**
 * Drop this INSIDE your Home page component only (not App.jsx, not other routes).
 * On first visit in a browser session it shows:
 *   1. TradeX loading animation
 *   2. Security warning modal (dismiss with OK)
 * On subsequent visits within the same session (e.g. navigating home again
 * via the logo) it stays out of the way.
 *
 * Uses sessionStorage so a full refresh of the home page will show it again,
 * but clicking around the site and back to "/" won't re-trigger it.
 * Swap sessionStorage -> localStorage if you want "once ever per device" instead.
 */
export default function HomeEntryGate() {
  const [stage, setStage] = useState("idle"); // idle | loading | warning | done

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem("tradex_entry_seen");
    if (!alreadySeen) {
      setStage("loading");
    }
  }, []);

  const handleLoadingComplete = () => {
    setStage("warning");
  };

  const handleWarningClose = () => {
    sessionStorage.setItem("tradex_entry_seen", "true");
    setStage("done");
  };

  if (stage === "loading") {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  if (stage === "warning") {
    return <SecurityWarningModal onClose={handleWarningClose} />;
  }

  return null;
}