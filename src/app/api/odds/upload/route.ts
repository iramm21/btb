import uploadFromBuffer from '../../../../features/odds/uploadFromBuffer';

export async function POST(req: Request): Promise<Response> {
  if (req.headers.get('x-demo-admin') !== '1') {
    return new Response('Unauthorized', { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return new Response('Invalid multipart', { status: 400 });
  }
  const file = form.get('file');
  if (!(file instanceof File)) {
    return new Response('Missing file', { status: 400 });
  }
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const result = await uploadFromBuffer(buf);
    return Response.json(result);
  } catch (err: any) {
    return new Response(err.message || 'Invalid CSV', { status: 400 });
  }
}
