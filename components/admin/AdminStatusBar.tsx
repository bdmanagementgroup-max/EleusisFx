"use client";

import { useEffect, useState } from "react";

export default function AdminStatusBar() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  const date = now
    ? `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}`
    : "----.--.--";

  const time = now
    ? `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    : "--:--:--";

  const day = now
    ? ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][now.getDay()]
    : "---";

  return (
    <div style={{
      position: "fixed",
      top: 36,
      right: 0,
      fontFamily: "monospace",
      background: "#04050a",
      border: "1px solid rgba(34,197,94,0.12)",
      borderTop: "none",
      borderRight: "none",
      padding: "10px 16px",
      textAlign: "right",
      zIndex: 25,
      lineHeight: 1,
    }}>
      <div style={{ fontSize: 9, color: "rgba(34,197,94,0.3)", letterSpacing: 1, marginBottom: 7 }}>
        root@eleusis:~$
      </div>
      <div style={{ fontSize: 11, color: "rgba(34,197,94,0.55)", letterSpacing: 1.5, marginBottom: 6 }}>
        {date} &nbsp;{day}
      </div>
      <div style={{
        fontSize: 15,
        fontWeight: 700,
        color: "#22c55e",
        letterSpacing: 3,
        textShadow: "0 0 10px rgba(34,197,94,0.45)",
      }}>
        {time}
      </div>
    </div>
  );
}
