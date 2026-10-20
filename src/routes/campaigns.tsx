import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Composer } from "@/components/app/Composer";
import { Chips, Field, Page, PageHeader, inputClass, seo } from "@/components/app/ui-bits";

export const Route = createFileRoute("/campaigns")({
  head: () => seo("Creative Campaigns — Litemile Studio", "Generate a coordinated set of campaign images from one brief."),
  component: Campaigns,
});

function Campaigns() {
  const [assets, setAssets] = useState(4);
  const [types, setTypes] = useState("Social posts");
  return (
    <Page>
      <PageHeader
        eyebrow="Studio"
        title="Creative Campaigns"
        subtitle="One brief, a consistent collection of visuals. The cost shown covers every asset."
      />
      <Composer runs={assets} placeholder="Shared visual direction for every asset...">
        <Field label="Campaign name" htmlFor="cn">
          <input id="cn" className={inputClass} placeholder="Summer drop 2026" maxLength={80} />
        </Field>
        <Field label="Target audience" htmlFor="ta">
          <input id="ta" className={inputClass} placeholder="Urban runners, 20–35" maxLength={120} />
        </Field>
        <Field label="Campaign brief" htmlFor="cb">
          <input id="cb" className={inputClass} placeholder="What the campaign should say" maxLength={300} />
        </Field>
        <Field label="Brand style" htmlFor="bs">
          <input id="bs" className={inputClass} placeholder="Black and yellow, high contrast" maxLength={120} />
        </Field>
        <Field label="Asset types">
          <Chips options={["Social posts", "Banners", "Product shots", "Mixed"]} value={types} onChange={setTypes} />
        </Field>
        <Field label={`Number of assets · ${assets}`}>
          <input
            type="range"
            min={2}
            max={12}
            value={assets}
            onChange={(e) => setAssets(Number(e.target.value))}
            className="accent-primary"
            aria-label="Number of assets"
          />
        </Field>
      </Composer>
    </Page>
  );
}
