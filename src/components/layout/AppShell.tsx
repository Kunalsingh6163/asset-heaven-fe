"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type FormEvent, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { AssetIcon } from "@/src/components/common/AssetIcon";
import { CustomSnackbar } from "@/src/components/common/CustomSnackbar";
import { useAuth } from "@/src/hooks/useAuth";
import { useRequireAuth } from "@/src/hooks/useRequireAuth";
import { postJson } from "@/src/lib/apiClient";

const drawerWidth = 280;
const CHANGE_PASSWORD_PATH = "/auth/change-password";

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
    label: "News",
    href: "/dashboard/news",
    icon: "/icons/repo%20rate%20rbi.png",
  },
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
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const initials = (user?.name || user?.email || "User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const passwordsMatch = newPassword === confirmPassword;
  const passwordFormInvalid =
    !oldPassword || newPassword.length < 8 || !passwordsMatch;

  const resetPasswordForm = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleChangePasswordSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (passwordFormInvalid) return;

    setPasswordLoading(true);
    try {
      const response = await postJson<unknown>(CHANGE_PASSWORD_PATH, {
        oldPassword,
        newPassword,
      });
      const success = response.success === true;

      setSnackbar({
        open: true,
        message:
          response.message ??
          (success ? "Password changed successfully" : "Unable to change password"),
        severity: success ? "success" : "error",
      });

      if (success) {
        setPasswordDialogOpen(false);
        resetPasswordForm();
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : "Unable to change password",
        severity: "error",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

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
                    setPasswordDialogOpen(true);
                  }}
                >
                  <ListItemIcon>
                    <AssetIcon src="/icons/change%20password.png" size={22} />
                  </ListItemIcon>
                  Change password
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

        <Dialog
          open={passwordDialogOpen}
          onClose={() => {
            if (!passwordLoading) setPasswordDialogOpen(false);
          }}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>Change password</DialogTitle>
          <Box component="form" onSubmit={handleChangePasswordSubmit}>
            <DialogContent>
              <Stack spacing={2.25} sx={{ pt: 1 }}>
                <TextField
                  required
                  autoFocus
                  autoComplete="current-password"
                  label="Current password"
                  type="password"
                  value={oldPassword}
                  onChange={(event) => setOldPassword(event.target.value)}
                />
                <TextField
                  required
                  autoComplete="new-password"
                  label="New password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  slotProps={{ htmlInput: { minLength: 8 } }}
                  helperText="Use at least 8 characters."
                />
                <TextField
                  required
                  autoComplete="new-password"
                  label="Confirm new password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  error={Boolean(confirmPassword) && !passwordsMatch}
                  helperText={
                    Boolean(confirmPassword) && !passwordsMatch
                      ? "Passwords do not match."
                      : " "
                  }
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button
                color="inherit"
                disabled={passwordLoading}
                onClick={() => {
                  setPasswordDialogOpen(false);
                  resetPasswordForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={passwordLoading || passwordFormInvalid}
                startIcon={
                  passwordLoading ? (
                    <CircularProgress color="inherit" size={18} />
                  ) : null
                }
              >
                {passwordLoading ? "Changing..." : "Change password"}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>

        <CustomSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
        />

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
