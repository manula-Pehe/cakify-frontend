export interface Cake {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category?: string; // For backward compatibility
  categoryId?: number;
  categoryName?: string;
  sizes: string[];
  availability: boolean;
  featured: boolean;
  averageRating?: number;
  reviewCount?: number;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  cakeId: string;
  cakeName: string;
  size: string;
  deliveryDate: string;
  notes?: string;
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered";
  orderDate: string;
  total: number;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
  status: "new" | "replied" | "resolved";
}

export const cakes: Cake[] = [
  {
    id: "1",
    name: "Classic Chocolate Cake",
    description: "Rich, moist chocolate cake with creamy chocolate frosting and chocolate shavings",
    price: 35,
    image: "/api/placeholder/400/400",
    category: "Birthday",
    sizes: ["6 inch", "8 inch", "10 inch"],
    availability: true,
    featured: true,
  },
  {
    id: "2",
    name: "Vanilla Bean Delight",
    description: "Light vanilla sponge cake with vanilla buttercream and fresh berries",
    price: 30,
    image: "/api/placeholder/400/400",
    category: "Birthday",
    sizes: ["6 inch", "8 inch", "10 inch"],
    availability: true,
    featured: true,
  },
  {
    id: "3",
    name: "Red Velvet Romance",
    description: "Velvet red cake layers with cream cheese frosting and white chocolate curls",
    price: 40,
    image: "/api/placeholder/400/400",
    category: "Wedding",
    sizes: ["6 inch", "8 inch", "10 inch", "12 inch"],
    availability: true,
    featured: true,
  },
  {
    id: "4",
    name: "Lemon Zest Surprise",
    description: "Fresh lemon cake with lemon curd filling and lemon buttercream",
    price: 32,
    image: "/api/placeholder/400/400",
    category: "Party",
    sizes: ["6 inch", "8 inch"],
    availability: true,
    featured: false,
  },
  {
    id: "5",
    name: "Strawberry Dream",
    description: "Strawberry cake with fresh strawberry filling and whipped cream frosting",
    price: 38,
    image: "/api/placeholder/400/400",
    category: "Birthday",
    sizes: ["6 inch", "8 inch", "10 inch"],
    availability: true,
    featured: false,
  },
  {
    id: "6",
    name: "Elegant Wedding Tier",
    description: "Three-tier wedding cake with white fondant and sugar flowers",
    price: 150,
    image: "/api/placeholder/400/400",
    category: "Wedding",
    sizes: ["Multi-tier"],
    availability: true,
    featured: true,
  },
];

export const orders: Order[] = [
  {
    id: "ORD-001",
    customerName: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "555-0123",
    address: "123 Main St, Springfield",
    cakeId: "1",
    cakeName: "Classic Chocolate Cake",
    size: "8 inch",
    deliveryDate: "2024-01-15",
    notes: "Happy Birthday Sarah - please add roses",
    status: "confirmed",
    orderDate: "2024-01-10",
    total: 35,
  },
  {
    id: "ORD-002",
    customerName: "Mike Chen",
    email: "mike@example.com",
    phone: "555-0124",
    address: "456 Oak Ave, Springfield",
    cakeId: "3",
    cakeName: "Red Velvet Romance",
    size: "10 inch",
    deliveryDate: "2024-01-20",
    status: "preparing",
    orderDate: "2024-01-12",
    total: 40,
  },
  {
    id: "ORD-003",
    customerName: "Emily Davis",
    email: "emily@example.com",
    phone: "555-0125",
    address: "789 Pine Rd, Springfield",
    cakeId: "6",
    cakeName: "Elegant Wedding Tier",
    size: "Multi-tier",
    deliveryDate: "2024-02-14",
    notes: "Wedding cake for 100 guests",
    status: "pending",
    orderDate: "2024-01-14",
    total: 150,
  },
];

export const inquiries: Inquiry[] = [
  {
    id: "INQ-001",
    name: "Lisa Brown",
    email: "lisa@example.com",
    message: "Hi! I'm interested in ordering a custom birthday cake for my daughter's 5th birthday. She loves unicorns. Can you create a unicorn-themed cake?",
    date: "2024-01-12",
    status: "new",
  },
  {
    id: "INQ-002",
    name: "Robert Wilson",
    email: "robert@example.com",
    message: "Do you offer gluten-free options? My wife has celiac disease but we'd love to order a cake for our anniversary.",
    date: "2024-01-11",
    status: "replied",
  },
  {
    id: "INQ-003",
    name: "Amanda Foster",
    email: "amanda@example.com",
    message: "What's your delivery radius? I live about 20 miles from your location and would like to know if you deliver to my area.",
    date: "2024-01-10",
    status: "resolved",
  },
];

export const analytics = {
  monthlyRevenue: [
    { month: "Jan", revenue: 4200 },
    { month: "Feb", revenue: 3800 },
    { month: "Mar", revenue: 5100 },
    { month: "Apr", revenue: 4700 },
    { month: "May", revenue: 5500 },
    { month: "Jun", revenue: 6200 },
  ],
  popularCakes: [
    { name: "Chocolate Cake", orders: 45 },
    { name: "Red Velvet", orders: 32 },
    { name: "Vanilla Bean", orders: 28 },
    { name: "Lemon Zest", orders: 18 },
    { name: "Strawberry", orders: 15 },
  ],
  stats: {
    totalOrders: 156,
    pendingOrders: 8,
    totalCakes: 6,
    newInquiries: 3,
  },
};