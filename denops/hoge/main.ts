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
import { getBuckets, getContents } from "./s3.ts";

export async function main(denops: Denops): Promise<void> {
  // commands
  await denops.cmd(
    `command! -nargs=? S3 call denops#notify("${denops.name}", "openBuffer", [<q-args>])`
  );

  denops.dispatcher = {
    // open new buffer
    async openBuffer(bucketName?: unknown) {
      if (!bucketName) {
        bucketName = "*";
      }
      unknownutil.ensureString(bucketName);
      await denops.cmd(`topleft 10split Bucket:${bucketName}`);

      let contents: string[];
      if (bucketName == "*") {
        contents = await getBuckets(denops);
      } else {
        contents = await getContents(denops, bucketName, "/");
      }

      await batch.batch(denops, async (denops) => {
        await option.modifiable.setLocal(denops, true);
        await fn.setline(denops, 1, contents);
        await option.modifiable.setLocal(denops, false);
        await option.modified.setLocal(denops, false);
      });
    },
  };
}
