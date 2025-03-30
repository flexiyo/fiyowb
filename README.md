# Flexiyo

Flexiyo is a next-generation **social media platform** that integrates **free music streaming** alongside all the essential social networking features. It enables users to share, discover, and enjoy music seamlessly while connecting with friends and creators.

## 🚀 Features

- 🎵 **Free Music Streaming** – Listen to your favorite tracks without any restrictions.
- 👥 **Social Networking** – Follow users, connect with mates, and interact with content.
- 📝 **Post & Clips** – Share photos, videos, and short clips with your audience.
- 💬 **Real-time Chat** – Communicate instantly with friends and creators.
- 🔄 **Dynamic Open Graph (OG) Metadata** – Ensures rich previews for shared content.
- 📌 **Personalized Feed** – Discover content tailored to your interests.
- 🚀 **Fast & Scalable** – Built on **microservices architecture** with **gRPC** and caching.

## 🛠️ Tech Stack

### **Frontend:**
- **React (Vite)** – High-performance UI rendering.
- **Tailwind CSS** – Modern styling for a clean and responsive design.
- **Radix UI** – Accessible components for a better user experience.
- **Framer Motion** – Smooth animations and transitions.

### **Backend:**
- **FiyoGQL (GraphQL API)** – Main public API gateway.
- **gRPC Microservices** – Modular backend architecture with separate services:
  - `FiyoUser` – User management.
  - `FiyoChat` – Chat and messaging.
  - `FiyoFeed` – Posts, clips, and recommendations.
- **PostgreSQL & CassandraDB** – Optimized for structured and high-scale data storage.
- **Valkey (Redis Alternative)** – Caching for low-latency feed retrieval.

## 📦 Deployment

### **Hosting Providers:**
- **Frontend:** Vercel (Fast global deployment for the React app)
- **Backend:**
  - **GraphQL API (FiyoGQL)** → Render
  - **Microservices (FiyoUser, FiyoChat, FiyoFeed, etc.)** → Koyeb (Flexible & scalable hosting)

## 📌 Getting Started

### **Prerequisites**
Ensure you have the following installed:
- Node.js (v18+)
- Yarn or npm
- PostgreSQL & CassandraDB (for backend)

### **Setup & Installation**

#### **Frontend (React + Vite)**
```sh
# Clone the repository
git clone https://github.com/your-username/flexiyo.git
cd flexiyo/frontend

# Install dependencies
yarn install  # or npm install

# Start development server
yarn dev  # or npm run dev
```

#### **Backend (GraphQL & Microservices)**
```sh
# Navigate to backend folder
cd flexiyo/backend

# Install dependencies
yarn install  # or npm install

# Start GraphQL Server
yarn start:graphql  # or npm run start:graphql

# Start microservices
yarn start:services  # or npm run start:services
```

## 📄 API Endpoints
Flexiyo uses a **GraphQL API** to serve client requests efficiently.

Example Query:
```graphql
query {
  getUserProfile(userId: "1234") {
    name
    followers
    musicPreferences
  }
}
```

## 🤝 Contributing
We welcome contributions! Feel free to submit issues, feature requests, or pull requests.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature-name`)
3. Commit changes (`git commit -m "Added new feature"`)
4. Push to branch (`git push origin feature-name`)
5. Submit a PR

## 📜 License
Flexiyo is **proprietary software** developed by [Kaushal Krishna](https://github.com/kaushalkrishna). All rights reserved.

## 🌐 Links
- **Website:** [flexiyo.vercel.app](https://flexiyo.vercel.app)
- **GitHub:** [github.com/your-username/flexiyo](https://github.com/your-username/flexiyo)

