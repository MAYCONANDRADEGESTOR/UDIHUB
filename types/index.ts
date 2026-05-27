export type UserRole = "client" | "professional" | "admin";
export type PlanType = "basic" | "pro";
export type SubscriptionStatus = "active" | "inactive" | "canceled" | "pending";
export type ReportStatus = "pending" | "reviewed" | "resolved";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  city?: string;
  neighborhood?: string;
  banned: boolean;
  ban_reason?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  active: boolean;
}

export interface City {
  id: string;
  name: string;
  slug: string;
  state: string;
  enabled: boolean;
}

export interface Neighborhood {
  id: string;
  city_id: string;
  name: string;
  slug: string;
}

export interface Professional {
  id: string;
  user_id: string;
  slug: string;
  bio?: string;
  whatsapp: string;
  category_id: string;
  status: "active" | "inactive" | "suspended";
  plan: PlanType;
  featured: boolean;
  views_count: number;
  avg_rating: number;
  available_now: boolean;
  created_at: string;
  // Relations
  user?: User;
  category?: Category;
  neighborhoods?: Neighborhood[];
  photos?: ProfessionalPhoto[];
  subscription?: Subscription;
}

export interface ProfessionalPhoto {
  id: string;
  professional_id: string;
  url: string;
  caption?: string;
  order: number;
}

export interface Review {
  id: string;
  professional_id: string;
  client_id: string;
  rating: number;
  comment: string;
  reply?: string;
  created_at: string;
  // Relations
  client?: User;
}

export interface Subscription {
  id: string;
  professional_id: string;
  plan: PlanType;
  status: SubscriptionStatus;
  asaas_subscription_id?: string;
  next_billing?: string;
  created_at: string;
}

export interface Lead {
  id: string;
  professional_id: string;
  clicker_id?: string;
  city?: string;
  neighborhood?: string;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  professional_id: string;
  reason: string;
  status: ReportStatus;
  created_at: string;
  // Relations
  reporter?: User;
  professional?: Professional;
}

// Filter types
export interface SearchFilters {
  city?: string;
  neighborhood?: string;
  category?: string;
  minRating?: number;
  availableNow?: boolean;
  sortBy?: "nearest" | "best_rated" | "newest";
}
