import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Composer } from "@/components/app/Composer";
import { Chips, Field, Page, PageHeader, inputClass, seo } from "@/components/app/ui-bits";

export const Route = createFileRoute("/creator-studio")({
  head: () => seo("Creator Studio — Litemile Studio", "Thumbnails, social graphics and gaming visuals made with AI."),
  component: CreatorStudio,
});

const PLATFORMS: Record<string, string> = {
  "YouTube thumbnail": "16:9",
  "Instagram post": "1:1",
  "Story / Reel": "9:16",
  "Gaming art": "16:9",
};

function CreatorStudio() {
  const [platform, setPlatform] = useState("YouTube thumbnail");
  const [style, setStyle] = useState("High energy");
  return (
    <Page>
      <PageHeader eyebrow="Studio" title="Creator Studio" subtitle="Scroll-stopping visuals sized for every platform." />
      <Composer key={platform} placeholder="Describe the scene for your content..." defaultAspect={PLATFORMS[platform]}>
        <Field label="Platform">
          <Chips options={Object.keys(PLATFORMS)} value={platform} onChange={setPlatform} />
        </Field>
        <Field label="Style">
          <Chips options={["High energy", "Clean", "Cinematic", "Illustrated"]} value={style} onChange={setStyle} />
        </Field>
        <Field label="Headline text" htmlFor="hl">
          <input id="hl" className={inputClass} placeholder="Text to show on the image" maxLength={60} />
        </Field>
      </Composer>
      <p className="mt-4 text-sm text-muted-foreground">
        Aspect ratio follows the platform where the selected model supports it.
      </p>
    </Page>
  );
}
