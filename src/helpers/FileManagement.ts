import { LocalSettings } from "cdm/SettingsModel";
import HelperException from "errors/HelperException";
import { normalizePath, TAbstractFile, TFile, TFolder, Vault } from "obsidian";
import { SourceDataTypes } from "helpers/Constants";
import { RowDataType } from "cdm/FolderModel";

export function resolve_tfile(file_str: string, restrict = true): TFile {
  file_str = normalizePath(file_str);

  const file = app.vault.getAbstractFileByPath(file_str);
  if (!file && restrict) {
    throw new HelperException(`File "${file_str}" doesn't exist`);
  }

  if (!(file instanceof TFile)) {
    if (restrict) {
      throw new HelperException(`${file_str} is a folder, not a file`);
    } else {
      return null;
    }
  }

  return file;
}

export function resolve_tfolder(folder_str: string): TFolder {
  folder_str = normalizePath(folder_str);

  let folder = app.vault.getAbstractFileByPath(folder_str);
  if (!folder) {
    folder = resolve_tfolder(folder_str.split("/").slice(0, -1).join("/"));
  }
  if (!(folder instanceof TFolder)) {
    throw new HelperException(`${folder_str} is a file, not a folder`);
  }
  return folder;
}

export function get_tfiles_from_folder(
  folder_str: string,
  fileExtensions: string[] = ["md", "canvas"]
): Array<TFile> {
  let folder;
  try {
    folder = resolve_tfolder(folder_str);
  } catch (err) {
    // Split the string into '/' and remove the last element
    folder = resolve_tfolder(folder_str.split("/").slice(0, -1).join("/"));
  }
  let files: Array<TFile> = [];
  Vault.recurseChildren(folder, (file: TAbstractFile) => {
    if (file instanceof TFile) {
      files.push(file);
    }
  });

  if (fileExtensions.length > 0) {
    files = files.filter((file) => {
      return fileExtensions.includes(file.extension);
    });
  }

  files.sort((a, b) => {
    return a.basename.localeCompare(b.basename);
  });

  return files;
}

export function destination_folder(databaseFile: TFile, ddbbConfig: LocalSettings): string {
  let destination_folder = databaseFile.parent.path;
  switch (ddbbConfig.source_data) {
    case SourceDataTypes.TAG:
    case SourceDataTypes.OUTGOING_LINK:
    case SourceDataTypes.INCOMING_LINK:
    case SourceDataTypes.QUERY:
      destination_folder = ddbbConfig.source_destination_path;
      break;
    default:
    //Current folder
  }
  return destination_folder;
}

/* eslint-disable no-useless-escape */
/* eslint-disable no-control-regex */
export function sanitize_path(path: string, replacement = '') {
  const illegalCharacters = /[\*"\\\/<>:\|\?]/g
  const unsafeCharachersForObsidianLinks = /[#\^\[\]\|]/g
  const dotAtTheStart = /^\./g

  // credit: https://github.com/parshap/node-sanitize-filename/blob/209c39b914c8eb48ee27bcbde64b2c7822fdf3de/index.js#L33
  const controlRe = /[\x00-\x1f\x80-\x9f]/g;
  const reservedRe = /^\.+$/;
  const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
  const windowsTrailingRe = /[\. ]+$/;

  let sanitized = path
    .replace(illegalCharacters, replacement)
    .replace(unsafeCharachersForObsidianLinks, replacement)
    .replace(dotAtTheStart, replacement)
    .replace(controlRe, replacement)
    .replace(reservedRe, replacement)
    .replace(windowsReservedRe, replacement)
    .replace(windowsTrailingRe, replacement);

  if (replacement)
    sanitized = sanitized
      .replace(new RegExp(`${replacement}+`, 'g'), replacement)
      .replace(new RegExp(`^${replacement}(.)|(.)${replacement}$`, 'g'), '$1$2');
  return sanitized
}

export const resolveNewFilePath = ({
  pathColumns,
  row,
  ddbbConfig,
  folderPath,
}: {
  pathColumns: string[];
  row: RowDataType;
  ddbbConfig: LocalSettings;
  folderPath: string;
}) => {
  const fileHasMissingPathAttributes = pathColumns.some(
    (columnName) => !row[columnName],
  );
  let subfolders;
  if (fileHasMissingPathAttributes) {
    if (ddbbConfig.hoist_files_with_empty_attributes) {
      subfolders = "";
    } else {
      // Hoist to lowest available attribute
      subfolders = pathColumns.reduce(
        (state, name) => {
          if (row[name] && !state.stop) {
            state.subfolders =
              state.subfolders + "/" + sanitize_path(row[name]?.toString(), "-");
          } else {
            state.stop = true;
          }

          return state;
        },
        { subfolders: "", stop: false },
      ).subfolders;
    }
  } else
    subfolders = pathColumns
      .map((name) => sanitize_path(row[name]?.toString(), "-"))
      .join("/");
  return `${folderPath}${subfolders ? `/${subfolders}` : ""}`;
};

/**
   * Remove all not readable characters of yaml and trim the string
   * 
   * Example:
   * input: "\- some text"
   * output: "some text"
   * @param option 
   * @returns 
   */
export function satinizedColumnOption(option: string): string {
  return option
    .replace("\\", "")
    .trim();
}