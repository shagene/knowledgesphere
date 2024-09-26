import Link from "next/link"
import Image from "next/image"

export function Navigation() {
  return (
    <header className="px-4 lg:px-6 h-20 flex items-center bg-slate-50">
      <Link className="flex items-center justify-center" href="/">
        {/* <Image
          src="/knowledgesphere.png"
          alt="KnowledgeSphere Logo"
          width={48}
          height={48}
          className="h-12 w-12"
          priority
        /> */}
        <span className="ml-3 text-2xl font-semibold">KnowledgeSphere</span>
      </Link>
      <nav className="ml-auto flex gap-6 sm:gap-8">
        <Link className="text-base font-medium hover:underline underline-offset-4" href="/">
          Home
        </Link>
        <Link className="text-base font-medium hover:underline underline-offset-4" href="/create">
          Create
        </Link>
        <Link className="text-base font-medium hover:underline underline-offset-4" href="/saved">
          Saved
        </Link>
      </nav>
    </header>
  )
}