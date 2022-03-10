export async function s3(): Promise<string> {
  const p = Deno.run({
    cmd: ["aws", "s3", "ls"],
    stdin: "null",
    stdout: "piped",
    stderr: "null",
  });
  const stdout = await p.output();
  const decoder = new TextDecoder();

  return decoder.decode(stdout);
}
