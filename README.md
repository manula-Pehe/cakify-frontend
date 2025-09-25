# Cakify – Frontend
**From Oven to Order – A delightful web experience for a home-based bakery.**  

This is the **frontend web application** for the Cakify project.  
Customers can browse cakes, place orders, and send inquiries, while the admin manages products, orders, and customer inquiries through a secure dashboard.  

---

## ✨ Features

### 🌐 Customer
- Browse cakes by category (birthday, wedding, party, etc.)
- View cake details (image, description, size, price)
- Place orders with personal details
- Send inquiries via a contact form
- View featured cakes on the home page

### 🔑 Admin
- Secure login (owner only)
- Dashboard overview with quick stats
- Manage products (CRUD operations, categories, availability)
- Manage orders (CRUD operations, update order status: Pending → Processing → Shipped → Completed)
- Manage customer inquiries (reply, mark resolved, delete spam)

---

## 🛠 Tech Stack
- **React + TypeScript (Vite)**
- **Tailwind CSS**

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/manula-Pehe/cakify-frontend.git
```
```bash
cd cakify-frontend
```
### 2. Install dependencies
```bash
npm install
```
### 3. Start the development server
```bash
npm run dev
```

This will start the frontend on 👉 http://localhost:5173

## 🌐 API Configuration
The frontend expects a backend running at http://localhost:8080 by default.
You can override this by creating a .env file at the root:
```bash
VITE_API_BASE_URL=http://localhost:8080
```

## 👥 Collaboration Workflow

- **Feature branches for development**  
  Each team member works on a branch per feature. Example branch names:
  - `feat/products-crud`
  - `feat/orders-crud`
  - `feat/inquiries-module`
  - `fix/navbar-responsive`

- **Pull Requests (PRs) to `main`**  
  - Push your branch and open a PR.  
  - Request at least one review.  
  - Merge only after approval.  

- **Protected `main` branch**  
  - Direct pushes to `main` are disabled.  
  - All changes must go through the PR + review process.  
  - Keeps `main` always in a working state for demos.  

## 📌 Project Team

- **IT24100315** – Ashen Bandara  
- **IT24100487** – M.K.M. Pehesara  
- **IT24101492** – R.M.A. Priyashan  
- **IT24101512** – E.J.M.S. De Silva  
