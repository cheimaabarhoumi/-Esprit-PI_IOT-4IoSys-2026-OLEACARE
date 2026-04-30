// Interfaces for type safety
export interface User {
  _id?: string;
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  role: 'admin' | 'farmer';
  farmName?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  profileImage?: string; // Base64 ou URL
  profileImageMime?: string;
  bio?: string;
  website?: string;
  createdAt?: Date;
}

export interface Kit {
  _id?: string;
  id?: string;
  kitId: string;
  model?: string;
  status: 'in_stock' | 'assigned' | 'active' | 'offline' | 'maintenance';
  assignedTo?: User;
  terrainId?: Terrain;
  batteryPercent: number;
  batteryLevel?: number;
  signalStrength: number;
  lastSeen?: Date;
  lastUpdate?: Date;
  location?: string;
  isActive?: boolean;
  createdAt?: Date;
}

export interface Terrain {
  _id?: string;
  id?: string;
  userId?: string;
  name: string;
  variety?: string;
  area?: number;
  surface_hectares?: number;
  numberOfTrees?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  soilType?: string;
  plantingYear?: number;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
}

export interface SensorReading {
  _id: string;
  kitId: string;
  terrainId: string;
  timestamp: Date;
  temperature: number;
  humidity_air: number;
  soil_moisture: number;
  light: number;
}

export interface Prediction {
  _id: string;
  terrainId: string;
  userId: string;
  maturity_index: number;
  quality_grade: 'Extra_Vierge' | 'Vierge' | 'Lampante';
  quality_score: number;
  acidity: number;
  total_oil_liters: number;
  oil_value_TND: number;
  optimal_harvest_date: Date;
  confidence: number;
  createdAt: Date;
}

export interface Alert {
  _id: string;
  userId?: string;
  terrainId?: string;
  type: 'harvest' | 'battery' | 'offline' | 'soil' | 'weather' | 'maintenance' | 'alert';
  title?: string;
  message: string;
  read: boolean;
  createdAt?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  role: 'admin' | 'farmer';
  farmName?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  profileImage?: string;
}


export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    total: number;
    skip: number;
    limit: number;
    pages: number;
  };
}
