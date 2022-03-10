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

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async s3(bucketName?: unknown) {
      if (!bucketName) {
        bucketName = "*";
      }
      unknownutil.ensureString(bucketName);
      await openBuffer(denops, bucketName);
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

      const bufferName = await fn.bufname(denops, "%");
      // Bucket:bucketName -> Bucket, bucketName
      const bucketName = bufferName.split(":")[1];
      let res: string;
      if (bucketName != "*") {
        res = await s3(bucketName);
      } else {
        res = await s3();
      }
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
      "Bucket:*",
      `call denops#notify("${denops.name}", "read", [])`
    );
  });

  await denops.cmd(
    `command! -nargs=? S3 call denops#notify("${denops.name}", "s3", [<q-args>])`
  );
}

async function openBuffer(denops: Denops, bucketName: string): Promise<void> {
  const bufferName = `Bucket:${bucketName}`;
  await denops.cmd(`topleft 10split ${bufferName}`);
}
