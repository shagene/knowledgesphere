import dynamic from 'next/dynamic'

const SavedQuizzesComponent = dynamic(() => import('@/components/saved-quizzes'), { ssr: false })

export default function SavedQuizzesPage() {
  return (
    <div>
      <SavedQuizzesComponent />
    </div>
  )
}