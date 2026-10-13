export interface Newspaper {
  id: string;
  name: string;
  nativeName?: string;
  language: string;
  region: string;
  url: string;
  description: string;
  badge: string;
  tagColor: string;
}

export const NEWSPAPERS: Newspaper[] = [
  {
    id: 'eenadu',
    name: 'Eenadu',
    nativeName: 'ఈనాడు',
    language: 'Telugu',
    region: 'Andhra Pradesh & Telangana',
    url: 'https://www.eenadu.net',
    description: "The largest circulated Telugu daily newspaper, known for rigorous investigative journalism, regional district editions, and comprehensive news coverage.",
    badge: 'Official Telugu Daily',
    tagColor: 'bg-red-50 text-red-700 border-red-200',
  },
  {
    id: 'sakshi',
    name: 'Sakshi',
    nativeName: 'సాక్షి',
    language: 'Telugu',
    region: 'Andhra Pradesh & Telangana',
    url: 'https://www.sakshi.com',
    description: "Prominent Telugu newspaper covering politics, agricultural updates, district news, education notifications, and cinema.",
    badge: 'Official Telugu Daily',
    tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'andhra-jyothy',
    name: 'Andhra Jyothy',
    nativeName: 'ఆంధ్రజ్యోతి',
    language: 'Telugu',
    region: 'Andhra Pradesh & Telangana',
    url: 'https://www.andhrajyothy.com',
    description: "One of the most widely read Telugu daily newspapers, featuring analytical political columns, youth and education supplements, and cultural news.",
    badge: 'Official Telugu Daily',
    tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 'the-hindu',
    name: 'The Hindu',
    language: 'English',
    region: 'National (India)',
    url: 'https://www.thehindu.com',
    description: "India's premier English broadsheet, renowned for its editorial depth, credible journalism, objective reporting, and extensive use by civil service aspirants.",
    badge: 'National English Broadsheet',
    tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    id: 'indian-express',
    name: 'The Indian Express',
    language: 'English',
    region: 'National (India)',
    url: 'https://indianexpress.com',
    description: "Acclaimed for fearless investigative journalism ('Journalism of Courage'), in-depth explainer series, and national governance reporting.",
    badge: 'National English Daily',
    tagColor: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  {
    id: 'hindustan-times',
    name: 'Hindustan Times',
    language: 'English',
    region: 'National (India)',
    url: 'https://www.hindustantimes.com',
    description: "Leading national English daily offering timely breaking news, educational trends, tech news, and international affairs.",
    badge: 'National English Daily',
    tagColor: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  {
    id: 'times-of-india',
    name: 'The Times of India',
    language: 'English',
    region: 'National & Global',
    url: 'https://timesofindia.indiatimes.com',
    description: "The highest circulating English daily in India, delivering round-the-clock headlines across metro cities, science, business, and entertainment.",
    badge: 'National English Daily',
    tagColor: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    id: 'bbc-news',
    name: 'BBC News',
    language: 'English',
    region: 'International / Global',
    url: 'https://www.bbc.com/news',
    description: "The British Broadcasting Corporation's world news service, delivering verified global reporting, science features, and unbiased international perspectives.",
    badge: 'International Public Broadcaster',
    tagColor: 'bg-slate-100 text-slate-800 border-slate-300',
  },
];
