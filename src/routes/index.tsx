import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ability Therapy Place — Staff Portal" },
      {
        name: "description",
        content:
          "Staff attendance, geofenced clock-in, client sessions and daily logs for Ability Therapy Place.",
      },
      { property: "og:title", content: "Ability Therapy Place — Staff Portal" },
      {
        property: "og:description",
        content:
          "Staff attendance, geofenced clock-in, client sessions and daily logs for Ability Therapy Place.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    window.location.replace("/portal.html");
  }, []);
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: "#12151c", color: "#e9e7df" }}
    >
      <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 14 }}>
        Loading Ability Therapy Place staff portal…{" "}
        <a href="/portal.html" style={{ color: "#ee4a2c" }}>
          Open now
        </a>
      </p>
    </div>
  );
}
