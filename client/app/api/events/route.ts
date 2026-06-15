export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  let responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();

  writer.write(new TextEncoder().encode('retry: 10000\n\n'));
  
  // Register this client to global events
  const onRefresh = () => {
    writer.write(new TextEncoder().encode('data: refresh\n\n'));
  };

  // We use global context object to store listeners since this runs in a Next.js Edge/Serverless function
  const globalAny = global as any;
  if (!globalAny.sseClients) {
    globalAny.sseClients = new Set();
  }
  
  globalAny.sseClients.add(onRefresh);

  request.signal.addEventListener('abort', () => {
    globalAny.sseClients.delete(onRefresh);
    writer.close();
  });

  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
