import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Composer } from "@/components/app/Composer";
import { Chips, Field, Page, PageHeader, inputClass, seo } from "@/components/app/ui-bits";

export const Route = createFileRoute("/product-studio")({
  head: () => seo("Product Studio — Litemile Studio", "Create e-commerce product photography and ads with AI."),
  component: ProductStudio,
});

function ProductStudio() {
  const [lighting, setLighting] = useState("Studio softbox");
  const [style, setStyle] = useState("Luxury");
  return (
    <Page>
      <PageHeader
        eyebrow="Studio"
        title="Product Studio"
        subtitle="Place your product in any scene with controlled lighting and composition."
      />
      <Composer placeholder="Describe the scene around your product..." defaultAspect="1:1">
        <Field label="Background & scene" htmlFor="scene">
          <input id="scene" className={inputClass} placeholder="Wet black rocks, soft mist" maxLength={200} />
        </Field>
        <Field label="Composition">
          <Chips options={["Hero centered", "Flat lay", "Close-up", "Lifestyle"]} value="Hero centered" onChange={() => {}} />
        </Field>
        <Field label="Lighting">
          <Chips options={["Studio softbox", "Golden hour", "Rim light", "Neon"]} value={lighting} onChange={setLighting} />
        </Field>
        <Field label="Visual style">
          <Chips options={["Luxury", "Minimal", "Bold", "Natural"]} value={style} onChange={setStyle} />
        </Field>
      </Composer>
      <p className="mt-4 text-sm text-muted-foreground">Upload your product photo with the image button in the composer.</p>
    </Page>
  );
}
