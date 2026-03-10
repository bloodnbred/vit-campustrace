import { Item, CampusLocation, User, ClaimRequest } from "./types";

export const mockUser: User = {
  id: "u1",
  name: "Arjun Sharma",
  email: "arjun@campus.edu",
  rollNumber: "CS2024001",
  phone: "+91 98765 43210",
  role: "student",
};

export const mockLocations: CampusLocation[] = [
  { id: "b1", name: "M Block", type: "block" },
  { id: "r1", name: "M201", type: "room", parentId: "b1" },
  { id: "r2", name: "M202", type: "room", parentId: "b1" },
  { id: "r3", name: "M203", type: "room", parentId: "b1" },
  { id: "r4", name: "M301", type: "room", parentId: "b1" },
  { id: "b2", name: "A Block", type: "block" },
  { id: "r5", name: "A101", type: "room", parentId: "b2" },
  { id: "r6", name: "A102", type: "room", parentId: "b2" },
  { id: "r7", name: "A201", type: "room", parentId: "b2" },
  { id: "b3", name: "B Block", type: "block" },
  { id: "r8", name: "B101", type: "room", parentId: "b3" },
  { id: "r9", name: "B102", type: "room", parentId: "b3" },
  { id: "c1", name: "Library", type: "custom" },
  { id: "c2", name: "Canteen", type: "custom" },
  { id: "c3", name: "Playground", type: "custom" },
  { id: "c4", name: "Parking Area", type: "custom" },
  { id: "c5", name: "Student Den", type: "custom" },
  { id: "c6", name: "Main Corridor", type: "custom" },
  { id: "c7", name: "Pathway - Gate 1", type: "custom" },
];

const images = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=400&h=300&fit=crop",
];

export const mockItems: Item[] = [
  {
    id: "i1", title: "Apple AirPods Pro", description: "White AirPods Pro case with initials 'AS' scratched on the back. Found near the entrance.", category: "Electronics", status: "found", type: "found",
    imageUrl: images[0], date: "2026-03-08", locationId: "r1", locationName: "M201 - M Block", reporterId: "u2", reporterName: "Priya Patel", reporterPhone: "+91 87654 32109", createdAt: "2026-03-08T10:30:00Z",
  },
  {
    id: "i2", title: "Blue Backpack", description: "Navy blue Wildcraft backpack with laptop and notebooks inside. Left after the 3PM lecture.", category: "Bags", status: "lost", type: "lost",
    imageUrl: images[1], date: "2026-03-07", locationId: "r5", locationName: "A101 - A Block", reporterId: "u1", reporterName: "Arjun Sharma", reporterPhone: "+91 98765 43210", createdAt: "2026-03-07T16:45:00Z",
  },
  {
    id: "i3", title: "College ID Card", description: "ID card belonging to Rahul Verma, Department of Computer Science, 3rd year.", category: "ID Cards", status: "found", type: "found",
    imageUrl: images[2], date: "2026-03-09", locationId: "c1", locationName: "Library", reporterId: "u3", reporterName: "Sneha Gupta", reporterPhone: "+91 76543 21098", createdAt: "2026-03-09T09:15:00Z",
  },
  {
    id: "i4", title: "Silver Watch", description: "Titan silver analog watch with brown leather strap. Was kept on the desk during the exam.", category: "Accessories", status: "claimed", type: "lost",
    imageUrl: images[3], date: "2026-03-06", locationId: "r8", locationName: "B101 - B Block", reporterId: "u4", reporterName: "Vikram Singh", reporterPhone: "+91 65432 10987", createdAt: "2026-03-06T14:20:00Z",
  },
  {
    id: "i5", title: "Water Bottle", description: "Stainless steel Milton water bottle, 1 liter, with a dent on the bottom.", category: "Water Bottles", status: "returned", type: "found",
    imageUrl: images[4], date: "2026-03-05", locationId: "c2", locationName: "Canteen", reporterId: "u5", reporterName: "Ananya Reddy", reporterPhone: "+91 54321 09876", createdAt: "2026-03-05T12:00:00Z",
  },
  {
    id: "i6", title: "Set of Keys", description: "Keychain with 3 keys and a small Ganesha charm. Found on the bench near the football field.", category: "Keys", status: "found", type: "found",
    imageUrl: images[5], date: "2026-03-09", locationId: "c3", locationName: "Playground", reporterId: "u2", reporterName: "Priya Patel", reporterPhone: "+91 87654 32109", createdAt: "2026-03-09T17:00:00Z",
  },
];

export const mockClaims: ClaimRequest[] = [
  {
    id: "cl1", itemId: "i4", claimantId: "u6", claimantName: "Rohit Kumar",
    explanation: "This is my watch. I can describe the engraving on the back - it says 'Happy Birthday Rohit - 2024'",
    status: "pending", createdAt: "2026-03-07T11:00:00Z",
  },
];
