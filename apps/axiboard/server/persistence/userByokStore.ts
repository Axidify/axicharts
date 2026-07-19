import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ByokConfig } from "../types";

export type UserByokStore = {
  getByok(userId: string): Promise<ByokConfig | null>;
  saveByok(userId: string, byok: ByokConfig): Promise<void>;
};

function deriveKey(secret: string): Buffer {
  return createHash("sha256").update(secret).digest();
}

function encrypt(secret: string, value: unknown): string {
  const key = deriveKey(secret);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(value), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

function decrypt<T>(secret: string, encoded: string): T | null {
  try {
    const key = deriveKey(secret);
    const buf = Buffer.from(encoded, "base64url");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const encrypted = buf.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
    return JSON.parse(plaintext) as T;
  } catch {
    return null;
  }
}

export class FileUserByokStore implements UserByokStore {
  constructor(
    private readonly dataDir: string,
    private readonly secret: string,
  ) {}

  private userPath(userId: string): string {
    const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, "_");
    return path.join(this.dataDir, "users", safeId, "byok.enc");
  }

  async getByok(userId: string): Promise<ByokConfig | null> {
    try {
      const raw = await readFile(this.userPath(userId), "utf8");
      return decrypt<ByokConfig>(this.secret, raw);
    } catch {
      return null;
    }
  }

  async saveByok(userId: string, byok: ByokConfig): Promise<void> {
    const target = this.userPath(userId);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, encrypt(this.secret, byok), "utf8");
  }
}

export { encrypt, decrypt };
