import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Composer } from "@/components/app/Composer";
import { Chips, Field, Page, PageHeader, inputClass, seo } from "@/components/app/ui-bits";

export const Route = createFileRoute("/branding-studio")({
  head: () => seo("Branding Studio — Litemile Studio", "Explore logos, packaging and brand identity concepts with AI."),
  component: BrandingStudio,
});

function BrandingStudio() {
  const [mode, setMode] = useState("Logo concept");
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [palette, setPalette] = useState("");
  const [direction, setDirection] = useState("");
  const promptContext = [
    brandName.trim() ? `Brand name: ${brandName.trim()}` : "",
    industry.trim() ? `Industry: ${industry.trim()}` : "",
    description.trim() ? `Brand description: ${description.trim()}` : "",
    palette.trim() ? `Color palette: ${palette.trim()}` : "",
    `Concept type: ${mode}`,
    direction.trim() ? `Visual direction: ${direction.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  return (
    <Page>
      <PageHeader eyebrow="Studio" title="Branding Studio" subtitle="Explore logos, packaging and identity directions." />
      <Composer placeholder="Describe the feeling of the brand..." defaultAspect="1:1" promptContext={promptContext}>
        <Field label="Brand name" htmlFor="bn">
          <input id="bn" className={inputClass} placeholder="e.g. Northbound Coffee" maxLength={80} value={brandName} onChange={(event) => setBrandName(event.target.value)} />
        </Field>
        <Field label="Industry" htmlFor="ind">
          <input id="ind" className={inputClass} placeholder="e.g. Specialty coffee" maxLength={80} value={industry} onChange={(event) => setIndustry(event.target.value)} />
        </Field>
        <Field label="Brand description" htmlFor="bd">
          <input id="bd" className={inputClass} placeholder="Who you are, in one line" maxLength={200} value={description} onChange={(event) => setDescription(event.target.value)} />
        </Field>
        <Field label="Color palette" htmlFor="cp">
          <input id="cp" className={inputClass} placeholder="Black, cream, burnt orange" maxLength={120} value={palette} onChange={(event) => setPalette(event.target.value)} />
        </Field>
        <Field label="Mode">
          <Chips options={["Logo concept", "Packaging concept", "Brand visual"]} value={mode} onChange={setMode} />
        </Field>
        <Field label="Visual direction" htmlFor="vd">
          <input id="vd" className={inputClass} placeholder="Geometric, modern, confident" maxLength={120} value={direction} onChange={(event) => setDirection(event.target.value)} />
        </Field>
      </Composer>
    </Page>
  );
}
