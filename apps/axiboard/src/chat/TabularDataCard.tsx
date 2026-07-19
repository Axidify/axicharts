import type { ReactElement } from "react";
import type { TabularPreview } from "./summarizeTabular";

export type TabularDataCardProps = {
  preview: TabularPreview;
};

export function TabularDataCard({ preview }: TabularDataCardProps): ReactElement {
  const columnPreview = preview.columns.slice(0, 4).join(", ");
  const moreColumns =
    preview.columnCount > 4 ? ` +${preview.columnCount - 4} more` : "";

  return (
    <div className="axi-data-card">
      <div className="axi-data-card-label">Table attached</div>
      <div className="axi-data-card-stats">
        {preview.rowCount} row{preview.rowCount === 1 ? "" : "s"} · {preview.columnCount} column
        {preview.columnCount === 1 ? "" : "s"}
      </div>
      {columnPreview ? (
        <div className="axi-data-card-cols">
          {columnPreview}
          {moreColumns}
        </div>
      ) : null}
    </div>
  );
}
