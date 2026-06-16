import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/**
 * Gate for admin/staff-only routes. Redirects:
 *  - unauthenticated users -> /admin-login
 *  - authenticated non-staff users (customers) -> /customer-dashboard
 */
export async function requireStaff() {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw redirect({ to: "/admin-login" });

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const isStaff = !!roles?.some((r) => r.role === "admin" || r.role === "manager");
  if (!isStaff) throw redirect({ to: "/customer-dashboard" });
}
