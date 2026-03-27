import fs from 'fs'
import path from 'path'

const DATA = path.join(process.cwd(), 'data')

function read<T>(file: string, def: T): T {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA, file), 'utf8'))
  } catch {
    return def
  }
}

function write<T>(file: string, data: T) {
  fs.mkdirSync(DATA, { recursive: true })
  fs.writeFileSync(path.join(DATA, file), JSON.stringify(data, null, 2))
}

export type Article = {
  id: string
  titleHe: string
  titleEn: string
  excerptHe: string
  excerptEn: string
  bodyHe: string
  bodyEn: string
  categoryHe: string
  categoryEn: string
  image: string
  date: string
  published: boolean
}

export type Instructor = {
  id: string
  nameHe: string
  nameEn: string
  roleHe: string
  roleEn: string
  bioHe: string
  bioEn: string
  image: string
  order: number
}

export type SiteContent = {
  heroSubHe: string
  heroSubEn: string
  aboutParaHe: string[]
  aboutParaEn: string[]
}

const defaultContent: SiteContent = {
  heroSubHe: 'קרב מגע דינמי עם מאור לוי — שיטה מעשית לכל גיל ורמה.',
  heroSubEn: 'Dynamic Krav Maga with Maor Levi — a practical system for every age and level.',
  aboutParaHe: ['מאור לוי הוא מדריך קרב מגע בכיר עם שנים של ניסיון אמיתי.'],
  aboutParaEn: ['Maor Levi is a senior Krav Maga instructor with years of real field experience.'],
}

export const db = {
  articles: {
    list: (): Article[] => read<Article[]>('articles.json', []),
    get: (id: string): Article | undefined =>
      read<Article[]>('articles.json', []).find(a => a.id === id),
    create: (data: Omit<Article, 'id'>): Article => {
      const articles = read<Article[]>('articles.json', [])
      const article: Article = { ...data, id: Date.now().toString() }
      write('articles.json', [...articles, article])
      return article
    },
    update: (id: string, data: Partial<Article>): Article | null => {
      const articles = read<Article[]>('articles.json', [])
      const idx = articles.findIndex(a => a.id === id)
      if (idx === -1) return null
      articles[idx] = { ...articles[idx], ...data }
      write('articles.json', articles)
      return articles[idx]
    },
    delete: (id: string): boolean => {
      const articles = read<Article[]>('articles.json', [])
      const filtered = articles.filter(a => a.id !== id)
      if (filtered.length === articles.length) return false
      write('articles.json', filtered)
      return true
    },
  },
  instructors: {
    list: (): Instructor[] => read<Instructor[]>('instructors.json', []),
    get: (id: string): Instructor | undefined =>
      read<Instructor[]>('instructors.json', []).find(i => i.id === id),
    create: (data: Omit<Instructor, 'id'>): Instructor => {
      const instructors = read<Instructor[]>('instructors.json', [])
      const instructor: Instructor = { ...data, id: Date.now().toString() }
      write('instructors.json', [...instructors, instructor])
      return instructor
    },
    update: (id: string, data: Partial<Instructor>): Instructor | null => {
      const instructors = read<Instructor[]>('instructors.json', [])
      const idx = instructors.findIndex(i => i.id === id)
      if (idx === -1) return null
      instructors[idx] = { ...instructors[idx], ...data }
      write('instructors.json', instructors)
      return instructors[idx]
    },
    delete: (id: string): boolean => {
      const instructors = read<Instructor[]>('instructors.json', [])
      const filtered = instructors.filter(i => i.id !== id)
      if (filtered.length === instructors.length) return false
      write('instructors.json', filtered)
      return true
    },
  },
  content: {
    get: (): SiteContent => read<SiteContent>('content.json', defaultContent),
    update: (data: Partial<SiteContent>): SiteContent => {
      const current = read<SiteContent>('content.json', defaultContent)
      const updated = { ...current, ...data }
      write('content.json', updated)
      return updated
    },
  },
}
