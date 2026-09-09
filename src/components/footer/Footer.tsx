"use client";

import React from "react";
import {
  Box,
  Button,
  Container,
  IconButton,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LanguageIcon from "@mui/icons-material/Language";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import PublicIcon from "@mui/icons-material/Public";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import { AssetIcon } from "@/src/components/common/AssetIcon";

const APP_LOGO_SRC = "/icons/AssetHeaven%20Logo.svg";

export default function Footer() {
  const primaryBlue = "#3B82F6";
  const darkBg = "#1C2536";
  const cardBg = "#2A364B";
  const textMuted = "#94A3B8";
  const textSoft = "#CBD5E1";

  const productLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Stocks", href: "/dashboard/stocks" },
    { label: "Mutual Funds", href: "/dashboard/mutual-funds" },
    { label: "Expenses", href: "/dashboard/expenses" },
    { label: "Portfolio", href: "/dashboard/portfolio" },
    { label: "Market News", href: "/dashboard/news" },
  ];

  const supportLinks = [
    { label: "Profile", href: "/dashboard/profile" },
    { label: "Settings", href: "/dashboard/settings" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Contact", href: "#" },
  ];

  const socialIcons = [
    { icon: <PublicIcon fontSize="small" />, label: "Website" },
    { icon: <LanguageIcon fontSize="small" />, label: "Community" },
    { icon: <ArticleIcon fontSize="small" />, label: "Articles" },
    { icon: <InstagramIcon fontSize="small" />, label: "Instagram" },
    { icon: <FacebookIcon fontSize="small" />, label: "Facebook" },
    { icon: <TwitterIcon fontSize="small" />, label: "Twitter" },
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: darkBg,
        color: textMuted,
        mt: "auto",
        py: { xs: 5, md: 6 },
        px: { xs: 2, sm: 4, md: 6 },
        width: "100%",
        borderTop: "1px solid rgba(148, 163, 184, 0.14)",
      }}
    >
      <Container maxWidth="lg" disableGutters>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(5, 1fr)",
            },
            gap: { xs: 4, sm: 3, md: 4 },
            alignItems: "start",
          }}
        >
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: primaryBlue,
                fontWeight: 700,
                fontSize: "1.25rem",
                mb: 3,
              }}
            >
              <AssetIcon src={APP_LOGO_SRC} alt="Asset Heaven" size={32} />
              <Typography variant="h6" component="span" sx={{ fontWeight: 800 }}>
                Asset Heaven
              </Typography>
            </Box>

            <Stack spacing={2} sx={{ fontSize: "0.875rem" }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <LocationOnOutlinedIcon
                  sx={{ color: primaryBlue, fontSize: 20, mt: "2px" }}
                />
                <Typography variant="body2" sx={{ color: textMuted }}>
                  Trading workspace for portfolios, expenses, and live market
                  movement.
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <EmailOutlinedIcon sx={{ color: primaryBlue, fontSize: 20 }} />
                <Link
                  href="mailto:support@assetheaven.com"
                  underline="none"
                  sx={{
                    color: textMuted,
                    "&:hover": { color: "#FFF" },
                    fontSize: "0.875rem",
                  }}
                >
                  support@assetheaven.com
                </Link>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <PhoneOutlinedIcon sx={{ color: primaryBlue, fontSize: 20 }} />
                <Link
                  href="tel:+911234567890"
                  underline="none"
                  sx={{
                    color: textMuted,
                    "&:hover": { color: "#FFF" },
                    fontSize: "0.875rem",
                  }}
                >
                  +91 12345 67890
                </Link>
              </Box>
            </Stack>
          </Box>

          <Box>
            <Typography
              variant="subtitle1"
              sx={{ color: primaryBlue, fontWeight: 600, mb: 2 }}
            >
              Product
            </Typography>
            <Stack spacing={1.2}>
              {productLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  underline="none"
                  sx={{
                    color: textMuted,
                    fontSize: "0.875rem",
                    transition: "color 0.2s ease",
                    "&:hover": { color: "#FFF" },
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography
              variant="subtitle1"
              sx={{ color: primaryBlue, fontWeight: 600, mb: 2 }}
            >
              Support
            </Typography>
            <Stack spacing={1.2}>
              {supportLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  underline="none"
                  sx={{
                    color: textMuted,
                    fontSize: "0.875rem",
                    transition: "color 0.2s ease",
                    "&:hover": { color: "#FFF" },
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography
              variant="subtitle1"
              sx={{ color: primaryBlue, fontWeight: 600, mb: 2 }}
            >
              Our Social Media
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 40px)",
                gap: 1.5,
              }}
            >
              {socialIcons.map((social, index) => (
                <IconButton
                  key={index}
                  aria-label={social.label}
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: cardBg,
                    color: textMuted,
                    borderRadius: "8px",
                    transition:
                      "background-color 0.2s ease, color 0.2s ease, transform 0.2s ease",
                    "&:hover": {
                      backgroundColor: primaryBlue,
                      color: "#FFF",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography
              variant="subtitle1"
              sx={{ color: primaryBlue, fontWeight: 600, mb: 2 }}
            >
              Join a Newsletter
            </Typography>
            <Box
              component="form"
              onSubmit={(e) => e.preventDefault()}
              sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
            >
              <Typography
                variant="caption"
                sx={{ color: textSoft, fontWeight: 500 }}
              >
                Your Email
              </Typography>
              <TextField
                placeholder="Enter Your Email"
                variant="outlined"
                size="small"
                fullWidth
                sx={{
                  backgroundColor: "rgba(42, 54, 75, 0.6)",
                  borderRadius: "6px",
                  "& .MuiOutlinedInput-root": {
                    color: "#FFF",
                    fontSize: "0.875rem",
                    "& fieldset": {
                      borderColor: "#475569",
                    },
                    "&:hover fieldset": {
                      borderColor: primaryBlue,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: primaryBlue,
                    },
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "#64748B",
                    opacity: 1,
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: primaryBlue,
                  color: "#FFF",
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "8px",
                  py: 1,
                  px: 4,
                  alignSelf: "flex-start",
                  boxShadow: "none",
                  transition: "background-color 0.2s ease, transform 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#2563EB",
                    boxShadow: "none",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Send
              </Button>
            </Box>

            <Typography
              variant="caption"
              sx={{ display: "block", mt: 4, color: textMuted }}
            >
              Copyright 2026 Asset Heaven
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
