import React from "react";
import { ImageResponse } from "og_edge";

export default function handler(req: Request) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 128,
          background: "lavender",
        }}
      >
        Hello GH Action!
      </div>
    )
  );
}
