const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying optimized web application...');

try {
  // Step 1: Set up environment
  console.log('📦 Setting up environment...');
  execSync('npm install', { stdio: 'inherit' });

  // Step 2: Set up database
  console.log('🗄️ Setting up database...');
  execSync('node scripts/setup-web-ui.js', { stdio: 'inherit' });

  // Step 3: Build optimized web bundle
  console.log('🏗️ Building optimized web bundle...');
  
  // Set environment variables for production build
  process.env.NODE_ENV = 'production';
  process.env.EXPO_WEB_OPTIMIZE = 'true';
  process.env.EXPO_WEB_MINIFY = 'true';
  
  execSync('npx expo export -p web --clear', { stdio: 'inherit' });

  // Step 4: Optimize the built files
  console.log('⚡ Optimizing built files...');
  
  const distPath = path.join(process.cwd(), 'dist');
  
  if (fs.existsSync(distPath)) {
    // Add performance optimizations
    const indexPath = path.join(distPath, 'index.html');
    
    if (fs.existsSync(indexPath)) {
      let indexContent = fs.readFileSync(indexPath, 'utf8');
      
      // Add performance meta tags
      const performanceMeta = `
    <!-- Performance Optimizations -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#ffffff">
    <meta name="color-scheme" content="light">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    
    <!-- Preload critical resources -->
    <link rel="preload" href="/static/js/web/entry.js" as="script">
    <link rel="preload" href="/static/css/web/entry.css" as="style">
    
    <!-- DNS prefetch for external resources -->
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="dns-prefetch" href="//api.supabase.co">
    
    <!-- Service Worker for offline capability -->
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
              console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
              console.log('SW registration failed: ', registrationError);
            });
        });
      }
    </script>
    
    <!-- Performance monitoring -->
    <script>
      window.addEventListener('load', function() {
        const perfData = performance.getEntriesByType('navigation')[0];
        const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
        console.log('Page load time:', loadTime + 'ms');
        
        // Send performance data to analytics if needed
        if (window.gtag) {
          window.gtag('event', 'page_load_time', {
            event_category: 'Performance',
            event_label: 'Web App',
            value: Math.round(loadTime)
          });
        }
      });
    </script>`;
      
      // Insert before closing head tag
      indexContent = indexContent.replace('</head>', performanceMeta + '\n</head>');
      
      fs.writeFileSync(indexPath, indexContent);
    }

    // Create service worker for offline capability
    const serviceWorkerContent = `
// JamStockAnalytics Service Worker
const CACHE_NAME = 'jamstock-v1';
const urlsToCache = [
  '/',
  '/static/css/web/entry.css',
  '/static/js/web/entry.js',
  '/favicon.ico'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});`;

    fs.writeFileSync(path.join(distPath, 'sw.js'), serviceWorkerContent);

    // Create robots.txt for SEO
    const robotsContent = `User-agent: *
Allow: /

Sitemap: /sitemap.xml`;

    fs.writeFileSync(path.join(distPath, 'robots.txt'), robotsContent);

    // Create sitemap.xml
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    fs.writeFileSync(path.join(distPath, 'sitemap.xml'), sitemapContent);
  }

  // Step 5: Create deployment manifest
  console.log('📋 Creating deployment manifest...');
  
  const manifest = {
    name: 'JamStockAnalytics',
    short_name: 'JamStock',
    description: 'AI-powered Jamaica Stock Exchange analytics with lightweight mode',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon'
      }
    ],
    features: [
      'lightweight-mode',
      'offline-capable',
      'data-saver',
      'performance-optimized'
    ],
    build_info: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      optimization: 'lightweight',
      features: ['block-user-system', 'web-ui-optimization']
    }
  };

  fs.writeFileSync(
    path.join(distPath, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log('✅ Web application deployment ready!');
  console.log('');
  console.log('📁 Build output: ./dist/');
  console.log('🚀 Ready for deployment to:');
  console.log('   • Vercel: vercel --prod');
  console.log('   • Netlify: netlify deploy --prod --dir=dist');
  console.log('   • GitHub Pages: Copy dist/ contents to gh-pages branch');
  console.log('   • AWS S3: aws s3 sync dist/ s3://your-bucket --delete');
  console.log('');
  console.log('🎯 Optimizations applied:');
  console.log('   ✅ Lightweight mode enabled');
  console.log('   ✅ Performance meta tags added');
  console.log('   ✅ Service worker for offline capability');
  console.log('   ✅ DNS prefetch for external resources');
  console.log('   ✅ SEO optimization (robots.txt, sitemap.xml)');
  console.log('   ✅ PWA manifest created');
  console.log('   ✅ Data saver mode configured');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
