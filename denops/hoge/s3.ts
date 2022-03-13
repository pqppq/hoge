import * as datetime from "https://deno.land/std@0.129.0/datetime/mod.ts";
import { Denops, vars, utf8Encode, utf8Decode } from "./deps.ts";

export async function getBuckets(denops: Denops): Promise<string[]> {
  let list = await vars.globals.get<string[]>(denops, "s3_buckets");
  if (!list) {
    const process = Deno.run({
      cmd: ["aws", "s3", "ls"],
      stdin: "null",
      stdout: "piped",
      stderr: "null",
    });

    const stdout = await process.output();
    list = utf8Decode(stdout).slice(0, -1).split("\n");
    vars.globals.set<string[]>(denops, "s3_buckets", list);
  }
  return list;
}

async function bucketExists(
  denops: Denops,
  bucketName: string
): Promise<boolean> {
  const buckets = await getBuckets(denops);
  for (const bucket of buckets) {
    if (bucket.includes(bucketName)) {
      return true;
    }
  }
  return false;
}

export async function getContents(
  denops: Denops,
  bucketName: string,
  path: string
): Promise<string[]> {
  if (!(await bucketExists(denops, bucketName))) {
    return ["No such bucket or not permitted to access."];
  }

  let bucket = await vars.globals.get<string[]>(denops, `s3_${bucketName}`);
  if (!bucket) {
    const process = Deno.run({
      cmd: ["aws", "s3", "ls", bucketName, "--human-readable", "--recursive"],
      stdin: "null",
      stdout: "piped",
      stderr: "null",
    });

    const stdout = await process.output();
    bucket = utf8Decode(stdout).slice(0, -1).split("\n");
    vars.globals.set<string[]>(denops, `s3_${bucketName}`, bucket);
  }
  return bucket;
}
