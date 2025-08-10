import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

export function handlerToServer(handler: (req: Request) => Promise<Response>) {
  return createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = `http://localhost${req.url}`;
    const chunks: Uint8Array[] = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const body = Buffer.concat(chunks);
    const request = new Request(url, {
      method: req.method,
      headers: req.headers as Record<string, string>,
      body: body.length > 0 ? body : undefined,
    });
    const response = await handler(request);
    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    const respBody = Buffer.from(await response.arrayBuffer());
    res.end(respBody);
  });
}
