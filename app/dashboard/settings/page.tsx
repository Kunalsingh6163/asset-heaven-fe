import { SectionPage } from "@/src/components/dashboard/SectionPage";

export default function SettingsRoute() {
  return (
    <SectionPage
      title="User Settings"
      subtitle="Manage profile preferences, security choices, notifications, and web application defaults."
      cards={[
        {
          title: "Profile settings",
          description: "Update name, phone number, and profile picture using the protected user profile endpoint.",
          action: "Edit profile",
          icon: "/icons/user%20account.png",
        },
        {
          title: "Security",
          description: "Manage JWT sessions, logout from devices, and account access controls.",
          action: "Review security",
          icon: "/icons/Bank%20Level%20Security.png",
        },
        {
          title: "Preferences",
          description: "Set default region, currency display, dashboard layout, and notification choices.",
          action: "Open preferences",
          icon: "/icons/Explore.png",
        },
      ]}
    />
  );
}
