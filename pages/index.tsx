import { GetServerSideProps } from 'next'



interface HomePageProps {
  message: string
  timestamp: string
  version: string
}

export default function HomePage({ message, timestamp, version }: HomePageProps) {
  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      textAlign: 'center', 
      padding: '50px',
      maxWidth: '600px',
      margin: '0 auto'
    }}>

    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      message: 'Server is running!',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  }
}


