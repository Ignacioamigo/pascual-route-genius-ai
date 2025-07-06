# 🚀 Guía de Despliegue - Pascual Route Genius AI

## Para hacer funcionar la app desde Lovable

### Paso 1: Desplegar Backend en Render

1. **Crear cuenta en [Render](https://render.com)** (gratis)

2. **Conectar repositorio:**
   - Ir a Dashboard > New > Web Service
   - Conectar tu repositorio GitHub
   - Seleccionar este repositorio

3. **Configurar el servicio:**
   - **Name**: `pascual-backend`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: (dejar vacío)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build:server`
   - **Start Command**: `npm start`

4. **Variables de entorno en Render:**
   ```
   NODE_ENV=production
   PORT=5050
   GEMINI_API_KEY=tu_clave_gemini_aqui
   DATABASE_URL=tu_url_postgresql_aqui
   SUPABASE_DB_URL=tu_url_postgresql_aqui
   VISIT_COST=15
   LOGISTICS_COST=10
   ```

5. **Copiar la URL de tu backend** (ej: `https://pascual-backend-xyz.onrender.com`)

### Paso 2: Configurar Frontend para Lovable

1. **En tu proyecto local**, agregar variable de entorno:
   ```bash
   # Archivo .env.local (crear si no existe)
   VITE_API_URL=https://tu-backend-url.onrender.com
   ```

2. **Subir cambios a GitHub:**
   ```bash
   git add .
   git commit -m "feat: Configure for production deployment"
   git push origin main
   ```

3. **En Lovable:**
   - Ir a Settings > Environment Variables
   - Agregar: `VITE_API_URL=https://tu-backend-url.onrender.com`
   - Hacer rebuild del proyecto

### Paso 3: Verificar funcionamiento

1. **Backend**: Visitar `https://tu-backend-url.onrender.com/api/health`
2. **Frontend en Lovable**: Las métricas y chat deberían funcionar

## Variables de entorno necesarias

### Backend (.env):
```env
GEMINI_API_KEY=tu_clave_gemini
DATABASE_URL=postgresql://user:pass@host:port/db
SUPABASE_DB_URL=postgresql://user:pass@host:port/db
VISIT_COST=15
LOGISTICS_COST=10
```

### Frontend (Lovable):
```env
VITE_API_URL=https://tu-backend-url.onrender.com
```

## Troubleshooting

- **Error CORS**: Verificar que el backend tenga las cabeceras CORS configuradas
- **Error 503**: El backend en Render puede tardar ~1 minuto en despertar
- **Variables no encontradas**: Verificar que las variables estén bien configuradas en Render y Lovable

## Scripts útiles

```bash
# Desarrollo local
npm run dev:server  # Backend
npm run dev         # Frontend

# Construcción para producción
npm run build:server  # Compilar backend
npm run build         # Construir frontend
``` 