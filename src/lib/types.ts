export type ItemStatus = "lost" | "found" | "claimed" | "returned";
export type UserRole = "student" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  phone: string;
  role: UserRole;
}

export interface CampusLocation {
  id: string;
  name: string;
  type: "block" | "room" | "custom";
  parentId?: string; // for rooms inside blocks
}

export interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ItemStatus;
  type: "lost" | "found";
  imageUrl: string;
  date: string;
  locationId: string;
  locationName: string;
  reporterId: string;
  reporterName: string;
  reporterPhone: string;
  createdAt: string;
}

export interface ClaimRequest {
  id: string;
  itemId: string;
  claimantId: string;
  claimantName: string;
  explanation: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export const CATEGORIES = [
  "Electronics", "Books", "Clothing", "Accessories", "ID Cards",
  "Keys", "Bags", "Stationery", "Water Bottles", "Other"
];
