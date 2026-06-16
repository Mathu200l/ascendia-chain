import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Ascendia-Chain | AI Supply Chain Ecosystem" },
      { name: "description", content: "AI-powered, blockchain-secured supply chain management for global enterprises." },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) throw redirect({ to: "/login" });

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isStaff = !!roles?.some((r) => r.role === "admin" || r.role === "manager");
    throw redirect({ to: isStaff ? "/dashboard" : "/customer-dashboard" });
  },
  component: Landing,
});

function Landing() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
      Routing securely…
    </div>
  );
}
