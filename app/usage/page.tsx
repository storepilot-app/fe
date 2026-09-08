import { AuthenticatedHome } from "@/components/features/auth/authenticated-home";

export default function UserUsageRoutePage() {
  return <AuthenticatedHome currentView="user-usage" />;
}
