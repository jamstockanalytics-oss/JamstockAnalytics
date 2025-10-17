export interface JSECompany {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  market_cap?: number;
  current_price?: number;
  description: string;
  website?: string;
  founded_year?: number;
  employees?: number;
}

export interface CompanyAnalysis {
  company: JSECompany;
  overall_score: number; // 1-10
  recommendation: 'BUY' | 'HOLD' | 'SELL' | 'STRONG_BUY' | 'STRONG_SELL';
  red_flags: string[];
  strengths: string[];
  opportunities: string[];
  risks: string[];
  ai_insights: string;
  price_target?: number;
  confidence_level: number; // 1-10
  last_updated: string;
}

// Jamaica Stock Exchange Companies Data
export const JSE_COMPANIES: JSECompany[] = [
  {
    id: 'ncbfg',
    symbol: 'NCBFG',
    name: 'NCB Financial Group Limited',
    sector: 'Financial Services',
    description: 'Leading financial services group in Jamaica, offering banking, insurance, and investment services.',
    website: 'https://www.ncbfg.com',
    founded_year: 1977,
    employees: 5000
  },
  {
    id: 'sgj',
    symbol: 'SGJ',
    name: 'Scotia Group Jamaica Limited',
    sector: 'Financial Services',
    description: 'Major commercial banking group providing comprehensive financial services across Jamaica.',
    website: 'https://www.scotiabank.com/jm',
    founded_year: 1889,
    employees: 3000
  },
  {
    id: 'jmmb',
    symbol: 'JMMB',
    name: 'JMMB Group Limited',
    sector: 'Financial Services',
    description: 'Investment and merchant banking group with focus on wealth management and capital markets.',
    website: 'https://www.jmmb.com',
    founded_year: 1992,
    employees: 1500
  },
  {
    id: 'bgl',
    symbol: 'BGL',
    name: 'Barita Investments Limited',
    sector: 'Financial Services',
    description: 'Investment company providing securities trading, portfolio management, and financial advisory services.',
    website: 'https://www.barita.com',
    founded_year: 1977,
    employees: 200
  },
  {
    id: 'jse',
    symbol: 'JSE',
    name: 'Jamaica Stock Exchange Limited',
    sector: 'Financial Services',
    description: 'The primary stock exchange in Jamaica, facilitating trading of securities and providing market infrastructure.',
    website: 'https://www.jamstockex.com',
    founded_year: 1969,
    employees: 100
  },
  {
    id: 'sgl',
    symbol: 'SGL',
    name: 'Sagicor Group Jamaica Limited',
    sector: 'Insurance',
    description: 'Leading insurance and financial services company with strong presence in life and general insurance.',
    website: 'https://www.sagicor.com',
    founded_year: 1970,
    employees: 2000
  },
  {
    id: 'jps',
    symbol: 'JPS',
    name: 'Jamaica Public Service Company Limited',
    sector: 'Utilities',
    description: 'Electric utility company providing electricity generation, transmission, and distribution services.',
    website: 'https://www.jpsco.com',
    founded_year: 1923,
    employees: 1500
  },
  {
    id: 'wco',
    symbol: 'WCO',
    name: 'Wisynco Group Limited',
    sector: 'Consumer Goods',
    description: 'Manufacturing and distribution company specializing in beverages, food products, and consumer goods.',
    website: 'https://www.wisynco.com',
    founded_year: 1985,
    employees: 800
  },
  {
    id: 'kgn',
    symbol: 'KGN',
    name: 'Kingston Wharves Limited',
    sector: 'Transportation',
    description: 'Port and logistics company providing cargo handling, warehousing, and shipping services.',
    website: 'https://www.kwl.com.jm',
    founded_year: 1956,
    employees: 400
  },
  {
    id: 'cib',
    symbol: 'CIB',
    name: 'Caribbean Cement Company Limited',
    sector: 'Materials',
    description: 'Leading cement manufacturer in Jamaica, producing and distributing cement and related products.',
    website: 'https://www.caribcement.com',
    founded_year: 1952,
    employees: 600
  },
  {
    id: 'jwl',
    symbol: 'JWL',
    name: 'Jamaica Broilers Group Limited',
    sector: 'Agriculture',
    description: 'Integrated poultry and agriculture company involved in poultry production, feed manufacturing, and farming.',
    website: 'https://www.jamaicabroilers.com',
    founded_year: 1958,
    employees: 1200
  },
  {
    id: 'dgl',
    symbol: 'DGL',
    name: 'Derrimon Trading Company Limited',
    sector: 'Consumer Goods',
    description: 'Retail and distribution company operating supermarkets and providing consumer goods distribution.',
    website: 'https://www.derrimon.com',
    founded_year: 1990,
    employees: 300
  }
];

export async function getJSECompanies(): Promise<JSECompany[]> {
  // In a real app, this would fetch from an API
  return JSE_COMPANIES;
}

export async function getCompanyBySymbol(symbol: string): Promise<JSECompany | null> {
  const companies = await getJSECompanies();
  return companies.find(company => company.symbol === symbol) || null;
}

export async function getCompaniesBySector(sector: string): Promise<JSECompany[]> {
  const companies = await getJSECompanies();
  return companies.filter(company => company.sector === sector);
}

export async function searchCompanies(query: string): Promise<JSECompany[]> {
  const companies = await getJSECompanies();
  const lowercaseQuery = query.toLowerCase();
  
  return companies.filter(company => 
    company.name.toLowerCase().includes(lowercaseQuery) ||
    company.symbol.toLowerCase().includes(lowercaseQuery) ||
    company.sector.toLowerCase().includes(lowercaseQuery)
  );
}
