# Changelog

All notable changes to Madihaa Delivery Hub will be documented in this file.

## [Unreleased]

### Added
- **Passcode-Based Authentication System**
  - Implemented 4-digit passcode login instead of password
  - Added passcode field to User type
  - Added passcode input field to user creation/editing form
  - Added passcode input to login page with numeric validation
  - Implemented first-time setup for creating initial Super Admin
  - Passcode validation in AuthContext using DataContext users

- **Role-Based Access Control (RBAC)**
  - Implemented comprehensive permission system for 4 user roles:
    - Super Admin
    - Wholesale Staff
    - Godown Staff
    - Preparation Team
  - Added permission checks to all major pages and actions
  - Created permission matrix in README.md

- **Page Access Controls**
  - PreparationPage: Added `canChangeStatus` permission check
  - BoatsPage: Added `canCreateBoats` and `canCreateIslands` permission checks
  - TripsPage: Added `canCreateTrips` permission check and view access restriction
  - ShopsPage: Added `canCreateShops`, `canEditShops`, `canDeleteShops` permission checks
  - WholesalePage: Added `canCreateNewDelivery` and `canHandoverPhysicalBills` permission checks
  - DeliveryPage: Added `canCreateTrips` permission check for Create Trip tab

- **Firestore Integration**
  - Added Firestore save functionality for user creation
  - Added Firestore onSnapshot listener for users collection
  - Updated Firestore rules to allow users collection access for authenticated users
  - Fixed duplicate user issue by removing local state addition when Firebase is configured

- **Documentation**
  - Updated README.md with detailed user roles and access levels
  - Added permission matrix table
  - Added authentication documentation
  - Added first-time setup instructions

### Changed
- **AuthContext**
  - Removed Firebase Authentication dependency
  - Now uses DataContext users array for authentication
  - Added `setUserDirectly` method for immediate user state setting
  - Updated login function to accept passcode instead of password

- **App.tsx**
  - Wrapped AuthProvider inside DataProvider for proper context access

- **User Type**
  - Added `passcode: string` field to User interface

### Fixed
- Fixed duplicate user key error in UsersPage by preventing local state addition when Firebase syncs
- Fixed login flow after user creation by using `setUserDirectly` instead of relying on login function
- Fixed Firestore document ID handling in addUser function

### Security
- Passcode-based authentication provides simpler but secure login for delivery operations
- Role-based access control ensures users can only access features relevant to their role
- Firestore security rules updated for development mode access

## [Previous Versions]

### Initial Release
- Basic delivery tracking system
- Demo mode with mock data
- Firebase integration capability
- Delivery workflow management
- Vehicle and driver management
- Boat and island tracking
