import Link from 'next/link'
import { prisma } from '../../../lib/prisma'
import { notFound } from 'next/navigation'

interface ProjectPageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  // 動的パスの生成（初回ビルド時は空配列、リクエスト時に生成）
  return []
}

// ISR: 3日間キャッシュ（259200秒 = 3日 × 24時間 × 60分 × 60秒）
export const revalidate = 259200

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = params

  try {
    // 期限切れチェックをデータベースクエリで実行（パフォーマンス向上）
    const now = new Date()
    
    const project = await prisma.project.findFirst({
      where: {
        slug,
        expires_at: {
          gt: now // 期限切れでないもののみ取得
        }
      },
      select: {
        id: true,
        user_name: true,
        slug: true,
        created_at: true,
        expires_at: true,
        projectMessage: {
          select: {
            message: true
          }
        }
      }
    })

    if (!project) {
      // プロジェクトが存在しないか、期限切れの場合
      const exists = await prisma.project.findUnique({
        where: { slug },
        select: { id: true }
      })

      if (exists) {
        return (
          <div style={{ 
            fontFamily: 'Arial, sans-serif', 
            textAlign: 'center', 
            padding: '50px',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <h1 style={{ color: '#e74c3c' }}>Project has expired</h1>
            <Link href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>Go Home</Link>
          </div>
        )
      }

      notFound()
    }

    const messageToDisplay = project.projectMessage?.message || ''
    // メッセージの最初に30文字のハイフンと改行を追加（リンクプレビュー対策）
    const paddingText: string = 'ーーーーーーーーー\nーーーーーーーーーーーーーー\nーーーーーーーーーーーー'

    return (
      <>
        <div style={{
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          margin: 0,
          padding: 0,
          background: 'white',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <div style={{
            position: 'relative',
            maxWidth: '600px',
            width: '90%',
            textAlign: 'center'
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/p/snp.jpg"
              alt="Snoopy"
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '20px',
                boxShadow: '0 20px 40px rgba(249, 245, 245, 0)',
                display: 'block'
              }}
            />
            {/* パディング部分（吹き出しから切り離し） */}
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              fontSize: '0.6em',
              color: 'white',
              textAlign: 'left',
              whiteSpace: 'pre-wrap'
            }}>
              {paddingText}
            </div>
            {/* 吹き出し */}
            <div style={{
              position: 'absolute',
              top: '10%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '1.5em',
              color: '#333',
              lineHeight: '1.4',
              width: '80%',
              textAlign: 'center',
              background: 'white',
              padding: '20px',
              borderRadius: '10px',
              border: '2px solid #888',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              whiteSpace: 'pre-wrap'
            }}>
              {messageToDisplay}
              <div style={{
                position: 'absolute',
                bottom: '-15px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '15px solid transparent',
                borderRight: '15px solid transparent',
                borderTop: '15px solid #888'
              }}></div>
            </div>
          </div>
        </div>
      </>
    )
  } catch (error) {
    console.error('Database error:', error)
    return (
      <div style={{ 
        fontFamily: 'Arial, sans-serif', 
        textAlign: 'center', 
        padding: '50px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h1 style={{ color: '#e74c3c' }}>Server error</h1>
        <Link href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>Go Home</Link>
      </div>
    )
  }
}

export async function generateMetadata({ params }: ProjectPageProps) {
  return {
    title: 'webPageForYou',
  }
}

