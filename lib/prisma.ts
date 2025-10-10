import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 環境変数が設定されていない場合はダミーのクライアントを作成
const createPrismaClient = () => {
  try {
    return new PrismaClient()
  } catch (error) {
    console.warn('Prisma client could not be initialized:', error)
    // ダミーのクライアントを返す（実際のDB操作は失敗するが、アプリは起動する）
    return {} as PrismaClient
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
