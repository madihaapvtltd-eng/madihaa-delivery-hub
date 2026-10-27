import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  Delivery,
  DeliveryTrip,
  Vehicle,
  Driver,
  Boat,
  Island,
  Shop,
  User,
  DeliveryEvent,
  Attachment,
  Staff,
} from '../types';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, addDoc, onSnapshot, doc, updateDoc, getDocs, deleteDoc } from 'firebase/firestore';

interface DataContextType {
  deliveries: Delivery[];
  trips: DeliveryTrip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  boats: Boat[];
  islands: Island[];
  shops: Shop[];
  users: User[];
  events: DeliveryEvent[];
  attachments: Attachment[];
  staff: Staff[];
  addDelivery: (delivery: Omit<Delivery, 'deliveryId' | 'createdAt' | 'updatedAt'>) => Promise<Delivery>;
  updateDelivery: (deliveryId: string, updates: Partial<Delivery>) => void;
  addTrip: (trip: Omit<DeliveryTrip, 'tripId' | 'createdAt'>) => Promise<DeliveryTrip>;
  updateTrip: (tripId: string, updates: Partial<DeliveryTrip>) => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, 'vehicleId'>) => Promise<Vehicle>;
  updateVehicle: (vehicleId: string, updates: Partial<Vehicle>) => void;
  addDriver: (driver: Omit<Driver, 'driverId'>) => Promise<Driver>;
  updateDriver: (driverId: string, updates: Partial<Driver>) => void;
  addBoat: (boat: Omit<Boat, 'boatId'>) => Boat;
  updateBoat: (boatId: string, updates: Partial<Boat>) => void;
  addIsland: (island: Omit<Island, 'islandId'>) => Island;
  updateIsland: (islandId: string, updates: Partial<Island>) => void;
  addShop: (shop: Omit<Shop, 'shopId'>) => Promise<Shop>;
  updateShop: (shopId: string, updates: Partial<Shop>) => void;
  addUser: (user: Omit<User, 'uid' | 'createdAt'>) => Promise<User>;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => Promise<void>;
  addEvent: (event: Omit<DeliveryEvent, 'eventId' | 'eventAt'>) => DeliveryEvent;
  addAttachment: (attachment: Omit<Attachment, 'attachmentId' | 'uploadedAt'>) => Attachment;
  addStaff: (staff: Omit<Staff, 'staffId'>) => Promise<Staff>;
  updateStaff: (staffId: string, updates: Partial<Staff>) => void;
  deleteStaff: (staffId: string) => Promise<void>;
  deleteVehicle: (vehicleId: string) => Promise<void>;
  deleteDriver: (driverId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [trips, setTrips] = useState<DeliveryTrip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [islands, setIslands] = useState<Island[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<DeliveryEvent[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  // Load users from Firestore when Firebase is configured
  useEffect(() => {
    if (isFirebaseConfigured()) {
      const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({
          ...doc.data(),
          uid: doc.id,
        } as User));
        setUsers(usersData);
      });
      return () => unsubscribe();
    }
  }, []);

  // Load shops from Firestore when Firebase is configured
  useEffect(() => {
    if (isFirebaseConfigured()) {
      const unsubscribe = onSnapshot(collection(db, 'shops'), (snapshot) => {
        const shopsData = snapshot.docs.map(doc => doc.data() as Shop);
        setShops(shopsData);
      });
      return () => unsubscribe();
    }
  }, []);

  // Load boats from Firestore when Firebase is configured
  useEffect(() => {
    if (isFirebaseConfigured()) {
      const unsubscribe = onSnapshot(collection(db, 'boats'), (snapshot) => {
        const boatsData = snapshot.docs.map(doc => doc.data() as Boat);
        setBoats(boatsData);
      });
      return () => unsubscribe();
    }
  }, []);

  // Load vehicles from Firestore when Firebase is configured
  useEffect(() => {
    if (isFirebaseConfigured()) {
      const unsubscribe = onSnapshot(collection(db, 'vehicles'), (snapshot) => {
        const vehiclesData = snapshot.docs.map(doc => ({
          ...doc.data(),
          vehicleId: doc.id,
        } as Vehicle));
        setVehicles(vehiclesData);
      });
      return () => unsubscribe();
    }
  }, []);

  // Load drivers from Firestore when Firebase is configured
  useEffect(() => {
    if (isFirebaseConfigured()) {
      const unsubscribe = onSnapshot(collection(db, 'drivers'), (snapshot) => {
        const driversData = snapshot.docs.map(doc => ({
          ...doc.data(),
          driverId: doc.id,
        } as Driver));
        setDrivers(driversData);
      });
      return () => unsubscribe();
    }
  }, []);

  // Load staff from Firestore when Firebase is configured
  useEffect(() => {
    if (isFirebaseConfigured()) {
      const unsubscribe = onSnapshot(collection(db, 'staff'), (snapshot) => {
        const staffData = snapshot.docs.map(doc => ({
          ...doc.data(),
          staffId: doc.id,
        } as Staff));
        setStaff(staffData);
      });
      return () => unsubscribe();
    }
  }, []);

  // Load trips from Firestore when Firebase is configured
  useEffect(() => {
    if (isFirebaseConfigured()) {
      const unsubscribe = onSnapshot(collection(db, 'trips'), (snapshot) => {
        const tripsData = snapshot.docs.map(doc => {
          const data = doc.data() as any;
          // Convert Firestore Timestamps to JavaScript Dates
          return {
            ...data,
            tripDate: data.tripDate?.toDate ? data.tripDate.toDate() : data.tripDate,
            plannedDepartureAt: data.plannedDepartureAt?.toDate ? data.plannedDepartureAt.toDate() : data.plannedDepartureAt,
            actualDepartureAt: data.actualDepartureAt?.toDate ? data.actualDepartureAt.toDate() : data.actualDepartureAt,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          } as DeliveryTrip;
        });
        setTrips(tripsData);
      });
      return () => unsubscribe();
    }
  }, []);

  // Load deliveries from Firestore when Firebase is configured
  useEffect(() => {
    if (isFirebaseConfigured()) {
      const unsubscribe = onSnapshot(collection(db, 'deliveries'), (snapshot) => {
        const deliveriesData = snapshot.docs.map(doc => {
          const data = doc.data() as any;
          // Convert Firestore Timestamps to JavaScript Dates
          return {
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
            expectedDeliveryAt: data.expectedDeliveryAt?.toDate ? data.expectedDeliveryAt.toDate() : data.expectedDeliveryAt,
          } as Delivery;
        });
        setDeliveries(deliveriesData);
      });
      return () => unsubscribe();
    }
  }, []);

  const addDelivery = async (deliveryData: Omit<Delivery, 'deliveryId' | 'createdAt' | 'updatedAt'>): Promise<Delivery> => {
    // Generate delivery ID with date format: DEL-DDMMYYYY-XX
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const dateStr = `${day}${month}${year}`;

    // Count deliveries created today to determine sequence number
    const todayDeliveries = deliveries.filter(d => {
      const deliveryDate = new Date(d.createdAt);
      return (
        deliveryDate.getDate() === today.getDate() &&
        deliveryDate.getMonth() === today.getMonth() &&
        deliveryDate.getFullYear() === today.getFullYear()
      );
    });
    const sequence = String(todayDeliveries.length + 1).padStart(2, '0');

    const newDelivery: Delivery = {
      ...deliveryData,
      deliveryId: `DEL-${dateStr}-${sequence}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (isFirebaseConfigured()) {
      try {
        // Remove undefined values before sending to Firestore
        const firestoreData = Object.fromEntries(
          Object.entries(newDelivery).filter(([_, value]) => value !== undefined)
        );
        await addDoc(collection(db, 'deliveries'), firestoreData);
      } catch (error) {
        console.error('Error adding delivery to Firestore:', error);
      }
    }

    // Don't update local state - let Firestore listener handle it
    return newDelivery;
  };

  const updateDelivery = async (deliveryId: string, updates: Partial<Delivery>) => {
    setDeliveries(prev =>
      prev.map(del =>
        del.deliveryId === deliveryId
          ? { ...del, ...updates, updatedAt: new Date() }
          : del
      )
    );

    // Update Firestore if configured
    if (isFirebaseConfigured()) {
      try {
        // Find the delivery document by deliveryId
        const querySnapshot = await getDocs(collection(db, 'deliveries'));
        const deliveryDoc = querySnapshot.docs.find(doc => doc.data().deliveryId === deliveryId);
        
        if (deliveryDoc) {
          const firestoreUpdates = Object.fromEntries(
            Object.entries({ ...updates, updatedAt: new Date() }).filter(([_, value]) => value !== undefined)
          );
          await updateDoc(doc(db, 'deliveries', deliveryDoc.id), firestoreUpdates);
        }
      } catch (error) {
        console.error('Error updating delivery in Firestore:', error);
      }
    }
  };

  const addTrip = async (tripData: Omit<DeliveryTrip, 'tripId' | 'createdAt'>): Promise<DeliveryTrip> => {
    // Generate trip ID with date format: DEL-TRP-DDMMYYYY-XX
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const dateStr = `${day}${month}${year}`;

    // Count trips created today to determine sequence number
    const todayTrips = trips.filter(t => {
      const tripDate = new Date(t.createdAt);
      return (
        tripDate.getDate() === today.getDate() &&
        tripDate.getMonth() === today.getMonth() &&
        tripDate.getFullYear() === today.getFullYear()
      );
    });
    const sequence = String(todayTrips.length + 1).padStart(2, '0');

    const newTrip: DeliveryTrip = {
      ...tripData,
      tripId: `DEL-TRP-${dateStr}-${sequence}`,
      createdAt: new Date(),
    };

    if (isFirebaseConfigured()) {
      try {
        const firestoreData = Object.fromEntries(
          Object.entries(newTrip).filter(([_, value]) => value !== undefined)
        );
        await addDoc(collection(db, 'trips'), firestoreData);
      } catch (error) {
        console.error('Error adding trip to Firestore:', error);
      }
    }

    return newTrip;
  };

  const updateTrip = async (tripId: string, updates: Partial<DeliveryTrip>) => {
    setTrips(prev =>
      prev.map(trip =>
        trip.tripId === tripId
          ? { ...trip, ...updates }
          : trip
      )
    );

    if (isFirebaseConfigured()) {
      try {
        const querySnapshot = await getDocs(collection(db, 'trips'));
        const tripDoc = querySnapshot.docs.find(doc => doc.data().tripId === tripId);

        if (tripDoc) {
          const firestoreUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, value]) => value !== undefined)
          );
          await updateDoc(doc(db, 'trips', tripDoc.id), firestoreUpdates);
        }
      } catch (error) {
        console.error('Error updating trip in Firestore:', error);
      }
    }
  };

  const addVehicle = async (vehicleData: Omit<Vehicle, 'vehicleId'>): Promise<Vehicle> => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      vehicleId: `VEH-${Date.now().toString(36).toUpperCase()}`,
    };
    
    if (isFirebaseConfigured()) {
      try {
        const firestoreData = Object.fromEntries(
          Object.entries(newVehicle).filter(([_, value]) => value !== undefined)
        );
        await addDoc(collection(db, 'vehicles'), firestoreData);
      } catch (error) {
        console.error('Error adding vehicle to Firestore:', error);
      }
    }
    
    // Don't update local state - let Firestore listener handle it
    return newVehicle;
  };

  const updateVehicle = async (vehicleId: string, updates: Partial<Vehicle>) => {
    if (isFirebaseConfigured()) {
      try {
        const querySnapshot = await getDocs(collection(db, 'vehicles'));
        const vehicleDoc = querySnapshot.docs.find(doc => doc.data().vehicleId === vehicleId);
        
        if (vehicleDoc) {
          const firestoreUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, value]) => value !== undefined)
          );
          await updateDoc(doc(db, 'vehicles', vehicleDoc.id), firestoreUpdates);
        }
      } catch (error) {
        console.error('Error updating vehicle in Firestore:', error);
      }
    }
    
    // Don't update local state - let Firestore listener handle it
  };

  const addDriver = async (driverData: Omit<Driver, 'driverId'>): Promise<Driver> => {
    const newDriver: Driver = {
      ...driverData,
      driverId: `DRV-${Date.now().toString(36).toUpperCase()}`,
    };
    
    if (isFirebaseConfigured()) {
      try {
        const firestoreData = Object.fromEntries(
          Object.entries(newDriver).filter(([_, value]) => value !== undefined)
        );
        await addDoc(collection(db, 'drivers'), firestoreData);
      } catch (error) {
        console.error('Error adding driver to Firestore:', error);
      }
    }
    
    // Don't update local state - let Firestore listener handle it
    return newDriver;
  };

  const updateDriver = async (driverId: string, updates: Partial<Driver>) => {
    if (isFirebaseConfigured()) {
      try {
        const querySnapshot = await getDocs(collection(db, 'drivers'));
        const driverDoc = querySnapshot.docs.find(doc => doc.data().driverId === driverId);
        
        if (driverDoc) {
          const firestoreUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, value]) => value !== undefined)
          );
          await updateDoc(doc(db, 'drivers', driverDoc.id), firestoreUpdates);
        }
      } catch (error) {
        console.error('Error updating driver in Firestore:', error);
      }
    }
    
    // Don't update local state - let Firestore listener handle it
  };

  const addStaff = async (staffData: Omit<Staff, 'staffId'>): Promise<Staff> => {
    const newStaff: Staff = {
      ...staffData,
      staffId: `STF-${Date.now().toString(36).toUpperCase()}`,
    };
    
    if (isFirebaseConfigured()) {
      try {
        const firestoreData = Object.fromEntries(
          Object.entries(newStaff).filter(([_, value]) => value !== undefined)
        );
        await addDoc(collection(db, 'staff'), firestoreData);
      } catch (error) {
        console.error('Error adding staff to Firestore:', error);
      }
    }
    
    // Don't update local state - let Firestore listener handle it
    return newStaff;
  };

  const updateStaff = async (staffId: string, updates: Partial<Staff>) => {
    if (isFirebaseConfigured()) {
      try {
        const querySnapshot = await getDocs(collection(db, 'staff'));
        const staffDoc = querySnapshot.docs.find(doc => doc.data().staffId === staffId);
        
        if (staffDoc) {
          const firestoreUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, value]) => value !== undefined)
          );
          await updateDoc(doc(db, 'staff', staffDoc.id), firestoreUpdates);
        }
      } catch (error) {
        console.error('Error updating staff in Firestore:', error);
      }
    }
    
    // Don't update local state - let Firestore listener handle it
  };

  const addBoat = (boatData: Omit<Boat, 'boatId'>): Boat => {
    const newBoat: Boat = {
      ...boatData,
      boatId: `BOAT-${Date.now().toString(36).toUpperCase()}`,
    };
    setBoats(prev => [newBoat, ...prev]);
    return newBoat;
  };

  const updateBoat = (boatId: string, updates: Partial<Boat>) => {
    setBoats(prev =>
      prev.map(boat =>
        boat.boatId === boatId
          ? { ...boat, ...updates }
          : boat
      )
    );
  };

  const addIsland = (islandData: Omit<Island, 'islandId'>): Island => {
    const newIsland: Island = {
      ...islandData,
      islandId: `ISL-${Date.now().toString(36).toUpperCase()}`,
    };
    setIslands(prev => [newIsland, ...prev]);
    return newIsland;
  };

  const updateIsland = (islandId: string, updates: Partial<Island>) => {
    setIslands(prev =>
      prev.map(island =>
        island.islandId === islandId
          ? { ...island, ...updates }
          : island
      )
    );
  };

  const addShop = async (shopData: Omit<Shop, 'shopId'>): Promise<Shop> => {
    const newShop: Shop = {
      ...shopData,
      shopId: `SHOP-${Date.now().toString(36).toUpperCase()}`,
    };
    
    if (isFirebaseConfigured()) {
      try {
        await addDoc(collection(db, 'shops'), newShop);
      } catch (error) {
        console.error('Error adding shop to Firestore:', error);
      }
    }
    
    setShops(prev => [newShop, ...prev]);
    return newShop;
  };

  const updateShop = (shopId: string, updates: Partial<Shop>) => {
    setShops(prev =>
      prev.map(shop =>
        shop.shopId === shopId
          ? { ...shop, ...updates }
          : shop
      )
    );
  };

  const addUser = async (userData: Omit<User, 'uid' | 'createdAt'>): Promise<User> => {
    const newUser: User = {
      ...userData,
      uid: '', // Will be set by Firestore document ID
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    console.log('Adding user to Firestore:', newUser);
    
    if (isFirebaseConfigured()) {
      try {
        const docRef = await addDoc(collection(db, 'users'), newUser);
        newUser.uid = docRef.id;
        console.log('User saved to Firestore successfully with ID:', docRef.id);
        // Don't add to local state - Firestore onSnapshot will handle it
        return newUser;
      } catch (error) {
        console.error('Error adding user to Firestore:', error);
        throw error;
      }
    } else {
      // Fallback for development without Firebase
      newUser.uid = `USR-${Date.now().toString(36).toUpperCase()}`;
      setUsers(prev => [newUser, ...prev]);
      return newUser;
    }
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev =>
      prev.map(user =>
        user.uid === userId
          ? { ...user, ...updates, updatedAt: new Date() }
          : user
      )
    );
  };

  const deleteUser = async (userId: string) => {
    if (isFirebaseConfigured()) {
      await deleteDoc(doc(db, 'users', userId));
    }
  };

  const deleteStaff = async (staffId: string) => {
    if (isFirebaseConfigured()) {
      await deleteDoc(doc(db, 'staff', staffId));
    }
  };

  const deleteVehicle = async (vehicleId: string) => {
    if (isFirebaseConfigured()) {
      await deleteDoc(doc(db, 'vehicles', vehicleId));
    }
  };

  const deleteDriver = async (driverId: string) => {
    if (isFirebaseConfigured()) {
      await deleteDoc(doc(db, 'drivers', driverId));
    }
  };

  const addEvent = (eventData: Omit<DeliveryEvent, 'eventId' | 'eventAt'>): DeliveryEvent => {
    const newEvent: DeliveryEvent = {
      ...eventData,
      eventId: `EVT-${Date.now().toString(36).toUpperCase()}`,
      eventAt: new Date(),
    };
    setEvents(prev => [newEvent, ...prev]);
    return newEvent;
  };

  const addAttachment = (attachmentData: Omit<Attachment, 'attachmentId' | 'uploadedAt'>): Attachment => {
    const newAttachment: Attachment = {
      ...attachmentData,
      attachmentId: `ATT-${Date.now().toString(36).toUpperCase()}`,
      uploadedAt: new Date(),
    };
    setAttachments(prev => [newAttachment, ...prev]);
    return newAttachment;
  };

  return (
    <DataContext.Provider
      value={{
        deliveries,
        trips,
        vehicles,
        drivers,
        boats,
        islands,
        shops,
        users,
        events,
        attachments,
        staff,
        addDelivery,
        updateDelivery,
        addTrip,
        updateTrip,
        addVehicle,
        updateVehicle,
        addDriver,
        updateDriver,
        addBoat,
        updateBoat,
        addIsland,
        updateIsland,
        addShop,
        updateShop,
        addUser,
        updateUser,
        deleteUser,
        addEvent,
        addAttachment,
        addStaff,
        updateStaff,
        deleteStaff,
        deleteVehicle,
        deleteDriver,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
