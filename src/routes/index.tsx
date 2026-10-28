import { createFileRoute } from "@tanstack/react-router";
import { CafeApp } from "@/cafe/app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Forget Me Not Espresso" },
      {
        name: "description",
        content: "Order ahead from Forget Me Not Espresso in Fairbanks. Pickup at 1246 Noble Street.",
      },
    ],
  }),
  component: CafeApp,
});
