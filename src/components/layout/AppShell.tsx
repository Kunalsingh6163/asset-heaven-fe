"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { AssetIcon } from "@/src/components/common/AssetIcon";
import { useAuth } from "@/src/hooks/useAuth";
import { useRequireAuth } from "@/src/hooks/useRequireAuth";

const drawerWidth = 280;

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "/icons/Explore.png" },
  { label: "Stocks", href: "/dashboard/stocks", icon: "/icons/Stocks.png" },
  {
    label: "Mutual Funds",
    href: "/dashboard/mutual-funds",
    icon: "/icons/Mutual%20Funds.png",
  },
  { label: "Expenses", href: "/dashboard/expenses", icon: "/icons/Expenses.png" },
  { label: "Portfolio", href: "/dashboard/portfolio", icon: "/icons/portfolio-new.png" },
  {
    label: "User Settings",
    href: "/dashboard/settings",
    icon: "/icons/user%20account.png",
  },
];

const footerLinks = [
  { label: "About", href: "/dashboard" },
  { label: "Support", href: "/dashboard/settings" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms", href: "#" },
];

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com", icon: FacebookRoundedIcon },
  { label: "Instagram", href: "https://instagram.com", icon: InstagramIcon },
  { label: "LinkedIn", href: "https://linkedin.com", icon: LinkedInIcon },
  { label: "YouTube", href: "https://youtube.com", icon: YouTubeIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { ready, user } = useRequireAuth();
  const { signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const initials = (user?.name || user?.email || "User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!ready) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#ffffff",
      }}
    >
      <Stack spacing={1.5} sx={{ p: 3 }}>
        <Avatar
          sx={{
            width: 52,
            height: 52,
            bgcolor: "primary.light",
            boxShadow: "0 14px 28px rgba(25, 118, 210, 0.22)",
          }}
        >
          <AssetIcon src="/icons/Cash.png" size={34} />
        </Avatar>
        <Box>
          <Typography variant="h6">Asset Heaven</Typography>
          <Typography color="text.secondary" sx={{ fontSize: 13 }}>
            Trading workspace
          </Typography>
        </Box>
      </Stack>

      <Divider />

      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={active}
              onClick={() => setMobileOpen(false)}
              sx={{
                mb: 0.75,
                borderRadius: 3,
                color: active ? "primary.main" : "text.secondary",
                "&.Mui-selected": {
                  bgcolor: "primary.light",
                  color: "primary.dark",
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 42 }}>
                <AssetIcon
                  src={item.icon}
                  size={30}
                  sx={{
                    opacity: active ? 1 : 0.78,
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{ primary: { sx: { fontWeight: 800 } } }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ p: 2.5 }}>
        <Typography color="text.secondary" sx={{ fontSize: 12 }}>
          Secure JWT session
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", lg: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            border: 0,
            boxShadow: "8px 0 32px rgba(25, 90, 150, 0.08)",
          },
        }}
      >
        {drawer}
      </Drawer>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            border: 0,
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box sx={{ pl: { lg: `${drawerWidth}px` }, minHeight: "100vh" }}>
        <Box
          component="header"
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 9,
            bgcolor: "rgba(245, 251, 255, 0.88)",
            backdropFilter: "blur(18px)",
            borderBottom: "1px solid rgba(25, 118, 210, 0.08)",
          }}
        >
          <Container
            maxWidth="xl"
            sx={{
              py: 1.75,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <IconButton
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                sx={{ display: { lg: "none" } }}
              >
                <MenuRoundedIcon />
              </IconButton>
              <Box>
                <Typography variant="h6">
                  {navItems.find((item) => item.href === pathname)?.label ??
                    "Asset Heaven"}
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                  Manage markets, holdings, expenses, and account settings
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Typography
                sx={{ display: { xs: "none", sm: "block" }, fontWeight: 800 }}
              >
                {user?.name ?? user?.email}
              </Typography>
              <Tooltip title="Account menu">
                <IconButton onClick={(event) => setMenuAnchor(event.currentTarget)}>
                  <Avatar src={user?.profilePicture} sx={{ bgcolor: "secondary.main" }}>
                    {initials}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
              >
                <MenuItem
                  component={Link}
                  href="/dashboard/profile"
                  onClick={() => setMenuAnchor(null)}
                >
                  <ListItemIcon>
                    <AssetIcon src="/icons/user%20account.png" size={22} />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setMenuAnchor(null);
                    void signOut();
                  }}
                >
                  <ListItemIcon>
                    <AssetIcon
                      src="/icons/backward.png"
                      size={22}
                      sx={{ transform: "rotate(180deg)" }}
                    />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Stack>
          </Container>
        </Box>

        <Box component="main" sx={{ minHeight: "calc(100vh - 210px)" }}>
          {children}
        </Box>

        <Box
          component="footer"
          sx={{
            mt: 6,
            py: 3,
            borderTop: "1px solid rgba(25, 118, 210, 0.08)",
            bgcolor: "#ffffff",
          }}
        >
          <Container
            maxWidth="xl"
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
              {footerLinks.map((link) => (
                <Button
                  key={link.label}
                  component={Link}
                  href={link.href}
                  size="small"
                  color="inherit"
                >
                  {link.label}
                </Button>
              ))}
            </Stack>
            <Stack direction="row" spacing={1}>
              {socialLinks.map((social, index) => {
                const Icon = social.icon;

                return (
                  <IconButton
                    key={social.label}
                    aria-label={social.label}
                    color={index % 2 === 0 ? "primary" : "secondary"}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Icon />
                  </IconButton>
                );
              })}
            </Stack>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
