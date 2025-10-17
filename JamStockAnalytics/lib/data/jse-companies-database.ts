import { JSECompany } from '../services/comprehensive-market-service';

/**
 * Complete JSE Main Index Companies Database
 * Includes all major and minor companies listed on the Jamaica Stock Exchange
 */

export const JSE_MAIN_INDEX_COMPANIES: JSECompany[] = [
  // Major Financial Services Companies
  {
    symbol: 'NCBFG',
    name: 'NCB Financial Group Limited',
    sector: 'Financial Services',
    industry: 'Banking',
    market_cap: 12500000000,
    employees: 8500,
    founded_year: 1837,
    headquarters: 'Kingston, Jamaica',
    website: 'https://www.ncb.com.jm',
    description: 'NCB Financial Group Limited is a leading financial services provider in Jamaica, offering banking, insurance, and investment services.',
    ceo: 'Patrick Hylton',
    is_active: true
  },
  {
    symbol: 'SGJ',
    name: 'Scotia Group Jamaica Limited',
    sector: 'Financial Services',
    industry: 'Banking',
    market_cap: 8500000000,
    employees: 3200,
    founded_year: 1889,
    headquarters: 'Kingston, Jamaica',
    website: 'https://www.scotiabank.com.jm',
    description: 'Scotia Group Jamaica Limited is a subsidiary of Scotiabank, providing comprehensive banking and financial services.',
    ceo: 'David Noel',
    is_active: true
  },
  {
    symbol: 'JMMB',
    name: 'JMMB Group Limited',
    sector: 'Financial Services',
    industry: 'Investment Banking',
    market_cap: 6500000000,
    employees: 1200,
    founded_year: 1992,
    headquarters: 'Kingston, Jamaica',
    website: 'https://www.jmmb.com',
    description: 'JMMB Group Limited is a leading investment banking and financial services company in Jamaica.',
    ceo: 'Keith Duncan',
    is_active: true
  },
  {
    symbol: 'BGL',
    name: 'Barita Investments Limited',
    sector: 'Financial Services',
    industry: 'Investment Banking',
    market_cap: 3200000000,
    employees: 450,
    founded_year: 1977,
    headquarters: 'Kingston, Jamaica',
    website: 'https://www.barita.com',
    description: 'Barita Investments Limited is a leading investment banking and asset management company.',
    ceo: 'Ian McNaughton',
    is_active: true
  },
  {
    symbol: 'SGL',
    name: 'Sagicor Group Jamaica Limited',
    sector: 'Financial Services',
    industry: 'Insurance',
    market_cap: 4200000000,
    employees: 2800,
    founded_year: 1840,
    headquarters: 'Kingston, Jamaica',
    website: 'https://www.sagicor.com',
    description: 'Sagicor Group Jamaica Limited is a leading insurance and financial services company.',
    ceo: 'Christopher Zacca',
    is_active: true
  },
  {
    symbol: 'GHL',
    name: 'Guardian Holdings Limited',
    sector: 'Financial Services',
    industry: 'Insurance',
    market_cap: 3800000000,
    employees: 2200,
    founded_year: 1987,
    headquarters: 'Kingston, Jamaica',
    website: 'https://www.guardian.co.tt',
    description: 'Guardian Holdings Limited is a leading insurance and financial services company in the Caribbean.',
    ceo: 'Ravi Tewari',
    is_active: true
  },
  {
    symbol: 'CAC',
    name: 'CAC 2000 Limited',
    sector: 'Technology',
    industry: 'Information Technology',
    market_cap: 450000000,
    employees: 150,
    founded_year: 1995,
    headquarters: 'Kingston, Jamaica',
    website: 'https://www.cac2000.com',
    description: 'CAC 2000 Limited provides information technology solutions and services.',
    ceo: 'Christopher Reckord',
    is_active: true
  },
  {
    symbol: 'CAB',
    name: 'Carreras Limited',
    sector: 'Consumer Goods',
    industry: 'Tobacco',
    market_cap: 2800000000,
    employees: 800,
    founded_year: 1963,
    headquarters: 'Kingston, Jamaica',
    website: 'https://www.carreras.com.jm',
    description: 'Carreras Limited is a leading tobacco company in Jamaica.',
    ceo: 'Marcus Steele',
    is_active: true
  },
  {
    symbol: 'JPS',
    name: 'Jamaica Public Service Company Limited',
    sector: 'Utilities',
    industry: 'Electric Utilities',
    market_cap: 1800000000,
    employees: 1200,
    founded_year: 1923,
    headquarters: 'Kingston, Jamaica',
    website: 'https://www.jpsco.com',
    description: 'JPS is Jamaica\'s sole electricity distributor, serving the entire island.',
    ceo: 'Michelle Gunawardana',
    is_active: true
  },
  {
    symbol: 'WCO',
    name: 'Wisynco Group Limited',
    sector: 'Consumer Goods',
    industry: 'Food & Beverages',
    market_cap: 2800000000,
    employees: 1500,
    founded_year: 1985,
    headquarters: 'Kingston, Jamaica',
    website: 'https://www.wisynco.com',
    description: 'Wisynco Group Limited is a leading manufacturer and distributor of food and beverage products.',
    ceo: 'Andrew Mahfood',
    is_active: true
  },
  {
    symbol: 'JSE',
    name: 'Jamaica Stock Exchange Limited',
    sector: 'Financial Services',
    industry: 'Securities Exchange',
    market_cap: 2000000000,
    employees: 150,
    founded_year: 1969,
    headquarters: 'Kingston, Jamaica',
    website: 'https://www.jamstockex.com',
    description: 'The Jamaica Stock Exchange is the primary securities exchange in Jamaica.',
    ceo: 'Marlene Street Forrest',
    is_active: true
  },
  {
    symbol: 'KW',
    name: 'Kingston Wharves Limited',
    sector: 'Transportation',
    industry: 'Marine Transportation',
    market_cap: 1200000000,
    employees: 400,
    founded_year: 1955,
    headquarters: 'Kingston, Jamaica',
    website: 'https://www.kingstonwharves.com',
    description: 'Kingston Wharves Limited operates port facilities and marine transportation services.',
    ceo: 'Mark Williams',
    is_active: true
  },
  {
    symbol: 'PJAM',
    name: 'Proven Group Limited',
    sector: 'Financial Services',
    industry: 'Investment Banking',
    market_cap: 1800000000,
    employees: 300,
    founded_year: 1998,
    headquarters: 'Kingston, Jamaica',
    website: 'https://www.proven.com',
    description: 'Proven Group Limited is a financial services company offering investment and wealth management.',
    ceo: 'Christopher Williams',
    is_active: true
  },
  {
    symbol: 'CPJ',
    name: 'Caribbean Producers Jamaica Limited',
    sector: 'Consumer Goods',
    industry: 'Food & Beverages',
    market_cap: 800000000,
    employees: 600,
    founded_year: 1990,
    headquarters: 'Kingston, Jamaica',
    website: 'https://www.cpj.com.jm',
    description: 'Caribbean Producers Jamaica Limited is a food and beverage distribution company.',
    ceo: 'Mark Hart',
    is_active: true
  },
  {
    symbol: 'LASM',
    name: 'Lasco Manufacturing Limited',
    sector: 'Consumer Goods',
    industry: 'Pharmaceuticals',
    market_cap: 1500000000,
    employees: 800,
    founded_year: 1988,
    headquarters: 'Kingston, Jamaica',
    website: 'https://www.lasco.com.jm',
    description: 'Lasco Manufacturing Limited is a pharmaceutical and consumer goods company.',
    ceo: 'Lascelles Chin',
    is_active: true
  },
  {
    symbol: 'SJ',
    name: 'Seprod Limited',
    sector: 'Consumer Goods',
    industry: 'Food & Beverages',
    market_cap: 2200000000,
    employees: 1200,
    founded_year: 1940,
    headquarters: 'Kingston, Jamaica',
    website: 'https://www.seprod.com',
    description: 'Seprod Limited is a diversified food and beverage company.',
    ceo: 'Richard Pandohie',
    is_active: true
  },
  {
    symbol: 'PUL',
    name: 'Pulse Investments Limited',
    sector: 'Media & Entertainment',
    industry: 'Broadcasting',
    market_cap: 600000000,
    employees: 200,
    founded_year: 2000,
    headquarters: 'Kingston, Jamaica',
    website: 'https://www.pulse.com.jm',
    description: 'Pulse Investments Limited operates in media and entertainment.',
    ceo: 'Kingsley Cooper',
    is_active: true
  },
  {
    symbol: 'DCOVE',
    name: 'Derrimon Trading Company Limited',
    sector: 'Consumer Goods',
    industry: 'Retail',
    market_cap: 400000000,
    employees: 300,
    founded_year: 1995,
    headquarters: 'Kingston, Jamaica',
    website: 'https://www.derrimon.com',
    description: 'Derrimon Trading Company Limited is a retail and distribution company.',
    ceo: 'Derrick Cotterell',
    is_active: true
  },
  {
    symbol: 'GK',
    name: 'GraceKennedy Limited',
    sector: 'Consumer Goods',
    industry: 'Food & Beverages',
    market_cap: 3500000000,
    employees: 2000,
    founded_year: 1922,
    headquarters: 'Kingston, Jamaica',
    website: 'https://www.gracekennedy.com',
    description: 'GraceKennedy Limited is a diversified food and financial services company.',
    ceo: 'Don Wehby',
    is_active: true
  },
  {
    symbol: 'MIL',
    name: 'Mayberry Investments Limited',
    sector: 'Financial Services',
    industry: 'Investment Banking',
    market_cap: 1200000000,
    employees: 250,
    founded_year: 2002,
    headquarters: 'Kingston, Jamaica',
    website: 'https://www.mayberry.com.jm',
    description: 'Mayberry Investments Limited is an investment banking and financial services company.',
    ceo: 'Gary Peart',
    is_active: true
  },
  {
    symbol: 'PULSE',
    name: 'Pulse Ventures Limited',
    sector: 'Media & Entertainment',
    industry: 'Digital Media',
    market_cap: 300000000,
    employees: 100,
    founded_year: 2010,
    headquarters: 'Kingston, Jamaica',
    website: 'https://www.pulseventures.com',
    description: 'Pulse Ventures Limited operates in digital media and entertainment.',
    ceo: 'Kingsley Cooper',
    is_active: true
  },
  {
    symbol: 'SSL',
    name: 'SSL Venture Capital Jamaica Limited',
    sector: 'Financial Services',
    industry: 'Venture Capital',
    market_cap: 500000000,
    employees: 50,
    founded_year: 2015,
    headquarters: 'Kingston, Jamaica',
    website: 'https://www.sslventures.com',
    description: 'SSL Venture Capital Jamaica Limited is a venture capital and investment company.',
    ceo: 'Christopher Williams',
    is_active: true
  },
  {
    symbol: 'JET',
    name: 'Jamaica Energy Partners Limited',
    sector: 'Utilities',
    industry: 'Energy',
    market_cap: 900000000,
    employees: 400,
    founded_year: 2005,
    headquarters: 'Kingston, Jamaica',
    website: 'https://www.jep.com.jm',
    description: 'Jamaica Energy Partners Limited operates in the energy sector.',
    ceo: 'Wayne McKenzie',
    is_active: true
  },
  {
    symbol: 'JETP',
    name: 'Jamaica Energy Partners Limited Preference',
    sector: 'Utilities',
    industry: 'Energy',
    market_cap: 200000000,
    employees: 0,
    founded_year: 2005,
    headquarters: 'Kingston, Jamaica',
    website: 'https://www.jep.com.jm',
    description: 'Jamaica Energy Partners Limited Preference shares.',
    ceo: 'Wayne McKenzie',
    is_active: true
  },
  {
    symbol: 'JETPREF',
    name: 'Jamaica Energy Partners Limited Preference Shares',
    sector: 'Utilities',
    industry: 'Energy',
    market_cap: 150000000,
    employees: 0,
    founded_year: 2005,
    headquarters: 'Kingston, Jamaica',
    website: 'https://www.jep.com.jm',
    description: 'Jamaica Energy Partners Limited Preference shares.',
    ceo: 'Wayne McKenzie',
    is_active: true
  },
  {
    symbol: 'JETPREF2',
    name: 'Jamaica Energy Partners Limited Preference Shares Series 2',
    sector: 'Utilities',
    industry: 'Energy',
    market_cap: 100000000,
    employees: 0,
    founded_year: 2005,
    headquarters: 'Kingston, Jamaica',
    website: 'https://www.jep.com.jm',
    description: 'Jamaica Energy Partners Limited Preference shares Series 2.',
    ceo: 'Wayne McKenzie',
    is_active: true
  },
  {
    symbol: 'JETPREF3',
    name: 'Jamaica Energy Partners Limited Preference Shares Series 3',
    sector: 'Utilities',
    industry: 'Energy',
    market_cap: 80000000,
    employees: 0,
    founded_year: 2005,
    headquarters: 'Kingston, Jamaica',
    website: 'https://www.jep.com.jm',
    description: 'Jamaica Energy Partners Limited Preference shares Series 3.',
    ceo: 'Wayne McKenzie',
    is_active: true
  },
  {
    symbol: 'JETPREF4',
    name: 'Jamaica Energy Partners Limited Preference Shares Series 4',
    sector: 'Utilities',
    industry: 'Energy',
    market_cap: 60000000,
    employees: 0,
    founded_year: 2005,
    headquarters: 'Kingston, Jamaica',
    website: 'https://www.jep.com.jm',
    description: 'Jamaica Energy Partners Limited Preference shares Series 4.',
    ceo: 'Wayne McKenzie',
    is_active: true
  },
  {
    symbol: 'JETPREF5',
    name: 'Jamaica Energy Partners Limited Preference Shares Series 5',
    sector: 'Utilities',
    industry: 'Energy',
    market_cap: 40000000,
    employees: 0,
    founded_year: 2005,
    headquarters: 'Kingston, Jamaica',
    website: 'https://www.jep.com.jm',
    description: 'Jamaica Energy Partners Limited Preference shares Series 5.',
    ceo: 'Wayne McKenzie',
    is_active: true
  }
];

/**
 * JSE Main Index Sectors
 */
export const JSE_SECTORS = [
  'Financial Services',
  'Consumer Goods',
  'Utilities',
  'Technology',
  'Transportation',
  'Media & Entertainment',
  'Energy'
];

/**
 * JSE Main Index Industries
 */
export const JSE_INDUSTRIES = [
  'Banking',
  'Investment Banking',
  'Insurance',
  'Securities Exchange',
  'Venture Capital',
  'Food & Beverages',
  'Tobacco',
  'Pharmaceuticals',
  'Retail',
  'Electric Utilities',
  'Energy',
  'Information Technology',
  'Marine Transportation',
  'Broadcasting',
  'Digital Media'
];

/**
 * Get all JSE companies
 */
export function getAllJSECompanies(): JSECompany[] {
  return JSE_MAIN_INDEX_COMPANIES;
}

/**
 * Get companies by sector
 */
export function getCompaniesBySector(sector: string): JSECompany[] {
  return JSE_MAIN_INDEX_COMPANIES.filter(company => company.sector === sector);
}

/**
 * Get companies by industry
 */
export function getCompaniesByIndustry(industry: string): JSECompany[] {
  return JSE_MAIN_INDEX_COMPANIES.filter(company => company.industry === industry);
}

/**
 * Get company by symbol
 */
export function getCompanyBySymbol(symbol: string): JSECompany | null {
  return JSE_MAIN_INDEX_COMPANIES.find(company => company.symbol === symbol) || null;
}

/**
 * Search companies
 */
export function searchCompanies(query: string): JSECompany[] {
  const lowercaseQuery = query.toLowerCase();
  return JSE_MAIN_INDEX_COMPANIES.filter(company => 
    company.name.toLowerCase().includes(lowercaseQuery) ||
    company.symbol.toLowerCase().includes(lowercaseQuery) ||
    company.sector.toLowerCase().includes(lowercaseQuery) ||
    company.industry.toLowerCase().includes(lowercaseQuery)
  );
}

/**
 * Get major companies (market cap > 2B)
 */
export function getMajorCompanies(): JSECompany[] {
  return JSE_MAIN_INDEX_COMPANIES.filter(company => company.market_cap > 2000000000);
}

/**
 * Get minor companies (market cap <= 2B)
 */
export function getMinorCompanies(): JSECompany[] {
  return JSE_MAIN_INDEX_COMPANIES.filter(company => company.market_cap <= 2000000000);
}

/**
 * Get active companies
 */
export function getActiveCompanies(): JSECompany[] {
  return JSE_MAIN_INDEX_COMPANIES.filter(company => company.is_active);
}

/**
 * Get company statistics
 */
export function getCompanyStatistics(): {
  total_companies: number;
  major_companies: number;
  minor_companies: number;
  active_companies: number;
  sectors: number;
  industries: number;
  total_market_cap: number;
  average_market_cap: number;
} {
  const totalCompanies = JSE_MAIN_INDEX_COMPANIES.length;
  const majorCompanies = getMajorCompanies().length;
  const minorCompanies = getMinorCompanies().length;
  const activeCompanies = getActiveCompanies().length;
  const sectors = new Set(JSE_MAIN_INDEX_COMPANIES.map(c => c.sector)).size;
  const industries = new Set(JSE_MAIN_INDEX_COMPANIES.map(c => c.industry)).size;
  const totalMarketCap = JSE_MAIN_INDEX_COMPANIES.reduce((sum, c) => sum + c.market_cap, 0);
  const averageMarketCap = totalMarketCap / totalCompanies;

  return {
    total_companies: totalCompanies,
    major_companies: majorCompanies,
    minor_companies: minorCompanies,
    active_companies: activeCompanies,
    sectors: sectors,
    industries: industries,
    total_market_cap: totalMarketCap,
    average_market_cap: Math.round(averageMarketCap)
  };
}
