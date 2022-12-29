import { Denops } from "https://deno.land/x/denops_std@v3.1.4/mod.ts";
import { ensureObject } from "https://deno.land/x/unknownutil@v2.0.0/mod.ts";
import { ensureFile } from "https://deno.land/std@0.158.0/fs/mod.ts";

type Bookmark = {
  name: string;
  path: string;
};

type BookmarkData = {
  version: string;
  group: {
    [key: string]: { name: string; bookmarks: Bookmark[] };
  };
};

export function main(denops: Denops) {
  denops.dispatcher = {
    async add(args: unknown): Promise<unknown> {
      ensureObject(args);
      const { group, name, path } = args as {
        group: string;
        name: string;
        path: string;
      };
      const data = await loadBookmarkData(denops);
      if (!data.group[group]) {
        data.group[group] = { name: group, bookmarks: [] };
      }
      data.group[group].bookmarks.push({ name, path });
      await saveBookmarkData(denops, data);

      return await Promise.resolve(args);
    },

    async remove(args: unknown): Promise<unknown> {
      ensureObject(args);
      const { group, name } = args as {
        group: string;
        name: string;
      };
      const data = await loadBookmarkData(denops);
      if (!data.group[group]) {
        return;
      }
      const bookmark = data.group[group].bookmarks.find(
        (d) => d.name === name,
      );
      if (!bookmark) {
        return;
      }
      data.group[group].bookmarks = data.group[group].bookmarks.filter(
        (d) => d !== bookmark,
      );
      await saveBookmarkData(denops, data);

      return await Promise.resolve(args);
    },
  };
}

export async function getDefaultGroup(denops: Denops): Promise<string> {
  return (await denops.call("ddu#source#bookmark#get_default_group")) as string;
}

async function getDataFilePath(denops: Denops): Promise<string> {
  return (await denops.call("ddu#source#bookmark#get_data_file_path")) as string;
}

export async function loadBookmarkData(denops: Denops): Promise<BookmarkData> {
  try {
    const txt = await Deno.readFile(await getDataFilePath(denops));
    return JSON.parse(new TextDecoder("utf-8").decode(txt)) as BookmarkData;
  } catch (_e) {
    return {
      version: "0.1.0",
      group: { default: { name: "default", bookmarks: [] } },
    };
  }
}

async function saveBookmarkData(denops: Denops, data: BookmarkData): Promise<void> {
  for (const group of Object.values(data.group)) {
    group.bookmarks.sort((a, b) => a.name.localeCompare(b.name));
  }
  const path = await getDataFilePath(denops);
  await ensureFile(path);
  await Deno.writeFile(
    path,
    new TextEncoder().encode(JSON.stringify(data, undefined, 2)),
  );
}	 

async function fileExists(filepath: string): Promise<boolean> {
  try {
    const file = await Deno.stat(filepath);   
    return file.isFile();
  } catch (e) {
    return false
  }
}  
