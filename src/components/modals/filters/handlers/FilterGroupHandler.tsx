import { FiltersModalHandlerResponse } from "cdm/ModalsModel";
import DataviewFiltersComponent from "components/modals/filters/handlers/DataviewFiltersComponent";
import { AbstractHandlerClass } from "patterns/chain/AbstractHandler";
import React from "react";
import { createRoot } from "react-dom/client";

export class FilterGroupHandler extends AbstractHandlerClass<FiltersModalHandlerResponse> {
  settingTitle: string = "Content alignment selector";
  handle(
    columnHandlerResponse: FiltersModalHandlerResponse
  ): FiltersModalHandlerResponse {
    const { containerEl, filtersModalManager } = columnHandlerResponse;
    const { table, possibleColumns } = filtersModalManager.props;

    createRoot(containerEl.createDiv()).render(
      <DataviewFiltersComponent
        table={table}
        possibleColumns={possibleColumns}
      />
    );
    return this.goNext(columnHandlerResponse);
  }
}
