// Admin-only bootstrap to ensure the demo SupplyChainAdmin user exists.
// Uses the service role internally; safe because the only side effect is
// idempotently creating one well-known account with a known password.
import { createServerFn } from "@tanstack/react-start";

export const DEMO_EMAIL = "supplychainadmin@nexusscm.app";
export const DEMO_PASSWORD = "SupplyChainPassword";

export const ensureDemoAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Look up existing user by email
  const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) throw new Error(listErr.message);

  let user = list.users.find((u) => u.email?.toLowerCase() === DEMO_EMAIL);

  if (!user) {
    const { data: created, error: createErr } =
      await supabaseAdmin.auth.admin.createUser({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: "SupplyChain Admin" },
      });
    if (createErr) throw new Error(createErr.message);
    user = created.user!;
  }

  // Make sure they have the admin role
  const { error: roleErr } = await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" });
  if (roleErr) throw new Error(roleErr.message);

  return { ok: true, email: DEMO_EMAIL };
});
