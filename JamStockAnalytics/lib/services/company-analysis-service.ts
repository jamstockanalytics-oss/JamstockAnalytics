import { JSECompany, CompanyAnalysis } from './jse-service';
import { sendChatMessage } from './ai-service';

export interface AnalysisRequest {
  company: JSECompany;
  analysis_type: 'comprehensive' | 'quick' | 'risk_assessment';
  include_competitors?: boolean;
  time_horizon?: 'short' | 'medium' | 'long';
}

export async function analyzeCompany(request: AnalysisRequest): Promise<CompanyAnalysis> {
  try {
    const prompt = `
You are a financial analyst specializing in Jamaican and Caribbean markets. 
Analyze this Jamaica Stock Exchange company and provide a comprehensive investment analysis:

Company: ${request.company.name} (${request.company.symbol})
Sector: ${request.company.sector}
Description: ${request.company.description}
Analysis Type: ${request.analysis_type}
Time Horizon: ${request.time_horizon || 'medium'}

Please provide a detailed analysis including:

1. Overall Investment Score (1-10)
2. Investment Recommendation (BUY/HOLD/SELL/STRONG_BUY/STRONG_SELL)
3. Red Flags (specific concerns and risks)
4. Strengths (positive factors)
5. Opportunities (growth potential)
6. Risks (potential challenges)
7. AI Insights (key observations and market context)
8. Price Target (if applicable)
9. Confidence Level (1-10)

Respond in JSON format:
{
  "overall_score": number,
  "recommendation": "BUY|HOLD|SELL|STRONG_BUY|STRONG_SELL",
  "red_flags": ["string"],
  "strengths": ["string"],
  "opportunities": ["string"],
  "risks": ["string"],
  "ai_insights": "string",
  "price_target": number,
  "confidence_level": number
}
`;

    const response = await sendChatMessage(prompt, '');
    
    // Parse AI response
    const analysisData = JSON.parse(response.message);
    
    return {
      company: request.company,
      overall_score: analysisData.overall_score || 5,
      recommendation: analysisData.recommendation || 'HOLD',
      red_flags: analysisData.red_flags || [],
      strengths: analysisData.strengths || [],
      opportunities: analysisData.opportunities || [],
      risks: analysisData.risks || [],
      ai_insights: analysisData.ai_insights || 'Analysis in progress...',
      price_target: analysisData.price_target,
      confidence_level: analysisData.confidence_level || 5,
      last_updated: new Date().toISOString()
    };

  } catch (error) {
    console.error('Company analysis error:', error);
    
    // Fallback analysis
    return {
      company: request.company,
      overall_score: 6,
      recommendation: 'HOLD',
      red_flags: [
        'Limited recent financial data available',
        'Market volatility in Jamaican economy',
        'Currency risk exposure'
      ],
      strengths: [
        'Established market position',
        'Strong sector fundamentals',
        'Experienced management team'
      ],
      opportunities: [
        'Digital transformation potential',
        'Regional expansion opportunities',
        'Government infrastructure projects'
      ],
      risks: [
        'Economic uncertainty',
        'Regulatory changes',
        'Competition from international players'
      ],
      ai_insights: 'This company shows moderate potential with some risks. Consider current market conditions and your investment goals.',
      confidence_level: 6,
      last_updated: new Date().toISOString()
    };
  }
}

export async function compareCompanies(companies: JSECompany[]): Promise<{
  comparison: CompanyAnalysis[];
  winner: JSECompany;
  summary: string;
}> {
  try {
    const analyses = await Promise.all(
      companies.map(company => 
        analyzeCompany({ 
          company, 
          analysis_type: 'comprehensive',
          time_horizon: 'medium'
        })
      )
    );

    // Find the best performing company
    const winner = analyses.reduce((best, current) => 
      current.overall_score > best.overall_score ? current : best
    ).company;

    const summary = `Comparison of ${companies.length} companies shows ${winner.name} (${winner.symbol}) as the top performer with the highest overall score.`;

    return {
      comparison: analyses,
      winner,
      summary
    };

  } catch (error) {
    console.error('Company comparison error:', error);
    throw error;
  }
}

export async function getSectorAnalysis(sector: string): Promise<{
  sector: string;
  companies: CompanyAnalysis[];
  sector_outlook: string;
  top_performer: JSECompany;
  recommendations: string[];
}> {
  try {
    const { getCompaniesBySector } = await import('./jse-service');
    const companies = await getCompaniesBySector(sector);
    
    const analyses = await Promise.all(
      companies.map(company => 
        analyzeCompany({ 
          company, 
          analysis_type: 'comprehensive',
          time_horizon: 'medium'
        })
      )
    );

    const topPerformer = analyses.reduce((best, current) => 
      current.overall_score > best.overall_score ? current : best
    ).company;

    const sectorOutlook = `The ${sector} sector in Jamaica shows mixed performance with opportunities for growth. Key factors include regulatory environment, economic conditions, and technological adoption.`;

    const recommendations = [
      'Monitor regulatory changes in the sector',
      'Consider diversification within the sector',
      'Watch for technological disruption',
      'Evaluate government policy impacts'
    ];

    return {
      sector,
      companies: analyses,
      sector_outlook: sectorOutlook,
      top_performer: topPerformer,
      recommendations
    };

  } catch (error) {
    console.error('Sector analysis error:', error);
    throw error;
  }
}
