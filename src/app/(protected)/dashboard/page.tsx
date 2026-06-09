import { auth } from "@/auth";
import MissionControlDashboard from "@/components/mission-control-dashboard";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <MissionControlDashboard user={session?.user || null} />
  );
}
