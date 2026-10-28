// User Roles
export type UserRole = 
  | 'super_admin'
  | 'wholesale_staff'
  | 'godown_staff'
  | 'preparation_team';

// Delivery Status
export type DeliveryStatus =
  | 'new_entry'
  | 'awaiting_physical_bill'
  | 'handed_to_godown'
  | 'physical_bill_received'
  | 'awaiting_preparation'
  | 'preparation_in_progress'
  | 'partially_prepared'
  | 'preparation_completed'
  | 'ready_for_loading'
  | 'loading_in_progress'
  | 'loaded'
  | 'dispatched'
  | 'delivered'
  | 'late_delivery'
  | 'boat_left'
  | 'rejected'
  | 'delivery_failed'
  | 'on_hold'
  | 'cancelled'
  | 'returned';

// Return Reason
export type ReturnReason =
  | 'boat_left'
  | 'boat_full'
  | 'boat_didnt_arrive'
  | 'shop_closed'
  | 'other';

// Destination Type
export type DestinationType = 
  | 'male_shop'
  | 'hulhumale_shop'
  | 'boat'
  | 'island'
  | 'other';

// Priority
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// User
export interface User {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  permittedShopIds: string[];
  passcode: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Shop
export interface Shop {
  shopId: string;
  shopName: string;
  shopCode: string;
  address: string;
  active: boolean;
}

// Delivery
export interface Delivery {
  deliveryId: string;
  billNumber: string;
  shopId: string;
  destinationType: DestinationType;
  destinationName: string;
  boatName?: string;
  islandName?: string;
  islandCode?: string;
  contactName?: string;
  contactNumber?: string;
  deliveryInstructions?: string;
  expectedDeliveryAt?: Date;
  priority: Priority;
  currentStatus: DeliveryStatus;
  exceptionFlags: string[];
  createdAt: Date;
  createdBy: string;
  entryStaffId?: string;
  physicalBillReceivedAt?: Date;
  physicalBillHandedOverAt?: Date;
  physicalBillHandedOverBy?: string;
  preparationAssignedTo?: string;
  preparationStartedAt?: Date;
  preparationCompletedAt?: Date;
  loadingStartedAt?: Date;
  loadingCompletedAt?: Date;
  dispatchedAt?: Date;
  deliveredAt?: Date;
  boatDepartedAt?: Date;
  updatedAt: Date;
  updatedBy: string;
  tripId?: string;
  boatBatchId?: string;
  vehicleId?: string;
  driverId?: string;
  remarks?: string;
  attachmentIds: string[];
  signature?: string;
  deliveryImage?: string;
  returnReason?: ReturnReason;
  returnReasonDetails?: string;
  totalValue?: number;
}

// Delivery Event
export interface DeliveryEvent {
  eventId: string;
  deliveryId: string;
  eventType: string;
  previousStatus?: DeliveryStatus;
  newStatus?: DeliveryStatus;
  eventAt: Date;
  recordedBy: string;
  remarks?: string;
  attachmentIds: string[];
  originalTimestamp?: Date;
  correctionReason?: string;
}

// Trip Status
export type TripStatus = 'planned' | 'loading' | 'dispatched' | 'completed' | 'cancelled';

// Delivery Trip
export interface DeliveryTrip {
  tripId: string;
  vehicleId: string;
  driverId: string;
  driverNameSnapshot: string;
  driverContactSnapshot: string;
  vehicleNumberSnapshot: string;
  tripDate: Date;
  plannedDepartureAt: Date;
  actualDepartureAt?: Date;
  startingShopId: string;
  destinationSummary: string;
  status: TripStatus;
  deliveryIds: string[];
  remarks?: string;
  createdBy: string;
  createdAt: Date;
}

// Vehicle
export interface Vehicle {
  vehicleId: string;
  registrationNumber: string;
  vehicleType: string;
  capacity?: number;
  active: boolean;
}

// Staff
export interface Staff {
  staffId: string;
  fullName: string;
  department: 'wholesale' | 'preparation' | 'delivery';
  phone?: string;
  employeeId?: string;
  active: boolean;
}

// Driver
export interface Driver {
  driverId: string;
  fullName: string;
  phone: string;
  employeeId?: string;
  active: boolean;
}

// Boat
export interface Boat {
  boatId: string;
  boatName: string;
  active: boolean;
}

// Island
export interface Island {
  islandId: string;
  islandName: string;
  islandCode: string;
  active: boolean;
}

// Boat Departure Batch Status
export type BoatBatchStatus = 'planned' | 'departed' | 'completed' | 'cancelled';

// Boat Departure Batch
export interface BoatDepartureBatch {
  boatBatchId: string;
  boatId: string;
  boatNameSnapshot: string;
  islandSummary: string;
  deliveryIds: string[];
  plannedDepartureAt: Date;
  actualDepartureAt?: Date;
  status: BoatBatchStatus;
  recordedBy: string;
  createdAt: Date;
  remarks?: string;
}

// Attachment
export interface Attachment {
  attachmentId: string;
  deliveryId?: string;
  tripId?: string;
  boatBatchId?: string;
  fileUrl: string;
  fileType: string;
  filePurpose: string;
  uploadedBy: string;
  uploadedAt: Date;
}

// Audit Log
export interface AuditLog {
  auditId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: any;
  after?: any;
  updatedAt: Date;
}

// Delivery History
export interface DeliveryHistory {
  historyId: string;
  boatNames: string[];
  shopNames: string[];
  contactNames: string[];
  contactNumbers: string[];
  updatedAt: Date;
}
