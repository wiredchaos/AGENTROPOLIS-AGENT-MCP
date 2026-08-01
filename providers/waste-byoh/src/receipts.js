import { mkdir, appendFile } from "node:fs/promises";
import { dirname } from "node:path";
import { createHash, randomUUID } from "node:crypto";

export async function writeReceipt(path, receipt) {
  const record = { receipt_id: randomUUID(), ...receipt };
  const canonical = JSON.stringify(record);
  record.sha256 = createHash("sha256").update(canonical).digest("hex");
  await mkdir(dirname(path), { recursive: true });
  await appendFile(path, `${JSON.stringify(record)}\n`, { mode: 0o600 });
  return record;
}
