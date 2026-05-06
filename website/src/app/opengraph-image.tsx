import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Linear Screenshot — Capture and Create Linear Tickets Instantly";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 1024 1024"
            fill="none"
          >
            <path
              fill="#5E6AD2"
              d="M640 832H64V640a128 128 0 1 0 0-256V192h576v160h64V192h256v192a128 128 0 1 0 0 256v192H704V672h-64v160zm0-416v192h64V416h-64z"
            />
          </svg>
          <span
            style={{
              fontSize: "42px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            Linear Screenshot
          </span>
        </div>

        <div
          style={{
            fontSize: "56px",
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.2,
            letterSpacing: "-0.03em",
            maxWidth: "900px",
          }}
        >
          Screenshots to{" "}
          <span style={{ color: "#5E6AD2" }}>Linear tickets</span>{" "}
          in seconds
        </div>

        <div
          style={{
            fontSize: "24px",
            color: "#a1a1aa",
            textAlign: "center",
            marginTop: "24px",
            maxWidth: "700px",
            lineHeight: 1.5,
          }}
        >
          A tiny macOS menu bar app that captures any region of your screen
          and creates Linear issues without leaving your flow.
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "48px",
            padding: "12px 24px",
            borderRadius: "8px",
            background: "rgba(94, 106, 210, 0.15)",
            border: "1px solid rgba(94, 106, 210, 0.3)",
          }}
        >
          <span style={{ fontSize: "18px", color: "#a1a1aa" }}>
            Press
          </span>
          <span style={{ fontSize: "18px", color: "#ffffff", fontWeight: 600 }}>
            ⌘ + ⇧ + L
          </span>
          <span style={{ fontSize: "18px", color: "#a1a1aa" }}>
            to capture
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
