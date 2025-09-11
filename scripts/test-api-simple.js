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

async function testAPIs() {
  console.log('🔍 Testing APIs directly...\n');
  
  try {
    // Test categories API
    console.log('1. Testing categories API...');
    const categoriesResult = await makeRequest('/api/categories?activeOnly=true&limit=1000');
    console.log('Status:', categoriesResult.status);
    
    if (categoriesResult.status === 200) {
      const categoriesData = categoriesResult.data;
      console.log('Categories response structure:', Object.keys(categoriesData));
      console.log('Categories count:', Array.isArray(categoriesData?.data) ? categoriesData.data.length : 'Not in data field');
      if (categoriesData?.data?.[0]) {
        console.log('First category:', categoriesData.data[0].name);
      }
    } else {
      console.log('Categories API failed:', categoriesResult.data);
    }
    
    console.log('\n2. Testing products API...');
    const productsResult = await makeRequest('/api/products?limit=5');
    console.log('Status:', productsResult.status);
    
    if (productsResult.status === 200) {
      const productsData = productsResult.data;
      console.log('Products response structure:', Object.keys(productsData));
      console.log('Products count:', Array.isArray(productsData?.data) ? productsData.data.length : 'Not in data field');
      
      const firstProduct = productsData?.data?.[0];
      if (firstProduct) {
        console.log('First product name:', firstProduct.name);
        console.log('First product has badges:', !!firstProduct.badges);
        if (firstProduct.badges) {
          console.log('Badges:', JSON.stringify(firstProduct.badges, null, 2));
        }
      }
    } else {
      console.log('Products API failed:', productsResult.data);
    }
    
  } catch (error) {
    console.error('❌ Error testing APIs:', error.message);
    console.log('💡 Make sure your dev server is running on localhost:3000');
  }
}

testAPIs();
