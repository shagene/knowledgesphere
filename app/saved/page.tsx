import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const SavedQuizzesComponent = dynamic(
  () => import('@/components/saved-quizzes'),
  { ssr: false }
)

export default function SavedQuizzesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SavedQuizzesComponent />
    </Suspense>
  )
}