import { RowType } from "cdm/RowTypeModel"
import { FilterSettings, LocalSettings } from "cdm/SettingsModel";
import { Literal } from "obsidian-dataview/lib/data-model/value";
import { TableOptions } from "@tanstack/react-table";
import { BaseColumn, RowDataType, TableColumn } from "cdm/FolderModel";
import { SMarkdownPage } from "obsidian-dataview";
import en from "lang/locale/en";
import { TFile } from "obsidian";
import DatabaseInfo from "services/DatabaseInfo";

/** database column */
export interface DatabaseColumn extends BaseColumn {
    [key: string]: RowType;
}

/** database yaml */
export interface DatabaseYaml {
    /** database name */
    name: string;
    /** database description */
    description: string;
    /** database columns */
    columns: Record<string, DatabaseColumn>;
    /** database local configuration */
    config: LocalSettings;
    /** dataview filters */
    filters: FilterSettings;
}

export type RowDatabaseFields = {
    frontmatter: Record<string, Literal>;
    inline: Record<string, Literal>;
}

export type SortedType = {
    id: string;
    desc: boolean;
}

export type MetadataColumnsModel = {
    [key: string]: DatabaseColumn
}

export type TableOptionsResponse = {
    options: TableOptions<RowDataType>;
}

export type NoteInfoPage = Omit<SMarkdownPage, "file"> & {
    file: Pick<SMarkdownPage["file"], "link" | "path" | "ctime" | "mtime" | "tasks" | "outlinks" | "inlinks" | "folder" | "tags">;
};

export type LocaleDict = keyof typeof en;

export type RelationInfo = {
    recordRows: Record<string, string>;
    ddbbFile: TFile,
    ddbbInfo: DatabaseInfo,
    relatedColumns: TableColumn[],
    relatedRows: RowDataType[]
}