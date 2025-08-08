import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

export function handlerToServer(handler: (req: Request) => Promise<Response>) {
  return createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = `http://localhost${req.url}`;
    const request = new Request(url, {
      method: req.method,
      headers: req.headers as Record<string, string>,
    });
    const response = await handler(request);
    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    const body = Buffer.from(await response.arrayBuffer());
    res.end(body);
  });
}
