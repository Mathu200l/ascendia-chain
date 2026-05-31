import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { SIDEBAR } from "@/lib/modules.config";
import * as Icons from "lucide-react";
import { LogOut, Menu, X, Search, Bell as BellIcon } from "lucide-react";

function Icon({ name, className }: { name: string; className?: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Cmp = (Icons as any)[name] || Icons.Circle;
  return <Cmp className={className} />;
}

export function DashboardLayout({ children, title, subtitle }: { children: ReactNode; title?: string; subtitle?: string }) {
  const navigate = useNavigate();
  const [user, setUser] = useState("Admin");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "Admin");
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/login" });
  };

  const groups = useMemo(() => {
    const filtered = query
      ? SIDEBAR.filter((n) => n.label.toLowerCase().includes(query.toLowerCase()))
      : SIDEBAR;
    const map = new Map<string, typeof SIDEBAR>();
    filtered.forEach((n) => {
      if (!map.has(n.group)) map.set(n.group, []);
      map.get(n.group)!.push(n);
    });
    return Array.from(map.entries());
  }, [query]);

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 transform flex-col border-r border-border bg-gradient-surface transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
          <Link to="/dashboard">
            <Logo size="sm" />
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="border-b border-border p-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface/60 px-2.5 py-1.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find module…"
              className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/60"
            />
          </div>
        </div>
        <nav className="flex-1 space-y-4 overflow-y-auto p-3">
          {groups.map(([group, items]) => (
            <div key={group}>
              <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                {group}
              </div>
              <div className="space-y-0.5">
                {items.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    activeOptions={{ exact: true }}
                    activeProps={{
                      className:
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium bg-primary/15 text-primary border border-primary/30",
                    }}
                    inactiveProps={{
                      className:
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-surface-elevated hover:text-foreground border border-transparent",
                    }}
                  >
                    <Icon name={n.icon} className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{n.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="shrink-0 p-3">
          <div className="glass rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">
                {(user[0] || "A").toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{user}</div>
                <div className="text-xs text-muted-foreground">Super Admin</div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-elevated hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-8">
          <button onClick={() => setOpen(true)} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex flex-1 flex-col min-w-0">
            {title && <h1 className="truncate font-display text-base font-semibold md:text-lg">{title}</h1>}
            {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> Live
          </div>
          <button className="relative rounded-lg border border-border bg-surface/60 p-2 hover:bg-surface-elevated">
            <BellIcon className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
          </button>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
