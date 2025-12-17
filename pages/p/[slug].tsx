import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { prisma } from '../../lib/prisma'



interface ProjectPageProps {
  project: {
    id: string
    user_name: string
    slug: string
    created_at: string
    expires_at: string
    projectMessage?: {
      message: string
    }
  } | null
  error?: string
}

export default function ProjectPage({ project, error }: ProjectPageProps) {
  if (error) {
    return (
      <>
        <Head>
          <title>Error - webPageForYou</title>
        </Head>
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
          <h1 style={{ color: '#e74c3c' }}>{error}</h1>
          <Link href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>Go Home</Link>
        </div>
      </>
    )
  }

  if (!project) {
    return (
      <>
        <Head>
          <title>Project Not Found - webPageForYou</title>
        </Head>
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
          <h1 style={{ color: '#e74c3c' }}>Project Not Found</h1>
          <p>The requested project does not exist.</p>
          <Link href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>Go Home</Link>
        </div>
      </>
    )
  }

  const messageToDisplay = project.projectMessage?.message || ''
  // メッセージの最初に30文字のハイフンと改行を追加（リンクプレビュー対策）
  const paddingText: string = 'ーーーーーーーーー\nーーーーーーーーーーーーーー\nーーーーーーーーーーーー'

  return (
    <>
      <Head>
        <title>webPageForYou</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

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
}

// 動的パスの生成（初回ビルド時は空配列、リクエスト時に生成）
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking' // 初回アクセス時に生成し、その後キャッシュ
  }
}

// ISR: 3日間キャッシュ（259200秒 = 3日 × 24時間 × 60分 × 60秒）
export const getStaticProps: GetStaticProps = async ({ params }) => { //pramsとはNext.js自身がエンドポイントに対して投げるcontextオブジェクトの一部
  const { slug } = params as { slug: string }

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

      return {
        props: {
          project: null,
          error: exists ? 'Project has expired' : 'Project not found'
        },
        revalidate: 259200 // 3日後に再検証
      }
    }

    return {
      props: {
        project: {
          ...project,
          created_at: project.created_at.toISOString(),
          expires_at: project.expires_at.toISOString()
        }
      },
      revalidate: 259200 // 3日間キャッシュ（この期間中は同じレスポンスを返す）
    }
  } catch (error) {
    console.error('Database error:', error)
    return {
      props: {
        project: null,
        error: 'Server error'
      },
      revalidate: 3600 // エラー時は1時間後に再試行
    }
  }
}
