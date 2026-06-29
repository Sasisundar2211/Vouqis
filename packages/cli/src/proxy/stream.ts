import * as http from 'node:http'

/** Pipe a ReadableStream from an upstream response into a Node.js ServerResponse. */
export async function pipeStream(
  body: ReadableStream<Uint8Array> | null | undefined,
  res: http.ServerResponse,
): Promise<void> {
  if (!body) {
    res.end()
    return
  }
  const reader = body.getReader()
  try {
    for (;;) {
      const {done, value} = await reader.read()
      if (done) break
      res.write(value)
    }
  } finally {
    res.end()
  }
}
