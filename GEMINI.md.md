<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# generate a GEMINI.md file for this project

Here’s a `GEMINI.md` you can drop into your repo root:

```markdown
# GEMINI.md

## 🔹 Project Overview

Material Demand Forecasting System is a full-stack application for **demand forecasting, inventory optimization, and procurement planning**.  
It uses a **Django REST API + ML engine** on the backend and a **React (Vite) + Tailwind** dashboard on the frontend.

This file documents how to use **Google Gemini** (or any LLM) as an assistant for this project: code navigation, refactoring, debugging, and feature extensions.

---
uhiwefefbuibwef hiuw 
## 🔹 Tech Stack Summary 

- **Backend**
  - Django 4.x
  - Django REST Framework
  - Apps: `forecasting`, `inventory`, `procurement`
  - ML: `pandas`, `numpy`, `scikit-learn`, `xgboost`, `prophet`, `statsmodels`
  - Core ML module: `forecasting/ml_engine.py`
- **Frontend**
  - React 18 + Vite
  - TypeScript
  - Tailwind CSS
  - Recharts (charts)
  - lucide-react (icons)
- **Data / Domain**
  - Products, historical demand, forecasts, inventory levels, procurement orders
  - Metrics: MAE, RMSE, MAPE, accuracy %

---
ibnsdfiub b iasd jkjee ascuibe sksajsdf uiew bjsdv jkbsdc uibsce sdc kje bjcsdui jkbsef fsejkbs kjbdsfu jkbsdf efsbk jbkdc biuef jkbsd eufb ndjsor jsmrb sdjcioe njvksdio e sdjenf jbsdn ejcis enfkvccos jksef  bnmvihfs bkjsdu jksee nbmsdj ejkbsd jkbsc
## 🔹 Repository Structure (High Level)

```txt
project-root/
├── backend/
│   ├── config/               # Django project (settings, urls, wsgi/asgi)
│   ├── forecasting/          # Forecast models, views, serializers, ML engine
│   ├── inventory/            # Inventory models & optimization logic
│   ├── procurement/          # Suppliers & procurement order workflow
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # Main React dashboard (tabs, charts, dark mode)
│   │   ├── main.tsx          # React root, bootstraps <App />
│   │   ├── index.css         # Tailwind styles + CSS variables
│   │   └── (ui components)
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.ts
│   └── package.json
│
└── docs/ (optional)
    ├── GEMINI.md             # You are here
    ├── setup_guide.md
    ├── COMPLETE_SYSTEM_SUMMARY.md
    └── QUICK_START_FRONTEND.md
```

---

## 🔹 How to Run the Project (for the model + humans)

### Backend (Django)

From `backend/`:

```bash
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Key URLs:

- API root: `http://localhost:8000/api/`
- Admin: `http://localhost:8000/admin/`


### Frontend (React + Vite)

From `frontend/`:

```bash
npm install
npm install recharts lucide-react
npm install -D tailwindcss postcss autoprefixer

npm run dev
```

Frontend URL:

- `http://localhost:5173/`

---

## 🔹 How GEMINI Should Interact With This Repo

When using Gemini / an LLM agent with this project, **always follow this order**:

1. **Understand the intent**
    - Check `App.tsx` to see the UI structure (tabs, charts, dark mode).
    - Check `forecasting/ml_engine.py` to understand forecasting logic.
    - Check DRF viewsets in `forecasting/views.py`, `inventory/views.py`, `procurement/views.py` for API behavior.
2. **Use file-aware context**
    - When asked about:
        - **API behavior** → inspect DRF `ViewSet` and `Serializer` classes.
        - **ML changes** → inspect `forecasting/ml_engine.py`.
        - **Dashboard changes** → inspect `frontend/src/App.tsx` and related components.
    - Prefer reading the **actual file content** over guessing behavior.
3. **Respect framework conventions**
    - Django:
        - URLs are registered in `config/urls.py`.
        - Business logic is mostly in `views.py` + `ml_engine.py`.
    - React:
        - Routing/state handled inside `App.tsx` (no React Router by default).
        - Styling via Tailwind utility classes; **do not** rewrite to plain CSS unless explicitly asked.
4. **When modifying code**
    - Keep imports sorted and minimal.
    - Preserve typing in TypeScript (`App.tsx`, hooks).
    - Maintain existing patterns:
        - Use `useState`, `useEffect` hooks for state.
        - Use consistent Tailwind class patterns (`bg-slate-…`, `dark:bg-slate-…`).
        - For Django, respect `ModelSerializer` and `ViewSet` patterns.

---

## 🔹 Typical Tasks for Gemini

Use these patterns when user asks for help:

### 1. Add a new ML algorithm

- Files to inspect/edit:
    - `backend/forecasting/ml_engine.py`
    - `backend/forecasting/views.py` (forecast endpoint)
- Steps:
    - Add new method: e.g. `forecast_lstm()` inside `DemandForecaster`.
    - Register it in ensemble / method selector, if needed.
    - Ensure output format matches existing forecasts (dates, values, metrics).


### 2. Add a new metric to dashboard

- Backend:
    - Expose metric via a new field in a serializer or via a new endpoint.
- Frontend:
    - Update `App.tsx`:
        - Add to stats cards grid.
        - Optionally add a new chart or tab for that metric.


### 3. Modify forecast horizon (e.g., 7 → 30 days)

- Backend:
    - Check horizon parameter in `ml_engine.py` (often a constant or function param).
- Frontend:
    - Adjust chart labels and data mapping in `forecastData` in `App.tsx`.


### 4. Integrate Google tech (optional)

- For Google Login:
    - Use `@react-oauth/google` in `frontend/src/main.tsx` \& `App.tsx`.
- For Analytics:
    - Add GA4 script in `frontend/index.html` or use a small analytics helper.

---

## 🔹 Prompt Examples (for this repo)

You can use prompts like:

- “Explain how `DemandForecaster.forecast_ensemble` works and how to add another base model into the ensemble.”
- “Add a new DRF endpoint that returns only low-stock products, and show how to call it from the React dashboard.”
- “Refactor `App.tsx` to move the inventory cards into a separate `InventoryPanel.tsx` component.”
- “Add a button in the dashboard header that triggers a toast notification using the existing toast/toaster utilities.”

When answering, the model should:

- Reference specific files and functions.
- Show minimal, focused diffs or snippets.
- Avoid large, unnecessary rewrites unless asked.

---

## 🔹 Style \& Conventions

- **Backend**
    - Use snake_case for Python.
    - Group imports: stdlib → third-party → local.
    - Use DRF `ModelViewSet` where possible.
- **Frontend**
    - Use functional components only.
    - Prefer hooks over class components.
    - Use Tailwind classes; avoid inline styles.
    - Keep JSX clean: extract big chunks into small components.

---

## 🔹 Safety \& Performance Notes

- ML training/inference:
    - Assume data sizes are modest (tens of thousands of rows).
    - Avoid loading huge datasets into memory in one go without batching.
- API:
    - Any heavy computation should ideally be done async (Celery) if moved to production.
- Frontend:
    - Avoid unnecessary re-renders by keeping heavy computations outside render paths.
    - For large datasets, consider pagination or virtualization for tables.

---

## 🔹 Summary

This project is a **Django + React demand forecasting system**.
Gemini (or any LLM) assisting this repo should:

- Read the relevant file(s) before proposing changes.
- Follow Django/React/Tailwind idioms already used.
- Produce small, composable changes.
- When in doubt, ask for:
    - The exact file content
    - The exact error message
    - The goal (feature, refactor, or debug)

This `GEMINI.md` is the contract for how an AI assistant should collaborate with this codebase.