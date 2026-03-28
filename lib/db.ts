import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
  phone: string
  email: string
  instagram: string
  facebook: string
  whatsapp: string
}

const defaultContent: SiteContent = {
  heroSubHe: '',
  heroSubEn: '',
  aboutParaHe: [],
  aboutParaEn: [],
  phone: '',
  email: '',
  instagram: '',
  facebook: '',
  whatsapp: '',
}

export const db = {
  articles: {
    list: async (): Promise<Article[]> => {
      const { data } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })
      return (data || []) as Article[]
    },
    get: async (id: string): Promise<Article | undefined> => {
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single()
      return data as Article | undefined
    },
    create: async (data: Omit<Article, 'id'>): Promise<Article> => {
      const { data: article } = await supabase
        .from('articles')
        .insert(data)
        .select()
        .single()
      return article as Article
    },
    update: async (id: string, data: Partial<Article>): Promise<Article | null> => {
      const { data: article } = await supabase
        .from('articles')
        .update(data)
        .eq('id', id)
        .select()
        .single()
      return article as Article | null
    },
    delete: async (id: string): Promise<boolean> => {
      const { error } = await supabase.from('articles').delete().eq('id', id)
      return !error
    },
  },
  instructors: {
    list: async (): Promise<Instructor[]> => {
      const { data } = await supabase
        .from('instructors')
        .select('*')
        .order('order')
      return (data || []) as Instructor[]
    },
    get: async (id: string): Promise<Instructor | undefined> => {
      const { data } = await supabase
        .from('instructors')
        .select('*')
        .eq('id', id)
        .single()
      return data as Instructor | undefined
    },
    create: async (data: Omit<Instructor, 'id'>): Promise<Instructor> => {
      const { data: instructor } = await supabase
        .from('instructors')
        .insert(data)
        .select()
        .single()
      return instructor as Instructor
    },
    update: async (id: string, data: Partial<Instructor>): Promise<Instructor | null> => {
      const { data: instructor } = await supabase
        .from('instructors')
        .update(data)
        .eq('id', id)
        .select()
        .single()
      return instructor as Instructor | null
    },
    delete: async (id: string): Promise<boolean> => {
      const { error } = await supabase.from('instructors').delete().eq('id', id)
      return !error
    },
  },
  content: {
    get: async (): Promise<SiteContent> => {
      const { data } = await supabase
        .from('site_content')
        .select('*')
        .eq('id', 1)
        .single()
      return (data as SiteContent) || defaultContent
    },
    update: async (data: Partial<SiteContent>): Promise<SiteContent> => {
      const { data: updated } = await supabase
        .from('site_content')
        .upsert({ id: 1, ...data })
        .select()
        .single()
      return updated as SiteContent
    },
  },
}
