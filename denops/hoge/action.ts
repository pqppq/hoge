import { Denops, vars, batch, option, fn, path } from "./deps.ts";
import * as s3 from "./s3.ts";

export async function listBuckets(denops: Denops): Promise<void> {
  if (await vars.buffers.get<string[]>(denops, "s3_bucket")) {
    await vars.buffers.remove(denops, "s3_bucket");
  }
  if (await vars.buffers.get<string[]>(denops, "s3_bucket_name")) {
    await vars.buffers.remove(denops, "s3_bucket_name");
  }
  if (await vars.buffers.get<string[]>(denops, "s3_cd")) {
    await vars.buffers.remove(denops, "s3_cd");
  }
  const buckets = await s3.getBuckets();
  await updateBuffer(denops, buckets);
}

export async function inspect(denops: Denops): Promise<void> {
  const line = await fn.getline(denops, ".");
  const itemName = line.split(/\s+/).slice(-1)[0];

  let bucketName = await vars.buffers.get<string>(denops, "s3_bucket_name");
  if (!bucketName) {
    bucketName = itemName;
    vars.buffers.set<string>(denops, "s3_bucket_name", bucketName);
  }

  const cd = (await vars.buffers.get<string>(denops, "s3_cd")) || "";

  const target =
    bucketName == itemName
      ? ""
      : itemName == ".."
      ? cd.replace(path.basename(cd) + "/", "")
      : cd + itemName;

  let bucket = await vars.buffers.get<string[]>(denops, "s3_bucket");
  if (!bucket) {
    bucket = await s3.getContents(bucketName);
    await vars.buffers.set<string[]>(denops, "s3_bucket", bucket);
  }

  if (cd == "" && itemName == "..") {
    listBuckets(denops);
    return;
  } else if (target == "") {
    const items = getItems(bucket, "");
    items.unshift("..");
    updateBuffer(denops, items);
    vars.buffers.set<string>(denops, "s3_cd", "");
  } else if (target.endsWith("/")) {
    const items = getItems(bucket, target);
    items.unshift("..");
    updateBuffer(denops, items);
    vars.buffers.set<string>(denops, "s3_cd", target);
  } else {
    file(denops, target);
  }
}

async function file(denops: Denops, fileName: string): Promise<void> {
  await console.log(`file name: ${fileName}`);
}

async function updateBuffer(denops: Denops, contents: string[]): Promise<void> {
  await batch.batch(denops, async (denops) => {
    await denops.cmd("setlocal modifiable | silent %d_");
    await fn.setline(denops, 1, contents);
    await denops.cmd("setlocal nomodifiable nomodified");
  });
}

function getItems(contents: string[], target: string): string[] {
  const items = [];

  const expr = new RegExp(`^${target}([a-zA-Z_\\d\\-\\.]+\\/?)$`);
  for (const line of contents) {
    const item = line.split(/\s+/)[3];
    const match = item.match(expr);
    if (match) {
      console.log(line, match);
      items.push(line.replace(item, match[1]));
    }
  }
  return items;
}
