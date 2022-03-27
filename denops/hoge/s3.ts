import * as datetime from "https://deno.land/std@0.129.0/datetime/mod.ts";
import { Denops, vars, utf8Encode, utf8Decode, path } from "./deps.ts";

export async function getBuckets(): Promise<string[]> {
  const process = Deno.run({
    cmd: ["aws", "s3", "ls"],
    stdin: "null",
    stdout: "piped",
    stderr: "null",
  });
  const stdout = await process.output();
  const buckets = utf8Decode(stdout).slice(0, -1).split("\n");
  return buckets;
}

export async function getContents(bucketName: string): Promise<string[]> {
  const process = Deno.run({
    cmd: ["aws", "s3", "ls", bucketName, "--recursive"],
    stdin: "null",
    stdout: "piped",
    stderr: "null",
  });

  const stdout = await process.output();
  const contents = utf8Decode(stdout).slice(0, -1).split("\n");

  return contents;
}
