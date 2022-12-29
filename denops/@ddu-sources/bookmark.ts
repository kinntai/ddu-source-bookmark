import {
  ActionFlags,
  Actions,
  BaseSource,
  DduItem,
  Item,
} from "https://deno.land/x/ddu_vim@v1.2.0/types.ts#^";
import { Denops } from "https://deno.land/x/ddu_vim@v1.2.0/deps.ts";
import { ActionData } from "https://deno.land/x/ddu_kind_file@v0.2.0/file.ts#^";
import { getDefaultGroup, loadBookmarkData } from "../ddu_bookmark/main.ts";

type Params = { group: string | undefined };

export class Source extends BaseSource<Params> {
  kind = "file";
  currentGroup: string | undefined = undefined;

  actions: Actions<Params> = {
    remove: async (args: {
      denops: Denops;
      items: DduItem[]
    }) => {
      const group = this.currentGroup ?? await getDefaultGroup(args.denops);

      for (const item of args.items) {
        await args.denops.dispatch("ddu_bookmark", "remove", {
          group: group,
          name: item.word,
        });
      }
      return Promise.resolve(ActionFlags.None);
    },
  };

  gather(args: {
    denops: Denops;
    sourceParams: Params 
  }): ReadableStream<Item<ActionData>[]> {
    this.currentGroup = args.sourceParams["group"];

    return new ReadableStream({
      async start(controller) {
        const data = await loadBookmarkData(args.denops);
        const group = args.sourceParams["group"] ??
          await getDefaultGroup(args.denops);

        controller.enqueue(
          await Promise.all(data["group"][group]["bookmarks"].map(
            async (bookmark) => ({
              word: bookmark.name,
              display: `[${bookmark.name}] ${bookmark.path}`,
              action: { path: bookmark.path },
              highlights: [
                {
                  name: "name",
                  hl_group: "Denite_Bookmark_Name",
                  col: 1,
                  width: ((await args.denops.call(
                    "strwidth",
                    `[${bookmark.name}]`,
                  )) as number) + 1,
                },
              ],
            }),
          )),
        );

        controller.close();
      },
    });
  }

  params(): Params {
    return { "group": undefined };
  }
}
