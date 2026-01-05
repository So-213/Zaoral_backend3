import Link from 'next/link'

export default function NotFound() {
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
      <h1 style={{ color: '#e74c3c' }}>Project Not Found</h1>
      <p>The requested project does not exist.</p>
      <Link href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>Go Home</Link>
    </div>
  )
}

