import { AtomicFilter, FilterGroup, FilterGroupCondition } from "@features/filters/model/FiltersModel";
import { DiskHandlerResponse } from "cdm/MashallModel";
import { YAML_INDENT } from "helpers/Constants";
import { AbstractDiskHandler } from "IO/md/handlers/unmarshall/AbstractDiskPropertyHandler";

export class UnmarshallFiltersHandler extends AbstractDiskHandler {
    handlerName = 'filters';

    public handle(handlerResponse: DiskHandlerResponse): DiskHandlerResponse {
        const { filters } = handlerResponse.yaml;
        let indentLevel = 1;
        // Lvl1: filters
        this.localDisk.push(`${this.handlerName}:`);
        this.localDisk.push(`${YAML_INDENT.repeat(indentLevel)}enabled: ${filters.enabled}`);
        this.localDisk.push(`${YAML_INDENT.repeat(indentLevel)}conditions:`);
        indentLevel++;
        if (filters.conditions) {
            for (const condition of filters.conditions) {
                // Array of filters
                this.striginifyFilter(condition, indentLevel + 1);
            }
        }

        return this.goNext(handlerResponse);
    }
    striginifyFilter(filter: FilterGroup, indentLevel: number): void {
        if ((filter as FilterGroupCondition).condition) {
            // Is a filter group
            const condition = (filter as FilterGroupCondition).condition;
            const disabled = (filter as FilterGroupCondition).disabled;
            const filters = (filter as FilterGroupCondition).filters;
            const label = (filter as FilterGroupCondition).label;
            const color = (filter as FilterGroupCondition).color;
            if (filters && filters.length > 0) {
                this.localDisk.push(`${YAML_INDENT.repeat(indentLevel)}- condition: ${condition}`);
                this.localDisk.push(`${YAML_INDENT.repeat(indentLevel)}  disabled: ${Boolean(disabled)}`);
                if (label) {
                    // Label is mandatory just for the first level
                    this.localDisk.push(`${YAML_INDENT.repeat(indentLevel)}  label: "${label}"`);
                }
                if (color) {
                    // Color is mandatory just for the first level
                    this.localDisk.push(`${YAML_INDENT.repeat(indentLevel)}  color: "${color}"`);
                }
                this.localDisk.push(`${YAML_INDENT.repeat(indentLevel)}  filters:`);
                indentLevel++;
                for (const group of (filter as FilterGroupCondition).filters) {
                    this.striginifyFilter(group, indentLevel);
                }
            }
        } else {
            // Is a simple filter
            this.localDisk.push(`${YAML_INDENT.repeat(indentLevel)}- field: ${(filter as AtomicFilter).field}`);
            this.localDisk.push(`${YAML_INDENT.repeat(indentLevel)}  operator: ${(filter as AtomicFilter).operator}`);
            this.localDisk.push(`${YAML_INDENT.repeat(indentLevel)}  value: "${(filter as AtomicFilter).value ?? ''}"`);
            this.localDisk.push(`${YAML_INDENT.repeat(indentLevel)}  type: ${(filter as AtomicFilter).type}`);
        }
    }
}
