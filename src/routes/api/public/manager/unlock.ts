import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@tanstack/react-start/server";
import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

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

function hashPw(password: string, salt: string, iterations: number) {
  return pbkdf2Sync(password, salt, iterations, 32, "sha256").toString("hex");
}

export const Route = createFileRoute("/api/public/manager/unlock")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { password?: unknown; mode?: unknown; current?: unknown };
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
        }
        const password = typeof body.password === "string" ? body.password : "";
        const mode = body.mode === "setup" || body.mode === "change" ? body.mode : "unlock";
        if (!password || password.length < 4 || password.length > 200) {
          return Response.json(
            { ok: false, error: "Password must be 4-200 characters." },
            { status: 400 },
          );
        }

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );
        const { data: existing } = await supabaseAdmin
          .from("manager_credential")
          .select("password_hash, salt, iterations")
          .eq("id", 1)
          .maybeSingle();

        if (mode === "setup") {
          if (existing) {
            return Response.json(
              { ok: false, error: "Password is already set. Use change instead." },
              { status: 409 },
            );
          }
          const salt = randomBytes(16).toString("hex");
          const iterations = 120000;
          const password_hash = hashPw(password, salt, iterations);
          const { error } = await supabaseAdmin.from("manager_credential").insert({
            id: 1,
            password_hash,
            salt,
            iterations,
          });
          if (error) {
            return Response.json({ ok: false, error: "Setup failed" }, { status: 500 });
          }
          const session = await useSession<ManagerSession>(sessionConfig);
          await session.update({ unlocked: true, ts: Date.now() });
          return Response.json({ ok: true });
        }

        if (mode === "change") {
          if (!existing) {
            return Response.json(
              { ok: false, error: "No password set yet." },
              { status: 400 },
            );
          }
          const current = typeof body.current === "string" ? body.current : "";
          const expected = Buffer.from(existing.password_hash, "hex");
          const provided = Buffer.from(
            hashPw(current, existing.salt, existing.iterations),
            "hex",
          );
          if (
            expected.length !== provided.length ||
            !timingSafeEqual(expected, provided)
          ) {
            return Response.json(
              { ok: false, error: "Current password is incorrect." },
              { status: 401 },
            );
          }
          const salt = randomBytes(16).toString("hex");
          const iterations = 120000;
          const password_hash = hashPw(password, salt, iterations);
          const { error } = await supabaseAdmin
            .from("manager_credential")
            .update({ password_hash, salt, iterations, updated_at: new Date().toISOString() })
            .eq("id", 1);
          if (error) {
            return Response.json({ ok: false, error: "Update failed" }, { status: 500 });
          }
          const session = await useSession<ManagerSession>(sessionConfig);
          await session.update({ unlocked: true, ts: Date.now() });
          return Response.json({ ok: true });
        }

        // unlock
        if (!existing) {
          return Response.json(
            { ok: false, error: "No password set yet.", needsSetup: true },
            { status: 400 },
          );
        }
        const expected = Buffer.from(existing.password_hash, "hex");
        const provided = Buffer.from(
          hashPw(password, existing.salt, existing.iterations),
          "hex",
        );
        if (
          expected.length !== provided.length ||
          !timingSafeEqual(expected, provided)
        ) {
          return Response.json(
            { ok: false, error: "Incorrect password." },
            { status: 401 },
          );
        }
        const session = await useSession<ManagerSession>(sessionConfig);
        await session.update({ unlocked: true, ts: Date.now() });
        return Response.json({ ok: true });
      },
    },
  },
});
