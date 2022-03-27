import {
  anonymous,
  autocmd,
  batch,
  bufname,
  Denops,
  fn,
  helper,
  mapping,
  mapType,
  option,
  unknownutil,
  vars,
} from "./deps.ts";
import * as action from "./action.ts";
import * as s3 from "./s3.ts";

export async function main(denops: Denops): Promise<void> {
  // commands
  const commands: string[] = [
    // `command! -nargs=? S3 call denops#notify("${denops.name}", "s3", [<q-args>])`,
    `command! S3 :e s3://buckets`,
  ];

  commands.forEach((cmd) => {
    denops.cmd(cmd);
  });

  await autocmd.group(denops, "denops_s3", (helper) => {
    helper.define(
      "BufReadCmd",
      "s3://buckets",
      `call denops#notify("${denops.name}", "s3", [])`
    );
  });

  denops.dispatcher = {
    async inspectContents(): Promise<void> {
      await action.inspect(denops);
    },

    // setup keymap
    async s3(bucketName?: unknown): Promise<void> {
      // const ft = "docker-containers";
      // await denops.cmd(
      //   `setlocal ft=${ft} buftype=nofile nowrap nomodifiable bufhidden=hide nolist nomodified`
      // );

      mapping.map(
        denops,
        "<CR>",
        `:call denops#notify("${denops.name}", "inspectContents", [])<CR>`,
        {
          mode: "n",
          buffer: true,
          silent: true,
          noremap: true,
        }
      );
      await action.listBuckets(denops);
    },
  };
}
