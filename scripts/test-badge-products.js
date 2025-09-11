const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testBadgeProducts() {
  console.log('🔍 Testing products with badges via API...\n');
  
  try {
    // Test getting more products to find the ones with badges
    console.log('1. Testing products API with more results...');
    const productsResult = await makeRequest('/api/products?limit=20');
    console.log('Status:', productsResult.status);
    
    if (productsResult.status === 200) {
      const productsData = productsResult.data;
      const products = productsData?.data || [];
      
      console.log(`Found ${products.length} products total\n`);
      
      // Look for products with badges
      let foundBadges = 0;
      products.forEach(product => {
        if (product.badges && Object.keys(product.badges).length > 0) {
          console.log(`✅ Product "${product.name}" has badges via API:`);
          console.log('   Badges:', JSON.stringify(product.badges, null, 2));
          foundBadges++;
        }
      });
      
      if (foundBadges === 0) {
        console.log('❌ No products with badges found via API');
        console.log('🔍 Checking specific products...');
        
        // Test specific products we know have badges
        const testSlugs = ['pink-kush', 'butter-cookies'];
        for (const slug of testSlugs) {
          console.log(`\nTesting product: ${slug}`);
          const productResult = await makeRequest(`/api/products?search=${slug}&limit=1`);
          
          if (productResult.status === 200) {
            const productData = productResult.data;
            const product = productData?.data?.[0];
            
            if (product) {
              console.log(`Found: ${product.name}`);
              console.log('Has badges:', !!product.badges);
              if (product.badges) {
                console.log('Badges:', JSON.stringify(product.badges, null, 2));
              }
            } else {
              console.log('Product not found in API results');
            }
          }
        }
      } else {
        console.log(`✅ Found ${foundBadges} products with badges via API`);
      }
      
    } else {
      console.log('Products API failed:', productsResult.data);
    }
    
  } catch (error) {
    console.error('❌ Error testing badge products:', error.message);
    console.log('💡 Make sure your dev server is running on localhost:3000');
  }
}

testBadgeProducts();
