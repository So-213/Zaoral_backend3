import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  if (!id || typeof id !== 'string') {
    return NextResponse.json(
      {
        error: 'Project ID is required'
      },
      { status: 400 }
    )
  }

  try {
    // Prismaクライアントが正しく初期化されているかチェック
    if (!prisma || typeof prisma.project === 'undefined') {
      return NextResponse.json(
        {
          error: 'Database not configured',
          message: 'Please configure DATABASE_URL environment variable'
        },
        { status: 503 }
      )
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        projectMessage: true
      }
    })

    if (!project) {
      return NextResponse.json(
        {
          error: 'Project not found',
          projectId: id
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Project retrieved successfully',
      data: project
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Database connection failed'
      },
      { status: 500 }
    )
  }
}

