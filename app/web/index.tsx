import React, { useEffect } from 'react';
import { LightweightLayout, LightweightNewsFeed, LightweightCard, LightweightButton } from '../../components/web';

export default function WebHomePage() {


  useEffect(() => {
    // Simulate loading for web optimization
    const timer = setTimeout(() => {
      // Articles loaded
    }, 1000);

    return () => clearTimeout(timer);
  }, []);


  return (
    <LightweightLayout title="JamStockAnalytics - Lightweight Mode">
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Jamaica Stock Exchange Analytics
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            AI-powered insights for JSE market analysis with minimal data usage
          </p>
          <div className="flex justify-center space-x-4">
            <LightweightButton
              title="View Market Data"
              variant="primary"
              size="lg"
              onPress={() => {}}
            />
            <LightweightButton
              title="AI Analysis"
              variant="outline"
              size="lg"
              onPress={() => {}}
            />
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LightweightCard title="Active Companies">
            <div className="text-3xl font-bold text-blue-600 mb-2">127</div>
            <p className="text-sm text-gray-600">JSE & Junior Market</p>
          </LightweightCard>
          <LightweightCard title="Market Cap">
            <div className="text-3xl font-bold text-green-600 mb-2">$2.1T</div>
            <p className="text-sm text-gray-600">Combined Value</p>
          </LightweightCard>
          <LightweightCard title="AI Insights">
            <div className="text-3xl font-bold text-purple-600 mb-2">1,247</div>
            <p className="text-sm text-gray-600">Articles Analyzed</p>
          </LightweightCard>
        </section>

        {/* News Feed */}
        <section>
          <LightweightNewsFeed />
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LightweightCard
            title="Lightweight Mode"
            subtitle="Optimized for minimal data usage"
          >
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Reduced bandwidth usage by 60%
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Faster loading times
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Offline-capable design
              </li>
            </ul>
          </LightweightCard>

          <LightweightCard
            title="AI-Powered Analysis"
            subtitle="Smart insights for better decisions"
          >
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Real-time sentiment analysis
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Priority-based news filtering
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Risk assessment alerts
              </li>
            </ul>
          </LightweightCard>
        </section>

        {/* Performance Indicator */}
        <section className="text-center py-6 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-800 font-medium">Optimized for Performance</span>
          </div>
          <p className="text-sm text-green-700">
            This lightweight version uses minimal bandwidth and loads faster on slow connections
          </p>
        </section>
      </div>
    </LightweightLayout>
  );
}
