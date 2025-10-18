#!/usr/bin/env node

// Hugging Face Integration Testing Script for JamStockAnalytics
const axios = require('axios');

class HuggingFaceTester {
  constructor() {
    this.testResults = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0
      }
    };
    this.baseUrl = process.env.SERVER_URL || 'http://localhost:3000';
  }
  
  async runAllTests() {
    console.log('🤗 Starting Hugging Face Integration Tests...\n');
    
    try {
      // Test 1: Service status
      await this.testServiceStatus();
      
      // Test 2: Sentiment analysis
      await this.testSentimentAnalysis();
      
      // Test 3: Emotion analysis
      await this.testEmotionAnalysis();
      
      // Test 4: Financial sentiment analysis
      await this.testFinancialSentimentAnalysis();
      
      // Test 5: Text classification
      await this.testTextClassification();
      
      // Test 6: Text summarization
      await this.testTextSummarization();
      
      // Test 7: Question answering
      await this.testQuestionAnswering();
      
      // Test 8: Text generation
      await this.testTextGeneration();
      
      // Test 9: Text embeddings
      await this.testTextEmbeddings();
      
      // Test 10: Batch processing
      await this.testBatchProcessing();
      
      // Test 11: Cache management
      await this.testCacheManagement();
      
      // Generate report
      this.generateReport();
      
      console.log('\n✅ Hugging Face integration testing completed!');
      
    } catch (error) {
      console.error('❌ Hugging Face integration testing failed:', error.message);
    }
  }
  
  async testServiceStatus() {
    console.log('📊 Testing Service Status...');
    
    try {
      const response = await axios.get(`${this.baseUrl}/api/huggingface/status`);
      
      if (response.status === 200 && response.data.success) {
        this.addTestResult('service-status-success', true, 'Hugging Face service status endpoint working');
        console.log('  ✅ Service status endpoint working');
        
        // Test data structure
        const data = response.data.data;
        if (data && typeof data.isInitialized === 'boolean') {
          this.addTestResult('service-status-data', true, 'Service status data structure valid');
          console.log('  ✅ Service status data structure valid');
        } else {
          this.addTestResult('service-status-data', false, 'Service status data structure invalid');
          console.log('  ❌ Service status data structure invalid');
        }
      } else {
        this.addTestResult('service-status-success', false, 'Service status endpoint failed');
        console.log('  ❌ Service status endpoint failed');
      }
      
    } catch (error) {
      this.addTestResult('service-status-error', false, `Service status error: ${error.message}`);
      console.log('  ❌ Service status error:', error.message);
    }
  }
  
  async testSentimentAnalysis() {
    console.log('😊 Testing Sentiment Analysis...');
    
    try {
      const testTexts = [
        'I love this stock! It\'s performing amazingly well.',
        'This market is terrible, everything is going down.',
        'The stock price remained stable today.'
      ];
      
      for (const text of testTexts) {
        const response = await axios.post(`${this.baseUrl}/api/huggingface/sentiment`, {
          text: text
        });
        
        if (response.status === 200 && response.data.success) {
          this.addTestResult(`sentiment-analysis-${text.substring(0, 20)}`, true, `Sentiment analysis working for: ${text.substring(0, 30)}...`);
          console.log(`  ✅ Sentiment analysis working for: ${text.substring(0, 30)}...`);
          
          // Test data structure
          const data = response.data.data;
          if (data && data.sentiment && typeof data.confidence === 'number') {
            this.addTestResult(`sentiment-data-${text.substring(0, 20)}`, true, 'Sentiment analysis data structure valid');
            console.log('  ✅ Sentiment analysis data structure valid');
          } else {
            this.addTestResult(`sentiment-data-${text.substring(0, 20)}`, false, 'Sentiment analysis data structure invalid');
            console.log('  ❌ Sentiment analysis data structure invalid');
          }
        } else {
          this.addTestResult(`sentiment-analysis-${text.substring(0, 20)}`, false, `Sentiment analysis failed for: ${text.substring(0, 30)}...`);
          console.log(`  ❌ Sentiment analysis failed for: ${text.substring(0, 30)}...`);
        }
      }
      
    } catch (error) {
      this.addTestResult('sentiment-analysis-error', false, `Sentiment analysis error: ${error.message}`);
      console.log('  ❌ Sentiment analysis error:', error.message);
    }
  }
  
  async testEmotionAnalysis() {
    console.log('😢 Testing Emotion Analysis...');
    
    try {
      const testTexts = [
        'I am so excited about this investment opportunity!',
        'I am worried about the market volatility.',
        'I feel neutral about the current market conditions.'
      ];
      
      for (const text of testTexts) {
        const response = await axios.post(`${this.baseUrl}/api/huggingface/emotion`, {
          text: text
        });
        
        if (response.status === 200 && response.data.success) {
          this.addTestResult(`emotion-analysis-${text.substring(0, 20)}`, true, `Emotion analysis working for: ${text.substring(0, 30)}...`);
          console.log(`  ✅ Emotion analysis working for: ${text.substring(0, 30)}...`);
          
          // Test data structure
          const data = response.data.data;
          if (data && data.emotion && typeof data.confidence === 'number') {
            this.addTestResult(`emotion-data-${text.substring(0, 20)}`, true, 'Emotion analysis data structure valid');
            console.log('  ✅ Emotion analysis data structure valid');
          } else {
            this.addTestResult(`emotion-data-${text.substring(0, 20)}`, false, 'Emotion analysis data structure invalid');
            console.log('  ❌ Emotion analysis data structure invalid');
          }
        } else {
          this.addTestResult(`emotion-analysis-${text.substring(0, 20)}`, false, `Emotion analysis failed for: ${text.substring(0, 30)}...`);
          console.log(`  ❌ Emotion analysis failed for: ${text.substring(0, 30)}...`);
        }
      }
      
    } catch (error) {
      this.addTestResult('emotion-analysis-error', false, `Emotion analysis error: ${error.message}`);
      console.log('  ❌ Emotion analysis error:', error.message);
    }
  }
  
  async testFinancialSentimentAnalysis() {
    console.log('💰 Testing Financial Sentiment Analysis...');
    
    try {
      const testTexts = [
        'The company reported strong quarterly earnings growth.',
        'The stock market crash has caused significant losses.',
        'The financial outlook remains uncertain.'
      ];
      
      for (const text of testTexts) {
        const response = await axios.post(`${this.baseUrl}/api/huggingface/financial-sentiment`, {
          text: text
        });
        
        if (response.status === 200 && response.data.success) {
          this.addTestResult(`financial-sentiment-${text.substring(0, 20)}`, true, `Financial sentiment analysis working for: ${text.substring(0, 30)}...`);
          console.log(`  ✅ Financial sentiment analysis working for: ${text.substring(0, 30)}...`);
          
          // Test data structure
          const data = response.data.data;
          if (data && data.sentiment && typeof data.confidence === 'number') {
            this.addTestResult(`financial-data-${text.substring(0, 20)}`, true, 'Financial sentiment analysis data structure valid');
            console.log('  ✅ Financial sentiment analysis data structure valid');
          } else {
            this.addTestResult(`financial-data-${text.substring(0, 20)}`, false, 'Financial sentiment analysis data structure invalid');
            console.log('  ❌ Financial sentiment analysis data structure invalid');
          }
        } else {
          this.addTestResult(`financial-sentiment-${text.substring(0, 20)}`, false, `Financial sentiment analysis failed for: ${text.substring(0, 30)}...`);
          console.log(`  ❌ Financial sentiment analysis failed for: ${text.substring(0, 30)}...`);
        }
      }
      
    } catch (error) {
      this.addTestResult('financial-sentiment-error', false, `Financial sentiment analysis error: ${error.message}`);
      console.log('  ❌ Financial sentiment analysis error:', error.message);
    }
  }
  
  async testTextClassification() {
    console.log('🏷️  Testing Text Classification...');
    
    try {
      const testCases = [
        {
          text: 'This is a positive financial news article.',
          labels: ['positive', 'negative', 'neutral', 'financial', 'news']
        },
        {
          text: 'The market is showing negative trends.',
          labels: ['positive', 'negative', 'neutral', 'financial', 'news']
        },
        {
          text: 'General information about the economy.',
          labels: ['positive', 'negative', 'neutral', 'financial', 'news']
        }
      ];
      
      for (const testCase of testCases) {
        const response = await axios.post(`${this.baseUrl}/api/huggingface/classify`, {
          text: testCase.text,
          labels: testCase.labels
        });
        
        if (response.status === 200 && response.data.success) {
          this.addTestResult(`text-classification-${testCase.text.substring(0, 20)}`, true, `Text classification working for: ${testCase.text.substring(0, 30)}...`);
          console.log(`  ✅ Text classification working for: ${testCase.text.substring(0, 30)}...`);
          
          // Test data structure
          const data = response.data.data;
          if (data && data.classification && typeof data.confidence === 'number') {
            this.addTestResult(`classification-data-${testCase.text.substring(0, 20)}`, true, 'Text classification data structure valid');
            console.log('  ✅ Text classification data structure valid');
          } else {
            this.addTestResult(`classification-data-${testCase.text.substring(0, 20)}`, false, 'Text classification data structure invalid');
            console.log('  ❌ Text classification data structure invalid');
          }
        } else {
          this.addTestResult(`text-classification-${testCase.text.substring(0, 20)}`, false, `Text classification failed for: ${testCase.text.substring(0, 30)}...`);
          console.log(`  ❌ Text classification failed for: ${testCase.text.substring(0, 30)}...`);
        }
      }
      
    } catch (error) {
      this.addTestResult('text-classification-error', false, `Text classification error: ${error.message}`);
      console.log('  ❌ Text classification error:', error.message);
    }
  }
  
  async testTextSummarization() {
    console.log('📝 Testing Text Summarization...');
    
    try {
      const testTexts = [
        'The Jamaica Stock Exchange (JSE) has shown remarkable growth this quarter. The main index increased by 15% compared to the previous quarter. Several key companies reported strong earnings, with NCB Financial Group leading the gains. The market sentiment remains positive as investors continue to show confidence in the Jamaican economy.',
        'Market volatility has been a concern for investors this week. The JSE experienced significant fluctuations with some stocks dropping by 10% while others gained. Analysts suggest that external factors such as global economic uncertainty and local policy changes are contributing to this instability.',
        'The financial sector continues to be the backbone of the Jamaican economy. Recent reports indicate that banking institutions are performing well despite challenging economic conditions. Investment opportunities remain available for both local and international investors.'
      ];
      
      for (const text of testTexts) {
        const response = await axios.post(`${this.baseUrl}/api/huggingface/summarize`, {
          text: text
        });
        
        if (response.status === 200 && response.data.success) {
          this.addTestResult(`text-summarization-${text.substring(0, 20)}`, true, `Text summarization working for: ${text.substring(0, 30)}...`);
          console.log(`  ✅ Text summarization working for: ${text.substring(0, 30)}...`);
          
          // Test data structure
          const data = response.data.data;
          if (data && data.summary && typeof data.confidence === 'number') {
            this.addTestResult(`summarization-data-${text.substring(0, 20)}`, true, 'Text summarization data structure valid');
            console.log('  ✅ Text summarization data structure valid');
          } else {
            this.addTestResult(`summarization-data-${text.substring(0, 20)}`, false, 'Text summarization data structure invalid');
            console.log('  ❌ Text summarization data structure invalid');
          }
        } else {
          this.addTestResult(`text-summarization-${text.substring(0, 20)}`, false, `Text summarization failed for: ${text.substring(0, 30)}...`);
          console.log(`  ❌ Text summarization failed for: ${text.substring(0, 30)}...`);
        }
      }
      
    } catch (error) {
      this.addTestResult('text-summarization-error', false, `Text summarization error: ${error.message}`);
      console.log('  ❌ Text summarization error:', error.message);
    }
  }
  
  async testQuestionAnswering() {
    console.log('❓ Testing Question Answering...');
    
    try {
      const testCases = [
        {
          question: 'What is the current performance of the JSE?',
          context: 'The Jamaica Stock Exchange (JSE) has shown remarkable growth this quarter. The main index increased by 15% compared to the previous quarter.'
        },
        {
          question: 'Which companies are leading the gains?',
          context: 'Several key companies reported strong earnings, with NCB Financial Group leading the gains. The market sentiment remains positive as investors continue to show confidence in the Jamaican economy.'
        },
        {
          question: 'What factors are affecting market volatility?',
          context: 'Market volatility has been a concern for investors this week. The JSE experienced significant fluctuations with some stocks dropping by 10% while others gained. Analysts suggest that external factors such as global economic uncertainty and local policy changes are contributing to this instability.'
        }
      ];
      
      for (const testCase of testCases) {
        const response = await axios.post(`${this.baseUrl}/api/huggingface/question-answer`, {
          question: testCase.question,
          context: testCase.context
        });
        
        if (response.status === 200 && response.data.success) {
          this.addTestResult(`question-answering-${testCase.question.substring(0, 20)}`, true, `Question answering working for: ${testCase.question.substring(0, 30)}...`);
          console.log(`  ✅ Question answering working for: ${testCase.question.substring(0, 30)}...`);
          
          // Test data structure
          const data = response.data.data;
          if (data && data.answer && typeof data.confidence === 'number') {
            this.addTestResult(`question-data-${testCase.question.substring(0, 20)}`, true, 'Question answering data structure valid');
            console.log('  ✅ Question answering data structure valid');
          } else {
            this.addTestResult(`question-data-${testCase.question.substring(0, 20)}`, false, 'Question answering data structure invalid');
            console.log('  ❌ Question answering data structure invalid');
          }
        } else {
          this.addTestResult(`question-answering-${testCase.question.substring(0, 20)}`, false, `Question answering failed for: ${testCase.question.substring(0, 30)}...`);
          console.log(`  ❌ Question answering failed for: ${testCase.question.substring(0, 30)}...`);
        }
      }
      
    } catch (error) {
      this.addTestResult('question-answering-error', false, `Question answering error: ${error.message}`);
      console.log('  ❌ Question answering error:', error.message);
    }
  }
  
  async testTextGeneration() {
    console.log('✍️  Testing Text Generation...');
    
    try {
      const testPrompts = [
        'The Jamaica Stock Exchange is',
        'Investment opportunities in Jamaica include',
        'Market analysis shows that'
      ];
      
      for (const prompt of testPrompts) {
        const response = await axios.post(`${this.baseUrl}/api/huggingface/generate`, {
          prompt: prompt
        });
        
        if (response.status === 200 && response.data.success) {
          this.addTestResult(`text-generation-${prompt.substring(0, 20)}`, true, `Text generation working for: ${prompt.substring(0, 30)}...`);
          console.log(`  ✅ Text generation working for: ${prompt.substring(0, 30)}...`);
          
          // Test data structure
          const data = response.data.data;
          if (data && data.generatedText && typeof data.confidence === 'number') {
            this.addTestResult(`generation-data-${prompt.substring(0, 20)}`, true, 'Text generation data structure valid');
            console.log('  ✅ Text generation data structure valid');
          } else {
            this.addTestResult(`generation-data-${prompt.substring(0, 20)}`, false, 'Text generation data structure invalid');
            console.log('  ❌ Text generation data structure invalid');
          }
        } else {
          this.addTestResult(`text-generation-${prompt.substring(0, 20)}`, false, `Text generation failed for: ${prompt.substring(0, 30)}...`);
          console.log(`  ❌ Text generation failed for: ${prompt.substring(0, 30)}...`);
        }
      }
      
    } catch (error) {
      this.addTestResult('text-generation-error', false, `Text generation error: ${error.message}`);
      console.log('  ❌ Text generation error:', error.message);
    }
  }
  
  async testTextEmbeddings() {
    console.log('🔢 Testing Text Embeddings...');
    
    try {
      const testTexts = [
        'The Jamaica Stock Exchange is performing well.',
        'Market volatility is a concern for investors.',
        'Financial analysis shows positive trends.'
      ];
      
      for (const text of testTexts) {
        const response = await axios.post(`${this.baseUrl}/api/huggingface/embeddings`, {
          text: text
        });
        
        if (response.status === 200 && response.data.success) {
          this.addTestResult(`text-embeddings-${text.substring(0, 20)}`, true, `Text embeddings working for: ${text.substring(0, 30)}...`);
          console.log(`  ✅ Text embeddings working for: ${text.substring(0, 30)}...`);
          
          // Test data structure
          const data = response.data.data;
          if (data && Array.isArray(data.embeddings) && typeof data.dimension === 'number') {
            this.addTestResult(`embeddings-data-${text.substring(0, 20)}`, true, 'Text embeddings data structure valid');
            console.log('  ✅ Text embeddings data structure valid');
          } else {
            this.addTestResult(`embeddings-data-${text.substring(0, 20)}`, false, 'Text embeddings data structure invalid');
            console.log('  ❌ Text embeddings data structure invalid');
          }
        } else {
          this.addTestResult(`text-embeddings-${text.substring(0, 20)}`, false, `Text embeddings failed for: ${text.substring(0, 30)}...`);
          console.log(`  ❌ Text embeddings failed for: ${text.substring(0, 30)}...`);
        }
      }
      
    } catch (error) {
      this.addTestResult('text-embeddings-error', false, `Text embeddings error: ${error.message}`);
      console.log('  ❌ Text embeddings error:', error.message);
    }
  }
  
  async testBatchProcessing() {
    console.log('📦 Testing Batch Processing...');
    
    try {
      const response = await axios.post(`${this.baseUrl}/api/huggingface/batch`, {
        texts: [
          'The market is performing well.',
          'Investors are optimistic about the future.',
          'Financial analysis shows positive trends.'
        ],
        model: 'sentiment',
        options: {}
      });
      
      if (response.status === 200 && response.data.success) {
        this.addTestResult('batch-processing-success', true, 'Batch processing working');
        console.log('  ✅ Batch processing working');
        
        // Test data structure
        const data = response.data.data;
        if (Array.isArray(data) && data.length === 3) {
          this.addTestResult('batch-processing-data', true, 'Batch processing data structure valid');
          console.log('  ✅ Batch processing data structure valid');
        } else {
          this.addTestResult('batch-processing-data', false, 'Batch processing data structure invalid');
          console.log('  ❌ Batch processing data structure invalid');
        }
      } else {
        this.addTestResult('batch-processing-success', false, 'Batch processing failed');
        console.log('  ❌ Batch processing failed');
      }
      
    } catch (error) {
      this.addTestResult('batch-processing-error', false, `Batch processing error: ${error.message}`);
      console.log('  ❌ Batch processing error:', error.message);
    }
  }
  
  async testCacheManagement() {
    console.log('💾 Testing Cache Management...');
    
    try {
      // Test cache stats
      const statsResponse = await axios.get(`${this.baseUrl}/api/huggingface/cache`);
      
      if (statsResponse.status === 200 && statsResponse.data.success) {
        this.addTestResult('cache-stats-success', true, 'Cache stats endpoint working');
        console.log('  ✅ Cache stats endpoint working');
        
        // Test data structure
        const data = statsResponse.data.data;
        if (data && typeof data.size === 'number') {
          this.addTestResult('cache-stats-data', true, 'Cache stats data structure valid');
          console.log('  ✅ Cache stats data structure valid');
        } else {
          this.addTestResult('cache-stats-data', false, 'Cache stats data structure invalid');
          console.log('  ❌ Cache stats data structure invalid');
        }
      } else {
        this.addTestResult('cache-stats-success', false, 'Cache stats endpoint failed');
        console.log('  ❌ Cache stats endpoint failed');
      }
      
      // Test cache clear
      const clearResponse = await axios.delete(`${this.baseUrl}/api/huggingface/cache`);
      
      if (clearResponse.status === 200 && clearResponse.data.success) {
        this.addTestResult('cache-clear-success', true, 'Cache clear endpoint working');
        console.log('  ✅ Cache clear endpoint working');
      } else {
        this.addTestResult('cache-clear-success', false, 'Cache clear endpoint failed');
        console.log('  ❌ Cache clear endpoint failed');
      }
      
    } catch (error) {
      this.addTestResult('cache-management-error', false, `Cache management error: ${error.message}`);
      console.log('  ❌ Cache management error:', error.message);
    }
  }
  
  addTestResult(testName, passed, message) {
    this.testResults.tests.push({
      name: testName,
      passed: passed,
      message: message,
      timestamp: new Date().toISOString()
    });
    
    this.testResults.summary.total++;
    if (passed) {
      this.testResults.summary.passed++;
    } else {
      this.testResults.summary.failed++;
    }
  }
  
  generateReport() {
    const reportPath = require('path').join(__dirname, '..', 'huggingface-test-report.json');
    require('fs').writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
    
    console.log(`\n📋 Hugging Face test report generated: ${reportPath}`);
    
    // Display summary
    console.log('\n📊 Hugging Face Test Summary:');
    console.log(`  ✅ Passed: ${this.testResults.summary.passed}`);
    console.log(`  ❌ Failed: ${this.testResults.summary.failed}`);
    console.log(`  📈 Total: ${this.testResults.summary.total}`);
    
    // Display failed tests
    const failedTests = this.testResults.tests.filter(test => !test.passed);
    if (failedTests.length > 0) {
      console.log('\n❌ Failed Tests:');
      failedTests.forEach(test => {
        console.log(`  - ${test.name}: ${test.message}`);
      });
    }
    
    // Calculate score
    const score = Math.round((this.testResults.summary.passed / this.testResults.summary.total) * 100);
    console.log(`\n🎯 Hugging Face Score: ${score}%`);
    
    if (score >= 90) {
      console.log('🏆 Excellent Hugging Face integration!');
    } else if (score >= 70) {
      console.log('👍 Good Hugging Face integration with room for improvement');
    } else if (score >= 50) {
      console.log('⚠️  Hugging Face integration needs work');
    } else {
      console.log('❌ Hugging Face integration requires significant improvements');
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new HuggingFaceTester();
  tester.runAllTests();
}

module.exports = HuggingFaceTester;
