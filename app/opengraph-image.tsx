import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "Algoviz -- Interactive Algorithm Visualizer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: "#09090b",
        fontFamily: "monospace",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: "#fafafa",
            letterSpacing: "-2px",
          }}
        >
          ALGOVIZ
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#22c55e",
            letterSpacing: "4px",
          }}
        >
          100+ algorithms. Visualized.
        </div>
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "16px",
          }}
        >
          {["Sorting", "Graph", "DP", "AI/ML", "Pathfinding", "Games"].map(
            (cat) => (
              <div
                key={cat}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid #27272a",
                  color: "#a1a1aa",
                  fontSize: 18,
                }}
              >
                {cat}
              </div>
            ),
          )}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 40,
          fontSize: 16,
          color: "#52525b",
        }}
      >
        algos.sandeepswain.dev
      </div>
    </div>,
    { ...size },
  );
}
