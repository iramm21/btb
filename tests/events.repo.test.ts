import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { PrismaClient as MockClient } from './prismaMock';

vi.mock('@prisma/client', () => ({ PrismaClient: MockClient }));

let prisma: PrismaClient;
let logEvent: typeof import('../src/lib/repos/events').logEvent;
let getRecentEvents: typeof import('../src/lib/repos/events').getRecentEvents;

beforeAll(async () => {
  ({ prisma } = await import('../src/lib/db'));
  ({ logEvent, getRecentEvents } = await import('../src/lib/repos/events'));
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('events repo', () => {
  it('logs and queries events', async () => {
    await logEvent({ userId: 'u1', event: 'builder_open', props: { fixtureId: 1, risk: 'safe' } });
    await logEvent({ userId: null, event: 'copy_slip', props: { fixtureId: 1, risk: 'safe', legsCount: 2 } });

    const recent = await getRecentEvents();
    expect(recent.length).toBe(2);
    const events = recent.map((e: any) => e.event);
    expect(events).toContain('builder_open');
    expect(events).toContain('copy_slip');
    const builder = recent.find((e: any) => e.event === 'builder_open');
    expect(builder?.propsJson).toEqual({ fixtureId: 1, risk: 'safe' });

    const userEvents = await getRecentEvents({ userId: 'u1' });
    expect(userEvents.length).toBe(1);
    expect(userEvents[0].event).toBe('builder_open');
  });
});
