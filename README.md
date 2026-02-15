# Material Demand Forecasting System

A comprehensive supply chain management tool designed to forecast material demand using an ensemble of Machine Learning models (XGBoost, Random Forest, etc.) and visualize insights through a modern React dashboard.

## 🚀 Live Application

- **Frontend**: [https://demand-frontend-5obehzt5ja-uc.a.run.app](https://demand-frontend-5obehzt5ja-uc.a.run.app)
- **Backend API**: [https://demand-backend-5obehzt5ja-uc.a.run.app](https://demand-backend-5obehzt5ja-uc.a.run.app)

---

## ✨ Features

- **Demand Forecasting**: Uses an automated ensemble of ML models with stable fallbacks.
- **Interactive Dashboard**: Real-time KPI cards and trend charts powered by Recharts.
- **Scenario Management**: Create new forecasts for different products and time horizons.
- **Data Export**: Export forecasting results to CSV for external use.
- **Low Stock Alerts**: Automated identification of items requiring replenishment.
- **Modern UI**: Built with Shadcn UI, Tailwind CSS, and Lucide icons.

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Django / Django REST Framework
- **Machine Learning**: Scikit-learn, XGBoost, Pandas, NumPy
- **Database**: PostgreSQL (Production) / SQLite (Development)
- **Serving**: Gunicorn / Whitenoise

### Frontend
- **Framework**: React (Vite) / TypeScript
- **Styling**: Tailwind CSS / Shadcn UI
- **Data Fetching**: TanStack Query / Fetch API
- **Charts**: Recharts

---

## ☁️ Cloud Deployment

The system is containerized using Docker and deployed to **Google Cloud Run**.

- **Backend**: Deployed with 2GB RAM to handle ML workloads.
- **Frontend**: Served via Nginx for high-performance static delivery and SPA routing.
- **CI/CD**: Built using Google Cloud Build with specific optimizations for ML library constraints.

---
