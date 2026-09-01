import { AppShell } from "@/src/components/layout/AppShell";

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return <AppShell>{children}</AppShell>;
}
