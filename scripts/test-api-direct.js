const fetch = require('node-fetch');

async function testAPIs() {
  console.log('🔍 Testing APIs directly...\n');
  
  try {
    // Test categories API
    console.log('1. Testing categories API...');
    const categoriesRes = await fetch('http://localhost:3000/api/categories?activeOnly=true&limit=1000');
    console.log('Status:', categoriesRes.status);
    
    if (categoriesRes.ok) {
      const categoriesData = await categoriesRes.json();
      console.log('Categories response structure:', Object.keys(categoriesData));
      console.log('Categories count:', Array.isArray(categoriesData?.data) ? categoriesData.data.length : 'Not in data field');
      console.log('First category:', categoriesData?.data?.[0] || categoriesData[0]);
    } else {
      console.log('Categories API failed:', await categoriesRes.text());
    }
    
    console.log('\n2. Testing products API...');
    const productsRes = await fetch('http://localhost:3000/api/products?limit=5');
    console.log('Status:', productsRes.status);
    
    if (productsRes.ok) {
      const productsData = await productsRes.json();
      console.log('Products response structure:', Object.keys(productsData));
      console.log('Products count:', Array.isArray(productsData?.data) ? productsData.data.length : 'Not in data field');
      
      const firstProduct = productsData?.data?.[0] || productsData[0];
      if (firstProduct) {
        console.log('First product name:', firstProduct.name);
        console.log('First product has badges:', !!firstProduct.badges);
        if (firstProduct.badges) {
          console.log('Badges:', JSON.stringify(firstProduct.badges, null, 2));
        }
      }
    } else {
      console.log('Products API failed:', await productsRes.text());
    }
    
  } catch (error) {
    console.error('❌ Error testing APIs:', error.message);
    console.log('💡 Make sure your dev server is running on localhost:3000');
  }
}

testAPIs();
