import type { Metadata } from "next";
import { Page } from "@/components/Page";
import * as data from "@/lib/data";

export const metadata: Metadata = { title: "Corrections and removal" };
const FALLBACK = "https://github.com/azzammasood/keystone-pipeline/issues";

export default function Corrections() {
  const r = data.radar();
  const url = r.ok ? r.data.corrections : FALLBACK;
  return (
    <Page
      eyebrow="corrections"
      title="Corrections and removal"
      lede="If something here is wrong, or a repository should not be listed, say so and it will be looked at."
    >
      <div className="prose">
        <h3>Ask for a correction</h3>
        <p>
          Open an issue on the pipeline repository: <a href={url}>{url}</a>. Name the repository or
          package, the page, and what is wrong. A wrong package-to-repository link, a misread signal or
          a missing event are all fair reports. Accepted link corrections are recorded in the
          pipeline as reviewed decisions and used from the next run.
        </p>
        <h3>Ask for removal</h3>
        <p>
          Maintainers can ask for their repository to be left out of the radar. Use the same issue
          tracker with the title &ldquo;removal&rdquo;; each request is reviewed by hand and answered
          on the issue.
        </p>
        <h3>What is never here</h3>
        <p>
          No people: no logins, names, emails or rankings of contributors. Only repositories and
          packages, and aggregate shares of activity.
        </p>
      </div>
    </Page>
  );
}
