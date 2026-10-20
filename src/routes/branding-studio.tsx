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
  return (
    <Page>
      <PageHeader eyebrow="Studio" title="Branding Studio" subtitle="Explore logos, packaging and identity directions." />
      <Composer placeholder="Describe the feeling of the brand..." defaultAspect="1:1">
        <Field label="Brand name" htmlFor="bn">
          <input id="bn" className={inputClass} placeholder="e.g. Northbound Coffee" maxLength={80} />
        </Field>
        <Field label="Industry" htmlFor="ind">
          <input id="ind" className={inputClass} placeholder="e.g. Specialty coffee" maxLength={80} />
        </Field>
        <Field label="Brand description" htmlFor="bd">
          <input id="bd" className={inputClass} placeholder="Who you are, in one line" maxLength={200} />
        </Field>
        <Field label="Color palette" htmlFor="cp">
          <input id="cp" className={inputClass} placeholder="Black, cream, burnt orange" maxLength={120} />
        </Field>
        <Field label="Mode">
          <Chips options={["Logo concept", "Packaging concept", "Brand visual"]} value={mode} onChange={setMode} />
        </Field>
        <Field label="Visual direction" htmlFor="vd">
          <input id="vd" className={inputClass} placeholder="Geometric, modern, confident" maxLength={120} />
        </Field>
      </Composer>
    </Page>
  );
}
