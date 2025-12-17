import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Project ID is required'
      })
    }

    try {
      // Prismaクライアントが正しく初期化されているかチェック
      if (!prisma || typeof prisma.project === 'undefined') {
        return res.status(503).json({
          error: 'Database not configured',
          message: 'Please configure DATABASE_URL environment variable'
        })
      }

      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          projectMessage: true
        }
      })

      if (!project) {
        return res.status(404).json({
          error: 'Project not found',
          projectId: id
        })
      }

      res.status(200).json({
        message: 'Project retrieved successfully',
        data: project
      })
    } catch (error) {
      console.error('Database error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Database connection failed'
      })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
