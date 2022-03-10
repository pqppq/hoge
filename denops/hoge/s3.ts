import * as datetime from "https://deno.land/std@0.129.0/datetime/mod.ts";

export async function s3(bucketName?: string): Promise<string> {
  const p = Deno.run({
    cmd: [
      "aws",
      "s3",
      "ls",
      bucketName || "",
      "--human-readable",
      "--recursive",
    ],
    stdin: "null",
    stdout: "piped",
    stderr: "null",
  });
  const stdout = await p.output();
  const decoder = new TextDecoder();
  return decoder.decode(stdout);
}
