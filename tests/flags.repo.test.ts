import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { PrismaClient as MockClient } from './prismaMock';

vi.mock('@prisma/client', () => ({ PrismaClient: MockClient }));

let prisma: PrismaClient;
let listFlags: () => Promise<any[]>;
let upsertFlag: (input: { key: string; enabled: boolean; payload_json?: any }) => Promise<any>;

beforeAll(async () => {
  ({ prisma } = await import('../src/lib/db'));
  ({ listFlags, upsertFlag } = await import('../src/lib/repos/flags'));
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('feature flags repo', () => {
  it('creates and updates flags', async () => {
    await upsertFlag({ key: 'test', enabled: false });
    let flags = await listFlags();
    expect(flags.find((f) => f.key === 'test')?.enabled).toBe(false);
    await upsertFlag({ key: 'test', enabled: true, payload_json: { foo: 'bar' } });
    flags = await listFlags();
    const flag = flags.find((f) => f.key === 'test');
    expect(flag?.enabled).toBe(true);
    expect(flag?.payloadJson).toEqual({ foo: 'bar' });
  });
});
