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
import { getBuckets, getBucketObject } from "./s3.ts";

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

      let res: string;
      if (bucketName == "*") {
        res = await getBuckets();
      } else {
        res = await getBucketObject(bucketName);
      }
      await batch.batch(denops, async (denops) => {
        await option.modifiable.setLocal(denops, true);
        // await vars.b.set(denops, "s3_content", res);
        await fn.setline(denops, 1, res);
        await option.modifiable.setLocal(denops, false);
        await option.modified.setLocal(denops, false);
      });
    },

    // triggered method
    // async initializeContent() {
    //   await batch.batch(denops, async (denops) => {
    //     await option.modifiable.setLocal(denops, true);
    //     await fn.setline(
    //       denops,
    //       1,
    //       ((await vars.b.get(denops, "s3_content")) || []) as string[]
    //     );
    //   });

    //   const bufferName = await fn.bufname(denops, "%");
    //   // Bucket:bucketName -> Bucket, bucketName
    //   const bucketName = bufferName.split(":")[1];
    //   let res: string;
    //   if (bucketName == "*") {
    //     res = await getBuckets();
    //   } else {
    //     res = await getBucketObject(bucketName);
    //   }
    //   await batch.batch(denops, async (denops) => {
    //     await vars.b.set(denops, "s3_content", res);
    //     await fn.setline(denops, 1, res);
    //     await option.modifiable.setLocal(denops, false);
    //     await option.modified.setLocal(denops, false);
    //   });
    // },
    // };

    // // autocmd: event-method correspondence
    // await autocmd.group(denops, "denops_s3", (helper) => {
    // helper.remove();
    // helper.define(
    //   "BufReadCmd",
    //   "Bucket:*",
    //   `call denops#notify("${denops.name}", "initializeContent", [])`
    // );
    // });
  };
}
