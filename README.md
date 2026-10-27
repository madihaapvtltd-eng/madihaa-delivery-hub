# Madihaa Delivery Hub

A comprehensive delivery management system for Madihaa Company Pvt Ltd, designed to track deliveries from wholesale shops to retail shops, boats, islands, and other destinations across the Maldives.

## Features

- **Delivery Entry**: Create and track delivery entries with auto-generated unique IDs
- **Role-Based Access Control**: Multiple user roles (Super Admin, Shop Staff, Preparation Team, Dispatch, Driver, Manager)
- **Delivery Workflow**: Complete status tracking from entry to delivery with 12+ status options
- **Multi-Delivery Trips**: Assign multiple deliveries to a single vehicle trip
- **Boat & Island Management**: Track boat departures and island deliveries
- **Preparation Dashboard**: Dedicated interface for preparation team workflow
- **Vehicle & Driver Management**: Manage fleet vehicles and delivery drivers
- **Real-time Dashboard**: Summary statistics and recent activity feed
- **Search & Filtering**: Powerful search across all delivery records
- **Demo Mode**: Test the application locally without Firebase setup

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Icons**: Lucide React
- **Charts**: Recharts
- **Date Utilities**: date-fns
- **Backend (Production)**: Firebase Authentication + Firestore
- **Image Storage**: ImgBB (via secure server endpoint)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd madihaa-delivery-hub
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Demo Mode

The application starts in **Demo Mode** by default, allowing you to test all features without configuring Firebase. Demo users are pre-configured:

- **Admin**: admin@madihaa.com (Super Admin)
- **Shop Staff 1**: staff1@madihaa.com (Wholesale Shop - Male)
- **Shop Staff 2**: staff2@madihaa.com (Wholesale Shop - Hulhumale)
- **Preparation Team**: prep@madihaa.com
- **Dispatch Manager**: dispatch@madihaa.com
- **Driver**: driver1@madihaa.com
- **Manager**: manager@madihaa.com

In demo mode, any password works for login.

## Project Structure

```
src/
├── components/       # Reusable UI components
│   └── Layout.tsx   # Main layout with sidebar navigation
├── contexts/        # React Context providers
│   ├── AuthContext.tsx    # Authentication state
│   └── DataContext.tsx    # Application data state
├── lib/             # Utility functions
│   ├── utils.ts     # Helper functions
│   └── demo-data.ts # Mock data for demo mode
├── pages/           # Page components
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── NewDeliveryPage.tsx
│   ├── AllDeliveriesPage.tsx
│   ├── PreparationPage.tsx
│   ├── TripsPage.tsx
│   ├── VehiclesPage.tsx
│   └── BoatsPage.tsx
├── types/           # TypeScript type definitions
│   └── index.ts
├── App.tsx          # Main application component
└── main.tsx         # Application entry point
```

## User Roles and Access Levels

### Super Administrator
- **Full Access**: All features and pages
- **User Management**: Create, edit, delete users
- **Shop Management**: Create, edit, delete wholesale shops
- **Trip Management**: Create and manage delivery trips
- **Boat & Island**: Create boats and islands
- **Delivery Operations**: Full control over delivery status changes
- **Physical Bills Handover**: Can handover physical bills
- **Reports**: View all reports

### Wholesale Staff
- **View**: Dashboard, New Delivery Entry, Wholesale, Go Down, Delivery, All Deliveries, Boat & Island, Wholesale Shops
- **Create**: New delivery entries, boats, islands
- **Cannot View**: Preparation, Loading, Trips, Vehicles, Staff, Reports, Users, Settings
- **Cannot Create**: Trips, shops
- **Cannot Edit/Delete**: Shops
- **Physical Bills Handover**: Can handover physical bills
- **Delivery Status**: Can change delivery status

### Godown Staff
- **View**: Dashboard, All Deliveries, Wholesale, Go Down, Delivery, Trips
- **Create**: Trips
- **Cannot View**: New Delivery Entry, Preparation, Loading, Vehicles, Staff, Boats, Shops, Reports, Users, Settings
- **Cannot Create**: Boats, islands, shops, new deliveries
- **Cannot Edit/Delete**: Shops
- **Physical Bills Handover**: Cannot handover physical bills
- **Delivery Status**: Can change delivery status

### Preparation Team
- **View**: Dashboard, All Deliveries, Wholesale, Delivery, Preparation
- **Cannot View**: New Delivery Entry, Go Down, Loading, Trips, Vehicles, Staff, Boats, Shops, Reports, Users, Settings
- **Cannot Create**: Boats, islands, trips, shops, new deliveries
- **Cannot Edit/Delete**: Shops
- **Physical Bills Handover**: Cannot handover physical bills
- **Delivery Status**: Can change delivery status
- **Create New Entry**: Cannot create new delivery entries in Wholesale page

### Permission Matrix

| Feature | Super Admin | Wholesale Staff | Godown Staff | Preparation Team |
|---------|-------------|-----------------|--------------|-------------------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| New Delivery Entry | ✅ | ✅ | ❌ | ❌ |
| Wholesale | ✅ | ✅ | ✅ | ✅ |
| Go Down | ✅ | ✅ | ✅ | ❌ |
| Delivery | ✅ | ✅ | ✅ | ✅ |
| All Deliveries | ✅ | ✅ | ✅ | ✅ |
| Preparation | ✅ | ❌ | ❌ | ✅ |
| Loading | ✅ | ❌ | ❌ | ❌ |
| Trips | ✅ | ❌ | ✅ | ❌ |
| Vehicles | ✅ | ❌ | ❌ | ❌ |
| Staff | ✅ | ❌ | ❌ | ❌ |
| Boats | ✅ | ✅ | ❌ | ❌ |
| Shops | ✅ | ✅ | ❌ | ❌ |
| Reports | ✅ | ❌ | ❌ | ❌ |
| Users | ✅ | ❌ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ | ❌ |
| Create Boats | ✅ | ✅ | ❌ | ❌ |
| Create Islands | ✅ | ✅ | ❌ | ❌ |
| Create Trips | ✅ | ❌ | ✅ | ❌ |
| Create Shops | ✅ | ❌ | ❌ | ❌ |
| Edit Shops | ✅ | ❌ | ❌ | ❌ |
| Delete Shops | ✅ | ❌ | ❌ | ❌ |
| Change Delivery Status | ✅ | ✅ | ✅ | ✅ |
| Create New Delivery | ✅ | ✅ | ❌ | ❌ |
| Handover Physical Bills | ✅ | ✅ | ❌ | ❌ |

## Authentication

### Passcode-Based Login
- Users authenticate with email and 4-digit passcode
- Passcode is set during user creation
- Super admin can be created on first-time setup if no users exist
- Passcodes are stored securely in Firestore

### First-Time Setup
When no users exist in the system:
1. Navigate to login page
2. Enter email and 4-digit passcode
3. System automatically creates a Super Admin account
4. User is logged in immediately
5. Subsequent logins require matching email and passcode

## Delivery Workflow

1. **New Entry** - Staff creates delivery entry with bill details
2. **Awaiting Physical Bill** - Waiting for physical bill at godown
3. **Physical Bill Received** - Bill received by godown team
4. **Awaiting Preparation** - Ready for preparation team
5. **Preparation in Progress** - Team preparing goods
6. **Partially Prepared** - Some items prepared, shortages noted
7. **Preparation Completed** - All items ready
8. **Ready for Loading** - Prepared goods awaiting loading
9. **Loading in Progress** - Goods being loaded
10. **Loaded** - All goods loaded onto vehicle
11. **Dispatched** - Vehicle has departed
12. **Delivered** - Delivery completed successfully

### Exception Statuses
- **Late Delivery** - Delivery exceeded expected time
- **Boat Left** - Boat has departed (for island deliveries)
- **Rejected** - Delivery rejected by recipient
- **Delivery Failed** - Delivery could not be completed
- **On Hold** - Delivery temporarily paused
- **Cancelled** - Delivery cancelled

## Firebase Integration (Production)

To connect to Firebase:

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)

2. Enable Authentication:
   - Email/Password provider
   - Add demo users or configure your own

3. Create Firestore database:
   - Start in production mode
   - Apply security rules (see `firestore.rules` section below)

4. Create `.env` file:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

5. Update `src/lib/firebase.ts` with your Firebase configuration

6. Switch to production mode in the login page

## Firestore Security Rules

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function hasRole(role) {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
    }
    
    function hasShopAccess(shopId) {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permittedShopIds.has(shopId);
    }
    
    // Users collection - super admin only
    match /users/{userId} {
      allow read, write: if hasRole('super_admin');
    }
    
    // Deliveries - role-based access
    match /deliveries/{deliveryId} {
      allow read: if isAuthenticated() && 
        (hasRole('super_admin') || hasShopAccess(resource.data.shopId));
      allow create: if isAuthenticated() && hasShopAccess(request.resource.data.shopId);
      allow update: if isAuthenticated() && 
        (hasRole('super_admin') || hasShopAccess(resource.data.shopId));
    }
    
    // Similar rules for other collections...
  }
}
```

## Firestore Indexes

Create the following composite indexes in Firestore Console:

1. **deliveries** collection:
   - Fields: `shopId` (ascending), `createdAt` (descending)
   - Fields: `currentStatus` (ascending), `createdAt` (descending)
   - Fields: `tripId` (ascending)

2. **deliveryTrips** collection:
   - Fields: `status` (ascending), `tripDate` (descending)

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment to Vercel

1. Push your code to GitHub

2. Import the project in Vercel:
   - Connect to your GitHub repository
   - Vercel will auto-detect Vite
   - Add environment variables for Firebase (if using production mode)

3. Deploy:
   - Vercel will automatically build and deploy
   - Your app will be available at `https://your-project.vercel.app`

## Environment Variables

Create a `.env.example` file (do not commit real secrets):

```env
# Firebase Configuration (Production Mode)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# ImgBB API Key (Server-side only - never expose in client)
# This should be set via Vercel environment variables or serverless function
IMGBB_API_KEY=your_imgbb_key
```

## Troubleshooting

### Issue: Port already in use
The dev server will automatically try the next available port (5174, 5175, etc.)

### Issue: TypeScript errors
Run `npm run build` to see full error details. Check that all imports are correct and types match.

### Issue: Demo data not loading
Ensure you're in demo mode. Check the browser console for errors. Clear localStorage if needed.

### Issue: Firebase connection fails
- Verify your `.env` file has correct values
- Check Firebase console that Authentication and Firestore are enabled
- Ensure your domain is added to Firebase authorized domains

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

### Adding New Features

1. Add TypeScript types in `src/types/index.ts`
2. Add data methods in `src/contexts/DataContext.tsx`
3. Create page component in `src/pages/`
4. Add route in `src/App.tsx`
5. Add navigation item in `src/components/Layout.tsx`

## License

Proprietary - Madihaa Company Pvt Ltd

## Support

For technical support, contact the development team.
