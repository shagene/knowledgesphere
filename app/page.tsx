import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamically import the HomePage component with SSR disabled
const HomePage = dynamic(
  () => import('@/components/home-page').then((mod) => mod.HomePage),
  { ssr: false }
)

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePage />
    </Suspense>
  )
}
