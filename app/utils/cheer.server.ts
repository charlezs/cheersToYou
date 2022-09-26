import { prisma } from './prisma.server'
import { CheerStyle } from '@prisma/client'

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