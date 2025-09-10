const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Try to load environment variables from multiple sources
function loadEnvVars() {
  const envFiles = ['.env.local', '.env'];
  
  for (const envFile of envFiles) {
    const envPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');
      
      for (const line of lines) {
        const [key, ...valueParts] = line.split('=');
        if (key && key.trim() === 'MONGODB_URI') {
          const value = valueParts.join('=').trim();
          return value.replace(/^["']|["']$/g, '');
        }
      }
    }
  }
  return null;
}

// MongoDB connection
async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) return;
  
  let uri = process.env.MONGODB_URI || loadEnvVars();
  
  if (!uri) {
    console.log('❌ MONGODB_URI not found');
    process.exit(1);
  }
  
  return mongoose.connect(uri);
}

// Page schema
const PageSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String,
}, { collection: 'pages' });

const Page = mongoose.models.Page || mongoose.model('Page', PageSchema);

async function fixContactEmail() {
  try {
    console.log('🔄 Connecting to database...');
    await connectToDatabase();

    console.log('🔍 Finding contact page...');
    
    // Find contact page
    const contactPage = await Page.findOne({ 
      slug: { $in: ['contact', 'contact-us'] }
    });

    if (!contactPage) {
      console.log('❌ Contact page not found');
      return;
    }

    console.log('📄 Found contact page:', contactPage.title);
    console.log('📝 Current content:');
    console.log(contactPage.content);

    // Check if the email is in the content
    if (contactPage.content && contactPage.content.includes('canadakushies@gmail.com')) {
      console.log('\n🎯 Found the problematic email link!');
      
      // Fix the email link - replace any incorrect href with proper mailto
      let fixedContent = contactPage.content;
      
      // Replace various possible incorrect formats
      fixedContent = fixedContent.replace(
        /href=["']?canadakushies@gmail\.com["']?/gi,
        'href="mailto:canadakushies@gmail.com"'
      );
      
      fixedContent = fixedContent.replace(
        /<a[^>]*>canadakushies@gmail\.com<\/a>/gi,
        '<a href="mailto:canadakushies@gmail.com">canadakushies@gmail.com</a>'
      );

      // Update the page
      await Page.updateOne(
        { _id: contactPage._id },
        { content: fixedContent }
      );

      console.log('✅ Fixed the email link in contact page!');
      console.log('📝 Updated content:');
      console.log(fixedContent);
    } else {
      console.log('🤔 Email not found in contact page content');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixContactEmail();
