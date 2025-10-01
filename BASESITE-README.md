# Basesite - Ecommerce Site Template

This is a clean template for creating new ecommerce sites. Use this to quickly spin up new sites with the same codebase structure.

## 🚀 Quick Start - Create a New Site

### Option 1: Using npm script (recommended)
```bash
npm run clone-site <site-name>
```

### Option 2: Direct command
```bash
node create-new-site.js <site-name>
```

### Example:
```bash
npm run clone-site insanitygolf
```

This will:
1. ✅ Copy the entire basesite to `../insanitygolf`
2. ✅ Update package.json with the new site name
3. ✅ Create a `.env.local` template with placeholders
4. ✅ Clean all build files and caches
5. ✅ Remove the clone script from the new site

## 📋 After Creating a New Site

1. **Navigate to your new site:**
   ```bash
   cd ../insanitygolf
   ```

2. **Update `.env.local` with your credentials:**
   - MongoDB connection string
   - NextAuth secret
   - Stripe keys (if using payments)
   - Email configuration (if using emails)

3. **Install dependencies (if needed):**
   ```bash
   npm install
   ```

4. **Start development:**
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup

Each new site should have its own MongoDB database:

1. Create a new database in MongoDB Atlas (or your MongoDB provider)
2. The database will have the structure already defined (from basesite models)
3. Collections will be created automatically when you add data
4. Use the admin scripts to seed initial data if needed

## 📁 What's Included

- ✅ All Next.js app structure
- ✅ MongoDB models and schemas
- ✅ Authentication setup (NextAuth)
- ✅ Stripe integration (optional)
- ✅ Admin dashboard
- ✅ Product/Category/Order management
- ✅ Referral system
- ✅ Blog/CMS functionality
- ✅ Empty database (structure only, no data)

## 🔧 Customization

After cloning, you can customize:
- Site name and branding
- Database content
- Configuration in `.env.local`
- Site-specific features

## ⚠️ Important Notes

- **Don't modify the basesite directly** - it's your template!
- Each site is independent with its own database
- Keep basesite clean and up-to-date
- When you improve basesite, you can manually port changes to existing sites

## 🛠️ Basesite Maintenance

To update the basesite template:
1. Make changes in the basesite folder
2. Test thoroughly
3. New sites created after will have the updates
4. Existing sites need manual updates if desired

---

**Happy building! 🚀**
