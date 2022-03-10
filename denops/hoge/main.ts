import {
  anonymous,
  autocmd,
  batch,
  bufname,
  Denops,
  fn,
  helper,
  mapping,
  option,
  unknownutil,
  vars,
} from "./deps.ts";
import { s3 } from "./s3.ts";

const bufferName = "buf";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async s3(x: unknown) {
      const text = "this is s3 plugin";
      await openBuffer(denops, text);
    },

    async read() {
      await batch.batch(denops, async (denops) => {
        await option.modifiable.setLocal(denops, true);
        await fn.setline(
          denops,
          1,
          ((await vars.b.get(denops, "s3_content")) || []) as string[]
        );
      });

      // const { expr, params } = bufname.parse(await fn.bufname(denops, "%"));
      // const res = await s3();
      const res = "This is the result.";

      await batch.batch(denops, async (denops) => {
        await vars.b.set(denops, "s3_content", res);
        await fn.setline(denops, 1, res);
        await option.modifiable.setLocal(denops, false);
        await option.modified.setLocal(denops, false);
      });
    },
  };

  await autocmd.group(denops, "denops_s3", (helper) => {
    helper.remove();
    helper.define(
      "BufReadCmd",
      bufferName,
      `call denops#notify("${denops.name}", "read", [])`
    );
  });

  await denops.cmd(
    `command! -nargs=* S3 call denops#notify("${denops.name}", "s3", "")`
    // `command! -nargs=0 S3 call denops#notify("${denops.name}", "s3", "[<q-args>]")`
  );
}

async function openBuffer(denops: Denops, text: string): Promise<void> {
  // const name = bufname.format({
  //   scheme: "buffer",
  //   // expr: Deno.cwd(),
  //   expr: "S3",
  //   params: {},
  // });
  // await denops.cmd("topleft 10split `=name`", {
  //   name,
  // });
  await denops.cmd(`topleft 10split ${bufferName}`);
}
