import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@tanstack/react-start/server";

type ManagerSession = { unlocked?: boolean; ts?: number };

const sessionConfig = {
  password: process.env.MANAGER_SESSION_SECRET!,
  name: "atp-manager",
  maxAge: 60 * 60 * 8,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
  },
};

export const Route = createFileRoute("/api/public/manager/session")({
  server: {
    handlers: {
      GET: async () => {
        const session = await useSession<ManagerSession>(sessionConfig);
        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );
        const { data } = await supabaseAdmin
          .from("manager_credential")
          .select("id")
          .eq("id", 1)
          .maybeSingle();
        return Response.json({
          unlocked: !!session.data.unlocked,
          initialized: !!data,
        });
      },
      POST: async () => {
        const session = await useSession<ManagerSession>(sessionConfig);
        await session.clear();
        return Response.json({ ok: true });
      },
    },
  },
});
