# Man Up! Inc. - Sisterhood Initiative

A complete participant registration and management system for the Sisterhood Initiative program.

## Project Structure

```
MUI-Sisterhood/
├── index.html          # Landing page
├── signup.html         # Public registration form
├── admin.html          # Staff dashboard
├── test-connection.html # Database diagnostic tool
├── diagnostic.html     # Advanced diagnostics
├── supabase-schema.sql # Database schema
├── admin-auth-schema.sql # Admin authentication
└── backend/
    ├── server.js       # Express API server
    ├── package.json    # Dependencies
    ├── config/
    │   └── supabase.js # Database client
    ├── middleware/
    │   ├── auth.js     # JWT authentication
    │   └── validation.js # Input validation
    └── routes/
        ├── auth.js     # Authentication routes
        └── sisterhood.js # Program routes
```

## Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Run `supabase-schema.sql` in SQL Editor
4. Run `admin-auth-schema.sql` for admin users

### 2. Configure Environment
Create `.env` file in project root:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=your_jwt_secret
PORT=3002
```

### 3. Update Frontend
Update `signup.html` with your Supabase credentials:
```javascript
const SUPABASE_URL = 'your_supabase_url';
const SUPABASE_ANON_KEY = 'your_anon_key';
```

### 4. Start Backend
```bash
cd backend
npm install
npm start
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sisterhood/signup` | POST | Public registration |
| `/api/sisterhood/signups` | GET | List all (admin) |
| `/api/sisterhood/signups/:id` | GET | Get one (admin) |
| `/api/sisterhood/signups/:id` | PUT | Update (admin) |
| `/api/sisterhood/signups/:id` | DELETE | Delete (admin) |
| `/api/sisterhood/stats` | GET | Statistics (admin) |

## Contact

For program questions: sisterhood@manupinc.org
