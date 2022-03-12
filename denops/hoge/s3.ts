import * as datetime from "https://deno.land/std@0.129.0/datetime/mod.ts";
import { utf8Decode } from "./deps.ts";

export async function getBuckets(): Promise<string[]> {
  const process = Deno.run({
    cmd: ["aws", "s3", "ls", "--human-readable"],
    stdin: "null",
    stdout: "piped",
    stderr: "null",
  });

  const stdout = await process.output();
  return utf8Decode(stdout)
    .slice(0, -1) // remove last '\n'
    .split("\n");
}

export async function getBucketObject(bucketName: string): Promise<string[]> {
  const process = Deno.run({
    cmd: ["aws", "s3", "ls", bucketName, "--human-readable", "--recursive"],
    stdin: "null",
    stdout: "piped",
    stderr: "null",
  });

  const stdout = await process.output();
  return utf8Decode(stdout)
    .slice(0, -1) // remove last '\n'
    .split("\n");
}
