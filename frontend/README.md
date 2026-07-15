# Frontend — Music Royalty

UI oficial del sistema (React + Vite). Documentación completa de instalación y arquitectura: **[README principal](../README.md)**.

## Desarrollo local

```bash
# La API debe estar en :3000 (APP-UP.bat o npm start en la raíz)
cd frontend
npm install
npm run dev
```

Abre http://localhost:3001 (proxy `/api` → `localhost:3000`).

## Stack

- React 18, Vite, Axios, react-i18next (ES/EN)
- Auth por sesión (`@nickname`) vía `AuthContext`
- Páginas: login, catálogo, crear, detalle/compra, mis compras, analytics
