

export type CharacterSeries = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
};

export type Character = {
  id: string;
  seriesId: string;
  name: string;
  species: string;
  price: string;
  imageUrl: string;
  imageUrl1: string;
  imageUrl2?: string;
  imageUrl3?: string;
  imageUrl4?: string;
  tags: string[];
  description: string;
  applicants: number;
};

export type CommissionOption = {
  id: string;
  name: string;
  category: string;
  status: '开放中' | '已结束' | '即将开放';
  imageUrl: string;
  tags: string[];
  description:string;
  commissionDate: string; // ISO String for year and month, e.g., "2025-08-01T00:00:00.000Z"
};

export type CommissionStyle = {
  id: string;
  commissionOptionId: string;
  name: string;
  price: string;
  description: string;
  imageUrl: string;
  tags: string[];
};

export type Order = {
  id: string;
  userId: string;
  productName: string; // This holds the style name for commission, character name for adoption
  orderNumber: string;
  orderType: '领养订单' | '委托订单';
  status: '处理中' | '待确认' | '已确认' | '排队中' | '制作中' | '退养中' | '已发货' | '已完成' | '已取消';
  imageUrl: string;
  orderDate: string; // ISO string
  total: string;
  shippingAddress: string;
  applicationData?: ApplicationData;
  cancellationReason?: string;
  shippingTrackingId?: string | null;
  referenceImageUrl?: string | null;
  commissionOptionName?: string; // Storing parent option name for commission orders
  hasFan?: boolean; 
};

export type ApplicationData = {
    userName?: string;
    age?: string;
    phone?: string;
    qq?: string;
    email?: string;
    height?: string;
    weight?: string;
    province?: string;
    city?: string;
    district?: string;
    addressDetail?: string;
    referenceImageUrl?: string | null;
    hasFan?: boolean; 
}

export type SiteContent = {
  commissionTitle: string;
  commissionDescription: string;
  commissionImageUrl: string;
  adoptionTitle: string;
  adoptionDescription: string;
  adoptionImageUrl: string;
  workTitle: string;
  workDescription: string;
  workImageUrl: string;
  adoptionPageDescription: string;
  commissionPageDescription: string;
  adminEmail: string;
  sunriseHour?: number;
  sunsetHour?: number;
  contactInfo?: string;
  adoptionContractText?: string;
  commissionContractText?: string;
  confirmationEmailSubject?: string;
  confirmationEmailBody?: string;
  fanPrice?: number;
};

export type Work = {
  id: string;
  workName: string;
  clientName: string;
  clientCity: string;
  makerName?: string;
  completionDate: string; // ISO String
  imageUrls: string[];
  description?: string;
};

// Represents the user object available throughout the app
export interface CustomUser {
    uid: string;
    email: string | null;
    name: string | null;
    picture: string | null;
    isAdmin?: boolean;
}

// Badge System Types
export type Badge = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  createdAt: string; // ISO String
};

export type BadgeQRCode = {
  id: string; // This is the unique code in the QR, e.g. a UUID
  badgeId: string;
  createdAt: string; // ISO String
  isClaimed: boolean;
  claimedBy?: string; // User ID
  claimedAt?: string; // ISO String
};

export type UserBadge = {
  id: string;
  userId: string;
  badgeId: string;
  claimedAt: string; // ISO String
};
