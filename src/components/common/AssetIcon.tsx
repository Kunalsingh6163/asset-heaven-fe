"use client";

import Image from "next/image";
import { Box, type SxProps, type Theme } from "@mui/material";

export function AssetIcon({
  src,
  alt = "",
  size = 24,
  sx,
}: {
  src: string;
  alt?: string;
  size?: number;
  sx?: SxProps<Theme>;
}) {
  return (
    <Box
      component="span"
      sx={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        position: "relative",
        ...sx,
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${size}px`}
        style={{ objectFit: "contain" }}
      />
    </Box>
  );
}
