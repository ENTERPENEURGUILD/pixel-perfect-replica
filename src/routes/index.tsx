import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Box, Megaphone, Mountain } from "lucide-react";
import product from "@/assets/showcase-product.jpg";
import campaign from "@/assets/showcase-campaign.jpg";
import cinematic from "@/assets/showcase-cinematic.jpg";
import { Composer } from "@/components/app/Composer";
import { seo } from "@/components/app/ui-bits";

export const Route = createFileRoute("/")({
  head: () =>
    seo(
      "Litemile Studio — Turn ideas into images",
      "A powerful AI image creation workspace for product visuals, campaigns and cinematic worlds.",
    ),
  component: Index,
});

const SHOWCASE = [
  { label: "Product Visuals", caption: "Premium product photography", img: product, icon: Box, to: "/product-studio" },
  { label: "Creative Campaigns", caption: "Bold ideas. Bigger visuals.", img: campaign, icon: Megaphone, to: "/campaigns" },
  { label: "Cinematic Worlds", caption: "Turn imagination into reality.", img: cinematic, icon: Mountain, to: "/explore" },
] as const;

function Index() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 md:px-8 md:py-14">
      <div className="text-center">
        <p className="eyebrow">Litemile Studio</p>
        <h1 className="mt-4 font-display text-4xl font-black uppercase leading-none tracking-tight sm:text-6xl lg:text-7xl">
          Turn ideas into <span className="text-primary">images</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground md:text-xl">
          A powerful creative workspace for your next big idea.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {SHOWCASE.map(({ label, caption, img, icon: Icon, to }, i) => (
          <Link
            key={label}
            to={to}
            className="group relative aspect-[8/7] overflow-hidden rounded-2xl border"
          >
            <img
              src={img}
              alt={label}
              width={1024}
              height={896}
              loading={i === 0 ? "eager" : "lazy"}
              className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 card-overlay" />
            <div className="absolute left-5 top-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <Icon className="size-4 text-primary" />
              {label}
            </div>
            <div className="absolute inset-x-5 bottom-5 flex items-center justify-between">
              <span className="text-sm">{caption}</span>
              <span className="grid size-8 place-items-center rounded-full border border-foreground/40 transition group-hover:border-primary group-hover:text-primary">
                <ArrowRight className="size-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <Composer />
      </div>
    </div>
  );
}
