import fs from "fs/promises";
import path from "path";

const createJunkFileOfLength = (length: number, filename: string) => {
  const junk = Buffer.alloc(length);
  junk.fill("x");
  return fs.writeFile(filename, junk);
};

createJunkFileOfLength(
  5 * 1024 * 1024,
  path.join(__dirname, "not_whole_part.txt")
);
createJunkFileOfLength(
  5 * 1024 * 1024 * 2,
  path.join(__dirname, "two_whole_parts.txt")
);
