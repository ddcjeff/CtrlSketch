# CtrlSketch Pro - Web Application Setup

## Project Structure
```
ctrlsketch-pro/
├── public/                     # Static assets
│   ├── favicon.ico
│   └── logo.svg
├── src/
│   ├── components/             # UI components
│   │   ├── canvas/            
│   │   │   ├── Canvas.tsx
│   │   │   ├── Grid.tsx
│   │   │   └── ...
│   │   ├── shared/
│   │   │   ├── Navbar.tsx
│   │   │   └── ...
│   │   ├── shapes/
│   │   │   ├── Shape.tsx
│   │   │   └── ...
│   │   ├── tools/
│   │   │   ├── TitleBlock.tsx
│   │   │   ├── BOMManager.tsx
│   │   │   └── ...
│   │   └── ui/                 # ShadCN UI components
│   ├── contexts/               # React Context providers
│   │   ├── AuthContext.tsx     # Authentication state
│   │   ├── ProjectContext.tsx  # Current project data
│   │   └── CollaborationContext.tsx # Real-time state
│   ├── hooks/                  # Custom React hooks
│   │   ├── useCanvas.ts
│   │   ├── useShapes.ts
│   │   └── ...
│   ├── lib/                    # Utility functions
│   │   ├── supabase.ts         # Supabase client
│   │   └── stripe.ts           # Stripe integration
│   ├── pages/                  # Application pages
│   │   ├── auth/
│   │   │   ├── login.tsx
│   │   │   └── signup.tsx
│   │   ├── dashboard.tsx       # Project dashboard
│   │   ├── editor.tsx          # Main drawing editor
│   │   ├── settings.tsx        # User settings
│   │   └── pricing.tsx         # Subscription plans
│   ├── styles/                 # CSS/Tailwind styles
│   │   └── globals.css
│   ├── types/                  # TypeScript declarations
│   │   ├── shapes.ts
│   │   └── ...
│   ├── App.tsx                 # Main app component
│   └── main.tsx                # Entry point
├── .env.example                # Example environment variables
├── .gitignore
├── package.json
├── README.md
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts              # Vite configuration
```

## Database Schema (Supabase)

### Tables:

1. **users** - User accounts
   - id (primary key)
   - email
   - name
   - stripe_customer_id
   - subscription_tier
   - created_at
   - updated_at

2. **projects** - User projects
   - id (primary key)
   - name
   - description
   - owner_id (foreign key to users.id)
   - settings (jsonb)
   - created_at
   - updated_at

3. **pages** - Drawing pages within projects
   - id (primary key)
   - project_id (foreign key to projects.id)
   - name
   - order_index
   - created_at
   - updated_at

4. **shapes** - Shapes on drawing pages
   - id (primary key)
   - page_id (foreign key to pages.id)
   - type (enum: rectangle, circle, line, etc)
   - properties (jsonb - position, size, color, etc)
   - metadata (jsonb - custom properties for BOM)
   - created_at
   - updated_at

5. **collaborators** - Project sharing
   - id (primary key)
   - project_id (foreign key to projects.id)
   - user_id (foreign key to users.id)
   - role (enum: viewer, editor, admin)
   - created_at

6. **parts_catalog** - Parts database
   - id (primary key)
   - name
   - description
   - category
   - specifications (jsonb)
   - created_at
   - updated_at

## Integration Points

### Authentication Flow

1. User signs up/logs in via Auth UI
2. Supabase handles authentication
3. Create Stripe customer on signup
4. Store Stripe customer ID in users table
5. Redirect to dashboard or editor

### Subscription Flow

1. User selects subscription plan
2. Create Stripe Checkout session
3. Redirect to Stripe Checkout
4. Handle webhook for successful payment
5. Update user's subscription tier
6. Grant access to appropriate features

### Real-time Collaboration

1. Subscribe to Supabase real-time changes on projects
2. Implement presence indicators via Supabase real-time
3. Send cursor position and shape modifications events
4. Implement conflict resolution for simultaneous edits

## Deployment Strategy

1. Frontend: Vercel (connected to GitHub repository)
2. Database: Supabase (provisioned PostgreSQL)
3. Payment Processing: Stripe
4. CI/CD: GitHub Actions
   - Run tests on pull requests
   - Auto-deploy on merge to main