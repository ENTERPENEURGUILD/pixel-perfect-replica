import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Camera, Sparkles, User } from "lucide-react";
import product from "@/assets/showcase-product.jpg";
import campaign from "@/assets/showcase-campaign.jpg";
import cinematic from "@/assets/showcase-cinematic.jpg";
import neon from "@/assets/explore-neon.jpg";
import portrait from "@/assets/explore-portrait.jpg";
import world from "@/assets/explore-world.jpg";
import { Page, PageHeader, seo } from "@/components/app/ui-bits";

export const Route = createFileRoute("/explore")({
  head: () => seo("Explore — Litemile Studio", "Styles and inspiration from the Litemile Studio community."),
  component: Explore,
});

const STYLES = [
  { img: product, label: "Product photography", caption: "Hero products in controlled scenes", to: "/product-studio", icon: Camera },
  { img: neon, label: "Neon noir", caption: "Rain-soaked city, glowing signs", to: "/", icon: Sparkles },
  { img: campaign, label: "Campaign visuals", caption: "One idea, a whole collection", to: "/campaigns", icon: Sparkles },
  { img: portrait, label: "Studio portrait", caption: "Dramatic single-source light", to: "/creator-studio", icon: User },
  { img: world, label: "Cinematic worlds", caption: "Landscapes beyond reality", to: "/explore", icon: Sparkles },
  { img: cinematic, label: "Brand identity", caption: "Logos and packaging directions", to: "/branding-studio", icon: Camera },
] as const;

function Explore() {
  return (
    <Page>
      <PageHeader
        eyebrow="Gallery"
        title="Explore"
        subtitle="Styles made in the studio. Open one in the workspace it belongs to."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STYLES.map(({ img, label, caption, to, icon: Icon }, i) => (
          <Link
            key={label}
            to={to}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl border"
          >
            <img
              src={img}
              alt={label}
              width={1280}
              height={960}
              loading={i < 3 ? "eager" : "lazy"}
              className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 card-overlay" />
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-background/70 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur">
              <Icon className="size-3.5 text-primary" />
              {label}
            </div>
            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
              <span className="text-sm">{caption}</span>
              <span className="grid size-8 place-items-center rounded-full border border-foreground/40 transition group-hover:border-primary group-hover:text-primary">
                <ArrowRight className="size-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Page>
  );
}
