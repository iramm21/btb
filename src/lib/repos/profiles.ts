import { z } from 'zod';
import { prisma } from '../db';

const userIdSchema = z.string().min(1);
const profileDataSchema = z.object({
  nickname: z.string().optional(),
  fav_team: z.number().int().optional(),
  risk_profile: z.enum(['safe', 'balanced', 'spicy']),
});

export async function getProfile(userId: string) {
  const id = userIdSchema.parse(userId);
  return prisma.profile.findUnique({
    where: { id },
    include: { favTeam: true },
  });
}

export async function upsertProfile(
  userId: string,
  data: {
    nickname?: string;
    fav_team?: number;
    risk_profile: 'safe' | 'balanced' | 'spicy';
  },
) {
  const id = userIdSchema.parse(userId);
  const parsed = profileDataSchema.parse(data);

  await prisma.user.upsert({
    where: { id },
    update: {},
    create: { id },
  });

  return prisma.profile.upsert({
    where: { id },
    update: {
      nickname: parsed.nickname,
      favTeamId: parsed.fav_team,
      riskProfile: parsed.risk_profile,
    },
    create: {
      id,
      nickname: parsed.nickname,
      favTeamId: parsed.fav_team,
      riskProfile: parsed.risk_profile,
    },
    include: { favTeam: true },
  });
}
