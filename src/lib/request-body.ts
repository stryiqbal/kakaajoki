export type LimitedJsonBody =
  | { status: "ok"; body: unknown }
  | { status: "too-large" }
  | { status: "invalid" };

export async function readJsonBodyWithinLimit(
  request: Request,
  maxBytes: number,
): Promise<LimitedJsonBody> {
  const contentLengthHeader = request.headers.get("content-length");
  if (contentLengthHeader !== null) {
    if (!/^\d+$/.test(contentLengthHeader)) return { status: "invalid" };
    const contentLength = Number(contentLengthHeader);
    if (!Number.isSafeInteger(contentLength)) return { status: "invalid" };
    if (contentLength > maxBytes) return { status: "too-large" };
  }

  if (!request.body) return { status: "invalid" };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel().catch(() => undefined);
        return { status: "too-large" };
      }
      chunks.push(value);
    }
  } catch {
    return { status: "invalid" };
  } finally {
    reader.releaseLock();
  }

  const bodyBytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bodyBytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    const bodyText = new TextDecoder("utf-8", { fatal: true }).decode(bodyBytes);
    return { status: "ok", body: JSON.parse(bodyText) as unknown };
  } catch {
    return { status: "invalid" };
  }
}