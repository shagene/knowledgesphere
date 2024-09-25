import Link from "next/link"
import { BookOpen } from "lucide-react"

export function Navigation() {
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center bg-slate-50">
      <Link className="flex items-center justify-center" href="/">
        <BookOpen className="h-6 w-6 text-indigo-500" />
        <span className="sr-only">Quiz App</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <Link className="text-sm font-medium hover:underline underline-offset-4" href="/">
          Home
        </Link>
        <Link className="text-sm font-medium hover:underline underline-offset-4" href="/create">
          Create
        </Link>
        <Link className="text-sm font-medium hover:underline underline-offset-4" href="/saved">
          Saved
        </Link>
      </nav>
    </header>
  )
}