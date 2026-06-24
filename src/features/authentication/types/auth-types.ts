export const Role = {
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  PARENT: "PARENT"
} as const;
export type Role = typeof Role[keyof typeof Role];

export const UserStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED"
} as const;
export type UserStatus = typeof UserStatus[keyof typeof UserStatus];

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: Role;
  status: UserStatus;
  mustChangePassword: boolean;
  phoneNumber: string | null;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: string;
  token: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SessionResponse {
  user: User;
  session: Session;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
