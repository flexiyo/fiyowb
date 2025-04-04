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

### **Hosting Providers:** (FREE)
- **Frontend:** Firebase (Fast global deployment for the React app)
- **Backend:**
  - **GraphQL API (FiyoGQL)** → Render
  - **Microservices (FiyoUser, FiyoChat, FiyoFeed, etc.)** → Koyeb (Flexible & scalable hosting)

## 📌 Getting Started

### **Prerequisites**
Ensure you have the following installed:
- Node.js (v18+)
- Yarn or npm
- PostgreSQL & CassandraDB (for backend)

## 🤝 Contributing
We welcome contributions! Feel free to submit issues, feature requests, or pull requests.

## 📜 License
Flexiyo is **proprietary software** developed by [Kaushal Krishna](https://github.com/kaushalkrishnax). All rights reserved.

## 🌐 Links
- **Website:** [flexiyo.web.app](https://flexiyo.web.app)

