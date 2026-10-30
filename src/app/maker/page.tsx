import type { Metadata } from "next";
import { Page } from "@/components/Page";

export const metadata: Metadata = { title: "The maker" };

export default function Maker() {
  return (
    <Page eyebrow="the maker" title="Who built this">
      <div className="prose">
        <p>
          Keystone is a non-commercial project built and maintained by{" "}
          <a href="https://github.com/azzammasood">azzammasood</a>. The pipeline and this site are open
          source:
        </p>
        <ul>
          <li>
            <a href="https://github.com/azzammasood/keystone-pipeline">keystone-pipeline</a>: ingestion,
            parsing, quality, warehouse, lineage and the exports.
          </li>
          <li>
            <a href="https://github.com/azzammasood/keystone-site">keystone-site</a>: this site.
          </li>
        </ul>
      </div>
    </Page>
  );
}
