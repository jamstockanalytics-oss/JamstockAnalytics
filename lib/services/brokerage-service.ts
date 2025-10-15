export interface BrokerageCompany {
  id: string;
  name: string;
  website: string;
  description: string;
  services: string[];
  contact_info: {
    phone: string;
    email: string;
    address: string;
    branches?: string[];
  };
  established_year: number;
  jse_member: boolean;
  regulatory_body: string;
  specialties: string[];
  minimum_investment?: string;
  fees_structure: string;
  trading_platforms: string[];
  research_services: string[];
  customer_support: string[];
  social_media?: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export interface UserRating {
  id: string;
  brokerage_id: string;
  user_id: string;
  rating: number; // 1-6 stars
  review_text?: string;
  categories: {
    customer_service: number;
    trading_platform: number;
    fees: number;
    research_quality: number;
    reliability: number;
  };
  created_at: string;
  updated_at: string;
}

export interface BrokerageWithRating extends BrokerageCompany {
  average_rating: number;
  total_ratings: number;
  rating_breakdown: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
    '6': number;
  };
  category_ratings: {
    customer_service: number;
    trading_platform: number;
    fees: number;
    research_quality: number;
    reliability: number;
  };
}

// Jamaica Stock Brokerage Companies Database
export const JAMAICA_BROKERAGES: BrokerageCompany[] = [
  {
    id: 'ncbfg-securities',
    name: 'NCB Capital Markets Limited',
    website: 'https://www.ncbcapitalmarkets.com',
    description: 'NCB Capital Markets is the investment banking and securities arm of NCB Financial Group, Jamaica\'s largest financial services group. They provide comprehensive investment services including equity trading, fixed income, asset management, and corporate finance advisory services.',
    services: [
      'Equity Trading',
      'Fixed Income Trading',
      'Asset Management',
      'Corporate Finance',
      'Investment Advisory',
      'Research & Analysis',
      'Portfolio Management'
    ],
    contact_info: {
      phone: '+1 (876) 906-3000',
      email: 'info@ncbcapitalmarkets.com',
      address: '32 Trafalgar Road, Kingston 10, Jamaica',
      branches: [
        'Kingston (Head Office)',
        'Montego Bay',
        'Spanish Town',
        'Mandeville'
      ]
    },
    established_year: 1977,
    jse_member: true,
    regulatory_body: 'Financial Services Commission (FSC)',
    specialties: [
      'Large Cap Equities',
      'Government Securities',
      'Corporate Bonds',
      'Mutual Funds',
      'Pension Management'
    ],
    minimum_investment: 'JMD $10,000',
    fees_structure: 'Competitive commission rates, no minimum monthly fees',
    trading_platforms: [
      'Online Trading Platform',
      'Mobile App',
      'Phone Trading',
      'Branch Trading'
    ],
    research_services: [
      'Daily Market Reports',
      'Company Research',
      'Economic Analysis',
      'Sector Reports',
      'Investment Recommendations'
    ],
    customer_support: [
      '24/7 Online Support',
      'Dedicated Account Managers',
      'Investment Advisors',
      'Phone Support',
      'Email Support'
    ],
    social_media: {
      facebook: 'https://facebook.com/ncbcapitalmarkets',
      linkedin: 'https://linkedin.com/company/ncb-capital-markets',
      twitter: 'https://twitter.com/ncbcapital'
    }
  },
  {
    id: 'scotia-investments',
    name: 'Scotia Investments Jamaica Limited',
    website: 'https://www.scotiabank.com/jm/en/personal/investments.html',
    description: 'Scotia Investments Jamaica is the investment services division of Scotiabank Jamaica, offering a full range of investment products and services. They specialize in mutual funds, pension management, and investment advisory services for both individual and institutional clients.',
    services: [
      'Mutual Funds',
      'Pension Management',
      'Investment Advisory',
      'Retirement Planning',
      'Education Savings',
      'Insurance Products',
      'Wealth Management'
    ],
    contact_info: {
      phone: '+1 (876) 906-2000',
      email: 'investments@scotiabank.com',
      address: 'Scotiabank Centre, 2 Port Royal Street, Kingston, Jamaica',
      branches: [
        'Kingston (Head Office)',
        'Montego Bay',
        'Ocho Rios',
        'Mandeville',
        'Spanish Town'
      ]
    },
    established_year: 1889,
    jse_member: true,
    regulatory_body: 'Financial Services Commission (FSC)',
    specialties: [
      'Mutual Funds',
      'Pension Plans',
      'Retirement Planning',
      'Education Savings',
      'Insurance Solutions'
    ],
    minimum_investment: 'JMD $5,000',
    fees_structure: 'Management fees vary by product, no upfront fees for mutual funds',
    trading_platforms: [
      'Online Banking Platform',
      'Mobile Banking App',
      'Branch Services',
      'Phone Banking'
    ],
    research_services: [
      'Market Commentary',
      'Fund Performance Reports',
      'Economic Outlook',
      'Investment Education',
      'Retirement Planning Guides'
    ],
    customer_support: [
      'Branch Network',
      'Phone Support',
      'Online Chat',
      'Investment Advisors',
      'Educational Seminars'
    ],
    social_media: {
      facebook: 'https://facebook.com/scotiabankjamaica',
      linkedin: 'https://linkedin.com/company/scotiabank-jamaica',
      twitter: 'https://twitter.com/scotiabankjm'
    }
  },
  {
    id: 'jmmb-securities',
    name: 'JMMB Securities Limited',
    website: 'https://www.jmmb.com',
    description: 'JMMB Securities is the investment arm of JMMB Group, specializing in securities trading, investment banking, and wealth management services. They are known for their innovative investment products and strong research capabilities in the Caribbean market.',
    services: [
      'Securities Trading',
      'Investment Banking',
      'Wealth Management',
      'Mutual Funds',
      'Pension Management',
      'Corporate Finance',
      'Research & Analysis'
    ],
    contact_info: {
      phone: '+1 (876) 906-4000',
      email: 'securities@jmmb.com',
      address: '6-8 Grenada Crescent, Kingston 5, Jamaica',
      branches: [
        'Kingston (Head Office)',
        'Montego Bay',
        'Spanish Town',
        'Mandeville',
        'Ocho Rios'
      ]
    },
    established_year: 1992,
    jse_member: true,
    regulatory_body: 'Financial Services Commission (FSC)',
    specialties: [
      'Caribbean Securities',
      'Regional Investments',
      'Alternative Investments',
      'ESG Investing',
      'Technology Stocks'
    ],
    minimum_investment: 'JMD $15,000',
    fees_structure: 'Tiered commission structure, reduced fees for active traders',
    trading_platforms: [
      'JMMB Online Trading',
      'Mobile Trading App',
      'Advanced Trading Platform',
      'API Trading'
    ],
    research_services: [
      'Caribbean Market Research',
      'Sector Analysis',
      'Company Reports',
      'Economic Forecasts',
      'ESG Research'
    ],
    customer_support: [
      'Dedicated Relationship Managers',
      '24/7 Trading Support',
      'Investment Seminars',
      'Online Education Portal',
      'Phone & Email Support'
    ],
    social_media: {
      facebook: 'https://facebook.com/jmmbgroup',
      linkedin: 'https://linkedin.com/company/jmmb-group',
      twitter: 'https://twitter.com/jmmbgroup'
    }
  },
  {
    id: 'barita-investments',
    name: 'Barita Investments Limited',
    website: 'https://www.barita.com',
    description: 'Barita Investments is a leading investment company in Jamaica, providing securities trading, investment banking, and asset management services. They are known for their strong performance in fixed income securities and innovative investment products.',
    services: [
      'Securities Trading',
      'Fixed Income Trading',
      'Asset Management',
      'Investment Banking',
      'Corporate Finance',
      'Research Services',
      'Portfolio Management'
    ],
    contact_info: {
      phone: '+1 (876) 906-5000',
      email: 'info@barita.com',
      address: '15-17 Port Royal Street, Kingston, Jamaica',
      branches: [
        'Kingston (Head Office)',
        'Montego Bay',
        'Spanish Town'
      ]
    },
    established_year: 1977,
    jse_member: true,
    regulatory_body: 'Financial Services Commission (FSC)',
    specialties: [
      'Fixed Income Securities',
      'Government Bonds',
      'Corporate Bonds',
      'Money Market Instruments',
      'Real Estate Investments'
    ],
    minimum_investment: 'JMD $20,000',
    fees_structure: 'Competitive rates, volume discounts available',
    trading_platforms: [
      'Barita Online Platform',
      'Mobile Trading',
      'Phone Trading',
      'Branch Trading'
    ],
    research_services: [
      'Fixed Income Research',
      'Market Analysis',
      'Economic Commentary',
      'Investment Strategies',
      'Risk Assessment'
    ],
    customer_support: [
      'Personal Account Managers',
      'Investment Advisors',
      'Phone Support',
      'Email Support',
      'Branch Services'
    ],
    social_media: {
      facebook: 'https://facebook.com/baritainvestments',
      linkedin: 'https://linkedin.com/company/barita-investments',
      twitter: 'https://twitter.com/baritainvest'
    }
  },
  {
    id: 'sagicor-investments',
    name: 'Sagicor Investments Jamaica Limited',
    website: 'https://www.sagicor.com',
    description: 'Sagicor Investments is the investment division of Sagicor Group Jamaica, offering comprehensive investment and insurance solutions. They specialize in pension management, mutual funds, and investment advisory services with a focus on long-term wealth building.',
    services: [
      'Pension Management',
      'Mutual Funds',
      'Investment Advisory',
      'Insurance Solutions',
      'Retirement Planning',
      'Education Savings',
      'Wealth Management'
    ],
    contact_info: {
      phone: '+1 (876) 906-6000',
      email: 'investments@sagicor.com',
      address: '28-48 Barbados Avenue, Kingston 5, Jamaica',
      branches: [
        'Kingston (Head Office)',
        'Montego Bay',
        'Spanish Town',
        'Mandeville',
        'Ocho Rios'
      ]
    },
    established_year: 1970,
    jse_member: true,
    regulatory_body: 'Financial Services Commission (FSC)',
    specialties: [
      'Pension Solutions',
      'Retirement Planning',
      'Education Funding',
      'Insurance Integration',
      'Long-term Investments'
    ],
    minimum_investment: 'JMD $8,000',
    fees_structure: 'Management fees based on assets under management',
    trading_platforms: [
      'Sagicor Online Portal',
      'Mobile App',
      'Branch Services',
      'Phone Support'
    ],
    research_services: [
      'Retirement Planning Guides',
      'Market Updates',
      'Fund Performance Analysis',
      'Economic Outlook',
      'Investment Education'
    ],
    customer_support: [
      'Financial Advisors',
      'Retirement Specialists',
      'Phone Support',
      'Online Chat',
      'Educational Workshops'
    ],
    social_media: {
      facebook: 'https://facebook.com/sagicorjamaica',
      linkedin: 'https://linkedin.com/company/sagicor-group-jamaica',
      twitter: 'https://twitter.com/sagicorjm'
    }
  },
  {
    id: 'mayberry-investments',
    name: 'Mayberry Investments Limited',
    website: 'https://www.mayberryinvestments.com',
    description: 'Mayberry Investments is a full-service investment company providing securities trading, investment banking, and asset management services. They are known for their strong research capabilities and innovative investment products in the Jamaican market.',
    services: [
      'Securities Trading',
      'Investment Banking',
      'Asset Management',
      'Corporate Finance',
      'Research & Analysis',
      'Portfolio Management',
      'Investment Advisory'
    ],
    contact_info: {
      phone: '+1 (876) 906-7000',
      email: 'info@mayberryinvestments.com',
      address: '28-48 Barbados Avenue, Kingston 5, Jamaica',
      branches: [
        'Kingston (Head Office)',
        'Montego Bay',
        'Spanish Town'
      ]
    },
    established_year: 2002,
    jse_member: true,
    regulatory_body: 'Financial Services Commission (FSC)',
    specialties: [
      'Small Cap Equities',
      'Growth Stocks',
      'Alternative Investments',
      'Private Equity',
      'Real Estate Investment Trusts (REITs)'
    ],
    minimum_investment: 'JMD $25,000',
    fees_structure: 'Competitive commission rates, research included',
    trading_platforms: [
      'Mayberry Online',
      'Mobile Trading App',
      'Advanced Analytics Platform',
      'Phone Trading'
    ],
    research_services: [
      'Equity Research',
      'Market Analysis',
      'Company Reports',
      'Sector Analysis',
      'Investment Strategies'
    ],
    customer_support: [
      'Dedicated Brokers',
      'Research Analysts',
      'Phone Support',
      'Email Support',
      'Investment Seminars'
    ],
    social_media: {
      facebook: 'https://facebook.com/mayberryinvestments',
      linkedin: 'https://linkedin.com/company/mayberry-investments',
      twitter: 'https://twitter.com/mayberryinvest'
    }
  },
  {
    id: 'proven-investments',
    name: 'Proven Investments Limited',
    website: 'https://www.proveninvestments.com',
    description: 'Proven Investments is a boutique investment firm specializing in alternative investments, private equity, and specialized investment strategies. They cater to high-net-worth individuals and institutional clients seeking sophisticated investment solutions.',
    services: [
      'Alternative Investments',
      'Private Equity',
      'Real Estate Investments',
      'Hedge Funds',
      'Wealth Management',
      'Investment Advisory',
      'Portfolio Management'
    ],
    contact_info: {
      phone: '+1 (876) 906-8000',
      email: 'info@proveninvestments.com',
      address: '15-17 Port Royal Street, Kingston, Jamaica',
      branches: [
        'Kingston (Head Office)',
        'Montego Bay'
      ]
    },
    established_year: 2005,
    jse_member: false,
    regulatory_body: 'Financial Services Commission (FSC)',
    specialties: [
      'Alternative Investments',
      'Private Equity',
      'Real Estate',
      'Hedge Funds',
      'High-Net-Worth Services'
    ],
    minimum_investment: 'JMD $500,000',
    fees_structure: 'Performance-based fees, management fees apply',
    trading_platforms: [
      'Proprietary Platform',
      'Direct Access Trading',
      'Phone Trading',
      'Personal Meetings'
    ],
    research_services: [
      'Alternative Investment Research',
      'Private Market Analysis',
      'Real Estate Research',
      'Economic Analysis',
      'Investment Strategy Reports'
    ],
    customer_support: [
      'Personal Wealth Managers',
      'Investment Specialists',
      'Phone Support',
      'Private Consultations',
      'Exclusive Events'
    ],
    social_media: {
      facebook: 'https://facebook.com/proveninvestments',
      linkedin: 'https://linkedin.com/company/proven-investments',
      twitter: 'https://twitter.com/proveninvest'
    }
  },
  {
    id: 'cib-investments',
    name: 'CIB Investments Limited',
    website: 'https://www.cibinvestments.com',
    description: 'CIB Investments is the investment arm of Caribbean Investment Bank, providing comprehensive investment services across the Caribbean region. They specialize in regional securities trading and cross-border investment opportunities.',
    services: [
      'Regional Securities Trading',
      'Cross-Border Investments',
      'Currency Trading',
      'Investment Banking',
      'Asset Management',
      'Research Services',
      'Portfolio Management'
    ],
    contact_info: {
      phone: '+1 (876) 906-9000',
      email: 'info@cibinvestments.com',
      address: '32 Trafalgar Road, Kingston 10, Jamaica',
      branches: [
        'Kingston (Head Office)',
        'Montego Bay',
        'Spanish Town'
      ]
    },
    established_year: 2010,
    jse_member: true,
    regulatory_body: 'Financial Services Commission (FSC)',
    specialties: [
      'Regional Securities',
      'Currency Trading',
      'Cross-Border Investments',
      'Emerging Markets',
      'International Diversification'
    ],
    minimum_investment: 'JMD $30,000',
    fees_structure: 'Competitive rates for regional trading',
    trading_platforms: [
      'CIB Online Platform',
      'Mobile Trading',
      'Multi-Currency Platform',
      'Phone Trading'
    ],
    research_services: [
      'Regional Market Research',
      'Currency Analysis',
      'Cross-Border Opportunities',
      'Economic Analysis',
      'Investment Strategies'
    ],
    customer_support: [
      'Regional Specialists',
      'Currency Experts',
      'Phone Support',
      'Email Support',
      'Investment Seminars'
    ],
    social_media: {
      facebook: 'https://facebook.com/cibinvestments',
      linkedin: 'https://linkedin.com/company/cib-investments',
      twitter: 'https://twitter.com/cibinvest'
    }
  }
];

export async function getBrokerageCompanies(): Promise<BrokerageCompany[]> {
  return JAMAICA_BROKERAGES;
}

export async function getBrokerageById(id: string): Promise<BrokerageCompany | null> {
  const brokerages = await getBrokerageCompanies();
  return brokerages.find(brokerage => brokerage.id === id) || null;
}

export async function searchBrokerages(query: string): Promise<BrokerageCompany[]> {
  const brokerages = await getBrokerageCompanies();
  const lowercaseQuery = query.toLowerCase();
  
  return brokerages.filter(brokerage => 
    brokerage.name.toLowerCase().includes(lowercaseQuery) ||
    brokerage.description.toLowerCase().includes(lowercaseQuery) ||
    brokerage.specialties.some(specialty => specialty.toLowerCase().includes(lowercaseQuery)) ||
    brokerage.services.some(service => service.toLowerCase().includes(lowercaseQuery))
  );
}

export async function getBrokeragesBySpecialty(specialty: string): Promise<BrokerageCompany[]> {
  const brokerages = await getBrokerageCompanies();
  return brokerages.filter(brokerage => 
    brokerage.specialties.some(s => s.toLowerCase().includes(specialty.toLowerCase()))
  );
}

export async function getBrokeragesByService(service: string): Promise<BrokerageCompany[]> {
  const brokerages = await getBrokerageCompanies();
  return brokerages.filter(brokerage => 
    brokerage.services.some(s => s.toLowerCase().includes(service.toLowerCase()))
  );
}
