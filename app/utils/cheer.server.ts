import { prisma } from './prisma.server'
import { CheerStyle, Prisma } from '@prisma/client'

export const createCheer = async (message: string, userId: string, recipientId: string, style: CheerStyle) => {
  await prisma.cheer.create({
    data: {
      message,
      style,
      author: {
        connect: {
          id: userId,
        },
      },
      recipient: {
        connect: {
          id: recipientId,
        },
      },
    },
  })
}

export const getFilteredCheer = async (
    userId: string,
    sortFilter: Prisma.CheerOrderByWithRelationInput,
    whereFilter: Prisma.CheerWhereInput,
  ) => {
    return await prisma.cheer.findMany({
      select: {
        id: true,
        style: true,
        message: true,
        author: {
          select: {
            profile: true,
          },
        },
      },
      orderBy: {
        ...sortFilter,
      },
      where: {
        recipientId: userId,
        ...whereFilter,
      },
    })
  }