import { db } from '@/lib/db'
import HomeClient from './home-client'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [content, allArticles, instructors] = await Promise.all([
    db.content.get(),
    db.articles.list(),
    db.instructors.list(),
  ])
  const articles = allArticles.filter(a => a.published)
  return (
    <HomeClient
      initialContent={content}
      initialArticles={articles}
      initialInstructors={instructors}
    />
  )
}
