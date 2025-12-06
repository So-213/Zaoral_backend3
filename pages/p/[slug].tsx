import { GetServerSideProps } from 'next'
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
        background: 'linear-gradient(135deg,rgb(238, 225, 234) 0%,rgb(245, 241, 243) 100%)',
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
          <img
            src="/p/snp.jpg"
            alt="Snoopy"
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              display: 'block'
            }}
          />
          <div style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '1.5em',
            color: '#333',
            lineHeight: '1.4',
            width: '80%',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            {messageToDisplay}
          </div>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const { slug } = params as { slug: string }

  try {
    // Prismaクライアントが正しく初期化されているかチェック
    if (!prisma || typeof prisma.project === 'undefined') {
      return {
        props: {
          project: null,
          error: 'Database not configured'
        }
      }
    }

    const project = await prisma.project.findUnique({
      where: { slug },
      include: {
        projectMessage: true
      }
    })

    if (!project) {
      return {
        props: {
          project: null,
          error: 'Project not found'
        }
      }
    }

    // 期限切れチェック
    if (project.expires_at && new Date() > new Date(project.expires_at)) {
      return {
        props: {
          project: null,
          error: 'Project has expired'
        }
      }
    }

    return {
      props: {
        project: {
          ...project,
          created_at: project.created_at.toISOString(),
          expires_at: project.expires_at.toISOString()
        }
      }
    }
  } catch (error) {
    console.error('Database error:', error)
    return {
      props: {
        project: null,
        error: 'Server error'
      }
    }
  }
}
