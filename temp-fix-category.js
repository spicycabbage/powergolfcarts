require('dotenv').config({path:'.env.local'});
const {MongoClient} = require('mongodb');

(async()=>{
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db();
  
  const roberaCatId = '68ddacf6902bc2c21bedddf6';
  const electricCartsId = '68dd8db6902bc2c21beddd7b';
  
  const result = await db.collection('products').updateOne(
    {slug:'robera-pro'},
    {$set:{
      category: roberaCatId,
      categories: [roberaCatId, electricCartsId]
    }}
  );
  
  console.log('Updated:', result.modifiedCount, 'product');
  
  const check = await db.collection('products').findOne(
    {slug:'robera-pro'},
    {projection:{name:1,category:1,categories:1}}
  );
  
  console.log('Result:', JSON.stringify(check, null, 2));
  await c.close();
})();

