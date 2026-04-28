# Sistema de Ventas Frontend

Proyecto base en `Vite + React + Material UI` con:

- Tabla de productos
- Carrito dinamico
- Formulario de venta

## Scripts

```bash
npm install
npm run dev
npm run build
npm run build:android
```

## Android con Capacitor

El proyecto ya esta configurado con `Capacitor` para encapsular la app web en Android.

- `npm run build:android`: genera `dist` y sincroniza los cambios con la app nativa
- `npm run android`: abre la carpeta `android/` en Android Studio

### Generar APK

1. Ejecuta `npm run build:android`
2. Abre Android Studio con `npm run android`
3. Espera a que Gradle termine de sincronizar
4. Ve a `Build > Build Bundle(s) / APK(s) > Build APK(s)`

La configuracion actual creada para Capacitor es:

- App name: `Sistema Ventas`
- App id: `com.frontendsistemaventas.app`

Si despues quieres publicar la app, conviene cambiar el `appId` por uno propio antes de generar la version final.

## Estructura principal

- `src/App.jsx`: composicion general del punto de venta
- `src/components/ProductTable.jsx`: tabla de productos con busqueda y carga al carrito
- `src/components/CartSummary.jsx`: resumen dinamico del carrito
- `src/components/SaleForm.jsx`: formulario de venta con validacion basica
- `src/data/products.js`: catalogo inicial de productos
