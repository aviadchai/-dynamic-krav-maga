import { createClient } from '@supabase/supabase-js'

const noStoreOptions = {
  global: {
    fetch: (url: RequestInfo | URL, options?: RequestInit) =>
      fetch(url, { ...options, cache: 'no-store' }),
  },
}

// Public client (read-only, respects RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  noStoreOptions
)

// Server-side admin client (bypasses RLS for write operations)
// Requires SUPABASE_SERVICE_ROLE_KEY env var — get it from Supabase dashboard → Project Settings → API
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      noStoreOptions
    )
  : supabase

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
  bodyImage?: string
  date: string
  published: boolean
  author: string
}

export type Instructor = {
  id: string
  nameHe: string
  nameEn: string
  roleHe: string
  roleEn: string
  bioHe: string
  bioEn: string
  popupBioHe?: string
  popupBioEn?: string
  image: string
  order: number
  isMain?: boolean
}

export type Senior = {
  id: string
  nameHe: string
  nameEn: string
  roleHe: string
  roleEn: string
  shortBioHe: string
  shortBioEn: string
  image: string
  order: number
}

export type Reel = {
  id: string
  url: string
  platform: string
  title: string
}

export type Testimonial = {
  name: string
  nameEn?: string
  roleHe: string
  roleEn: string
  textHe: string
  textEn: string
}

export type ServiceItem = {
  n: string
  he: string
  en: string
  dHe: string
  dEn: string
  bodyHe: string
  bodyEn: string
  image?: string
}

export type TimelineEntry = {
  id: string
  year: string
  titleHe: string
  titleEn: string
  textHe: string
  textEn: string
  image?: string
  order: number
}

export type SiteContent = {
  // Hero
  heroTitleHe: string
  heroTitleEn: string
  heroSubHe: string
  heroSubEn: string
  heroBtnPrimaryHe: string
  heroBtnPrimaryEn: string
  heroBtnSecondaryHe: string
  heroBtnSecondaryEn: string
  heroImage: string
  heroNum1Val: string
  heroNum1LblHe: string
  heroNum1LblEn: string
  heroNum2Val: string
  heroNum2LblHe: string
  heroNum2LblEn: string
  heroNum3Val: string
  heroNum3LblHe: string
  heroNum3LblEn: string
  // About
  aboutTitleHe: string
  aboutTitleEn: string
  aboutTagHe: string
  aboutTagEn: string
  aboutExcerptHe: string
  aboutExcerptEn: string
  aboutParaHe: string[]
  aboutParaEn: string[]
  aboutImage: string
  // Testimonials
  testimonials: Testimonial[]
  // Reels
  reels: Reel[]
  // Contact
  phone: string
  email: string
  instagram: string
  facebook: string
  whatsapp: string
  contactTitleHe: string
  contactTitleEn: string
  contactSubHe: string
  contactSubEn: string
  // Services
  services: ServiceItem[]
  // About timeline
  aboutTimeline: TimelineEntry[]
  // Announcement ticker items
  announcementItems?: { textHe: string; textEn: string; link?: string }[]
  // Brand
  brandColor: string
  brandColorSecondary: string
  brandColorText: string
  brandBg: string
  brandLogoUrl: string
  brandLogoLight: string
  badgePillHe: string
  badgePillEn: string
}

const defaultContent: SiteContent = {
  heroTitleHe: 'הגן על\nעצמך\nבאמת',
  heroTitleEn: 'DEFEND\nYOUR\nSELF',
  heroSubHe: '',
  heroSubEn: '',
  heroBtnPrimaryHe: 'התחל עכשיו',
  heroBtnPrimaryEn: 'Get Started',
  heroBtnSecondaryHe: 'גלה עוד',
  heroBtnSecondaryEn: 'Learn More',
  heroImage: '/images/hero.jpg',
  heroNum1Val: '15+',
  heroNum1LblHe: 'שנות ניסיון',
  heroNum1LblEn: 'Years Exp.',
  heroNum2Val: '500+',
  heroNum2LblHe: 'תלמידים',
  heroNum2LblEn: 'Students',
  heroNum3Val: '100%',
  heroNum3LblHe: 'מעשי',
  heroNum3LblEn: 'Practical',
  aboutTitleHe: 'לחימה\nשמגיעה\nמהשטח',
  aboutTitleEn: 'FIGHTING\nFROM THE\nFIELD',
  aboutTagHe: 'עלינו',
  aboutTagEn: 'About Us',
  aboutExcerptHe: '',
  aboutExcerptEn: '',
  aboutParaHe: [],
  aboutParaEn: [],
  aboutImage: '/images/about.jpg',
  testimonials: [
    { name: 'שירה כ. / Shira K.', roleHe: 'תלמידה פרטית', roleEn: 'Private Student', textHe: 'מאור הוא מדריך יוצא דופן. בזכותו הרגשתי ביטחון עצמי שלא הכרתי. ממליצה בחום לכולם.', textEn: 'Maor is an exceptional instructor. Thanks to him I found confidence I never had. Highly recommended.' },
    { name: 'דניאל מ. / Daniel M.', roleHe: 'מנהל HR', roleEn: 'HR Manager', textHe: 'הסדנה לצוות שלנו הייתה חוויה בלתי נשכחת. מקצועי, מרתק ומעשי לגמרי. נחזור בטח.', textEn: 'The workshop for our team was unforgettable. Professional, engaging, completely practical.' },
    { name: 'רחל א. / Rachel A.', roleHe: 'אמא לתלמיד', roleEn: 'Parent', textHe: 'שלחתי את בני למאור. אחרי חודש רואים שינוי אדיר — הרבה יותר בטוח ומרוכז בכל דבר.', textEn: 'Sent my son to Maor. After a month the change is huge — so much more confident and focused.' },
  ],
  reels: [
    { id: '1', url: 'https://www.instagram.com/reel/DTiFg_OlJFk/', platform: 'instagram', title: '' },
  ],
  services: [
    {
      n: '01', he: 'שיעורים פרטיים', en: 'Private Lessons',
      dHe: 'תוכנית אישית שנבנית בדיוק עבורך. בקצב שלך, ברמה שלך, עם מיקוד על המטרות האישיות שלך.',
      dEn: 'A personal program built exactly for you. Your pace, your level, your goals.',
      bodyHe: 'שיעורים פרטיים בקרב מגע הם הדרך המהירה והאפקטיבית ביותר להתקדם.\n\nכל שיעור מותאם אישית לפי הרמה הנוכחית שלך, המטרות שלך, והקצב שמתאים לך.',
      bodyEn: 'Private Krav Maga lessons are the fastest and most effective path to progress.\n\nEach lesson is customized to your current level, goals, and pace.',
      image: '',
    },
    {
      n: '02', he: 'שיעורי קבוצה', en: 'Group Classes',
      dHe: 'אימון קבוצתי אינטנסיבי ומהנה. ללמוד יחד, להתפתח יחד, באווירה שדוחפת אותך קדימה.',
      dEn: 'Intense and fun group training. Learn together, grow together in a motivating atmosphere.',
      bodyHe: 'שיעורי הקבוצה שלנו משלבים אימון גופני אינטנסיבי עם לימוד טכניקות קרב מגע.\n\nהאווירה הקבוצתית יוצרת מוטיבציה גבוהה.',
      bodyEn: 'Our group classes combine intense physical training with Krav Maga technique instruction.\n\nThe group atmosphere creates high motivation.',
      image: '',
    },
    {
      n: '03', he: 'סדנאות', en: 'Workshops',
      dHe: 'סדנאות ממוקדות לנשים, ילדים, ארגונים ומסגרות שונות. ניתן להתאים לכל קבוצה וצורך.',
      dEn: 'Focused workshops for women, children, organizations. Customized for any group and need.',
      bodyHe: 'הסדנאות שלנו מותאמות לקבוצות ומסגרות מגוונות — ניתן לקיים אותן בכל מקום ובכל פורמט.',
      bodyEn: 'Our workshops are tailored for diverse groups and settings — they can be held anywhere.',
      image: '',
    },
  ],
  aboutTimeline: [],
  phone: '',
  email: '',
  instagram: '',
  facebook: '',
  whatsapp: '',
  contactTitleHe: 'צור\nקשר',
  contactTitleEn: 'GET IN\nTOUCH',
  contactSubHe: 'שאלה? רוצים לקבוע שיעור ראשון? פשוט כתבו.',
  contactSubEn: 'Questions? Want to book a first class? Just write.',
  brandColor: '#EAFF00',
  brandColorSecondary: '',
  brandColorText: '#FFFFFF',
  brandBg: '#0A0A0A',
  brandLogoUrl: '',
  brandLogoLight: '',
  badgePillHe: 'מדריך מוסמך קרב מגע',
  badgePillEn: 'Certified Krav Maga Instructor',
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
      const { data: article } = await supabaseAdmin
        .from('articles')
        .insert(data)
        .select()
        .single()
      return article as Article
    },
    update: async (id: string, data: Partial<Article>): Promise<Article | null> => {
      const { data: article } = await supabaseAdmin
        .from('articles')
        .update(data)
        .eq('id', id)
        .select()
        .single()
      return article as Article | null
    },
    delete: async (id: string): Promise<boolean> => {
      const { error } = await supabaseAdmin.from('articles').delete().eq('id', id)
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
      const { data: instructor } = await supabaseAdmin
        .from('instructors')
        .insert(data)
        .select()
        .single()
      return instructor as Instructor
    },
    update: async (id: string, data: Partial<Instructor>): Promise<Instructor | null> => {
      const { data: instructor, error } = await supabaseAdmin
        .from('instructors')
        .update(data)
        .eq('id', id)
        .select()
        .single()
      if (error) console.error('[db.instructors.update] error:', error)
      return instructor as Instructor | null
    },
    delete: async (id: string): Promise<boolean> => {
      const { error } = await supabaseAdmin.from('instructors').delete().eq('id', id)
      return !error
    },
  },
  seniors: {
    list: async (): Promise<Senior[]> => {
      const { data } = await supabase
        .from('seniors')
        .select('*')
        .order('order')
      return (data || []) as Senior[]
    },
    create: async (data: Omit<Senior, 'id'>): Promise<{ data: Senior | null; error: string | null }> => {
      const { data: senior, error } = await supabaseAdmin
        .from('seniors')
        .insert(data)
        .select()
        .single()
      if (error) console.error('[db.seniors.create] error:', error)
      return { data: senior as Senior | null, error: error?.message || null }
    },
    update: async (id: string, data: Partial<Senior>): Promise<Senior | null> => {
      const { data: senior, error } = await supabaseAdmin
        .from('seniors')
        .update(data)
        .eq('id', id)
        .select()
        .single()
      if (error) console.error('[db.seniors.update] error:', error)
      return senior as Senior | null
    },
    delete: async (id: string): Promise<boolean> => {
      const { error } = await supabaseAdmin.from('seniors').delete().eq('id', id)
      return !error
    },
  },
  content: {
    get: async (): Promise<SiteContent> => {
      const { data } = await supabase
        .from('site_content')
        .select('content_data')
        .eq('id', 1)
        .single()
      const stored = (data as { content_data?: Partial<SiteContent> } | null)?.content_data || {}
      return { ...defaultContent, ...stored }
    },
    update: async (newData: Partial<SiteContent>): Promise<SiteContent> => {
      const { data: existing } = await supabase
        .from('site_content')
        .select('content_data')
        .eq('id', 1)
        .single()
      const stored = (existing as { content_data?: Partial<SiteContent> } | null)?.content_data || {}
      const merged: SiteContent = { ...defaultContent, ...stored, ...newData }
      await supabaseAdmin
        .from('site_content')
        .upsert({ id: 1, content_data: merged })
      return merged
    },
  },
}
