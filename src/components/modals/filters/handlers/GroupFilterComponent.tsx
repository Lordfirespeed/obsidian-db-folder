import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import {
  AtomicFilter,
  FilterGroup,
  FilterGroupCondition,
  FilterSettings,
  LocalSettings,
} from "cdm/SettingsModel";
import { StyleVariables } from "helpers/Constants";
import React from "react";
import AtomicFilterComponent from "components/modals/filters/handlers/AtomicFilterComponent";
import { Table } from "@tanstack/react-table";
import { RowDataType, TableColumn } from "cdm/FolderModel";
import AddIcon from "@mui/icons-material/Add";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import FolderDeleteIcon from "@mui/icons-material/FolderDelete";
import FilterOffIcon from "components/img/FilterOffIcon";
import FilterOnIcon from "components/img/FilterOnIcon";
import modifyRecursiveFilterGroups, {
  ModifyFilterOptionsEnum,
} from "components/modals/filters/handlers/FiltersHelper";
import ConditionSelectorComponent from "components/modals/filters/handlers/ConditionSelectorComponent";
import IconButton from "@mui/material/IconButton";
type GroupFilterComponentProps = {
  group: FilterGroup;
  recursiveIndex: number[];
  level: number;
  table: Table<RowDataType>;
  possibleColumns: string[];
};
const GroupFilterComponent = (groupProps: GroupFilterComponentProps) => {
  const { group, recursiveIndex, level, table, possibleColumns } = groupProps;
  const { tableState } = table.options.meta;
  const configActions = tableState.configState((state) => state.actions);
  const dataActions = tableState.data((state) => state.actions);
  const configInfo = tableState.configState((state) => state.info);
  const columnsInfo = tableState.columns((state) => state.info);
  const onChangeCondition =
    (conditionIndex: number[], level: number) =>
    (event: React.ChangeEvent<HTMLInputElement>, child: React.ReactNode) => {
      commonModifyFilter(
        conditionIndex,
        level,
        ModifyFilterOptionsEnum.CONDITION,
        event.target.value
      );
    };
  const commonModifyFilter = (
    conditionIndex: number[],
    level: number,
    action: string,
    value?: string
  ) => {
    const alteredFilterState = { ...configInfo.getFilters() };
    // Alter filter state recursively to the level of the condition
    modifyRecursiveFilterGroups(
      possibleColumns,
      alteredFilterState.conditions,
      conditionIndex,
      level,
      action,
      value
    );
    configActions.alterFilters(alteredFilterState);
    dataActions.dataviewRefresh(
      columnsInfo.getAllColumns(),
      configInfo.getLocalSettings(),
      alteredFilterState
    );
  };

  if ((group as FilterGroupCondition).condition) {
    const filtersOfGroup = (group as FilterGroupCondition).filters;
    const conditionOfGroup = (group as FilterGroupCondition).condition;
    const disabledFlag = (group as FilterGroupCondition).disabled;
    return (
      <div
        key={`div-groupFilterComponent-${level}-${recursiveIndex[level]}`}
        style={{
          border: `2px solid ${StyleVariables.BACKGROUND_SECONDARY}`,
          padding: "4px",
          backgroundColor: disabledFlag
            ? StyleVariables.BACKGROUND_SECONDARY
            : StyleVariables.BACKGROUND_PRIMARY,
        }}
      >
        <Grid
          container
          rowSpacing={0.25}
          columnSpacing={{ xs: 0.25, sm: 0.5, md: 0.75 }}
          key={`Grid-AtomicFilter-${level}-${recursiveIndex[level]}`}
        >
          <Box sx={{ flexGrow: 1 }} />
          <Grid
            item
            xs="auto"
            key={`Grid-level-${level}-${recursiveIndex[level]}`}
          >
            {`level ${level}`}
          </Grid>
          <Grid
            item
            xs="auto"
            key={`Grid-disabled-${level}-${recursiveIndex[level]}`}
          >
            <IconButton
              aria-label="enable/disable filter"
              size="small"
              onClick={() =>
                commonModifyFilter(
                  recursiveIndex,
                  level,
                  ModifyFilterOptionsEnum.TOGGLE_DISABLED
                )
              }
            >
              {disabledFlag ? <FilterOffIcon /> : <FilterOnIcon />}
            </IconButton>
          </Grid>
          <Grid
            item
            xs="auto"
            key={`Grid-remove-group-${level}-${recursiveIndex[level]}`}
          >
            <IconButton
              aria-label="delete"
              size="small"
              onClick={() =>
                commonModifyFilter(
                  recursiveIndex,
                  level,
                  ModifyFilterOptionsEnum.DELETE
                )
              }
            >
              <FolderDeleteIcon sx={{ color: StyleVariables.TEXT_ACCENT }} />
            </IconButton>
          </Grid>
          <Grid
            item
            xs="auto"
            key={`Grid-add-atomic-filter-${level}-${recursiveIndex[level]}`}
          >
            <IconButton
              aria-label="add atomic filter"
              size="small"
              onClick={() =>
                commonModifyFilter(
                  recursiveIndex,
                  level,
                  ModifyFilterOptionsEnum.ADD
                )
              }
            >
              <AddIcon sx={{ color: StyleVariables.TEXT_ACCENT }} />
            </IconButton>
          </Grid>
          <Grid
            item
            xs="auto"
            key={`Grid-add-group-filter-${level}-${recursiveIndex[level]}`}
          >
            <IconButton
              aria-label="add group filter"
              size="small"
              onClick={() =>
                commonModifyFilter(
                  recursiveIndex,
                  level,
                  ModifyFilterOptionsEnum.ADD_GROUP
                )
              }
            >
              <CreateNewFolderIcon sx={{ color: StyleVariables.TEXT_ACCENT }} />
            </IconButton>
          </Grid>
          <Grid
            item
            xs="auto"
            key={`Grid-AtomicFilter-operator-${level}-${recursiveIndex[level]}`}
          >
            <ConditionSelectorComponent
              currentCon={conditionOfGroup}
              recursiveIndex={recursiveIndex}
              level={level}
              onChange={onChangeCondition}
              key={`ConditionSelectorComponent-${level}-${recursiveIndex[level]}`}
            />
          </Grid>
          <Grid
            item
            xs={12}
            key={`Grid-AtomicFilter-value-${level}-${recursiveIndex[level]}`}
          >
            {filtersOfGroup.map((filter, filterIndex) => {
              return (
                <GroupFilterComponent
                  group={filter as FilterGroupCondition}
                  recursiveIndex={[...recursiveIndex, filterIndex]}
                  level={level + 1}
                  table={table}
                  possibleColumns={possibleColumns}
                  key={`GroupFilterComponent-${level}-${recursiveIndex[level]}-${filterIndex}`}
                />
              );
            })}
          </Grid>
        </Grid>
      </div>
    );
  } else {
    return (
      <AtomicFilterComponent
        recursiveIndex={recursiveIndex}
        level={level}
        atomicFilter={group as AtomicFilter}
        possibleColumns={possibleColumns}
        table={table}
        key={`AtomicFilterComponent-${level}-${recursiveIndex[level]}`}
      />
    );
  }
};

export default GroupFilterComponent;