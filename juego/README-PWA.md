# 🎭 Impostor PWA - Guía de Instalación

## 📱 Cómo Instalar la App

### **iPhone/iPad (Safari)**
1. Abre Safari y ve a la URL del juego
2. Toca el botón **Compartir** (📤)
3. Selecciona **"Añadir a pantalla de inicio"**
4. Confirma el nombre y toca **"Añadir"**
5. ¡Listo! El icono aparecerá en tu pantalla de inicio

### **Android (Chrome)**
1. Abre Chrome y ve a la URL del juego
2. Toca el menú (⋮) y selecciona **"Añadir a pantalla de inicio"**
3. O busca el banner que dice **"Instalar aplicación"**
4. Confirma la instalación
5. ¡La app se instalará como una aplicación nativa!

### **Desktop (Chrome/Edge)**
1. Ve a la URL del juego
2. Busca el ícono de instalación (⊕) en la barra de direcciones
3. Haz clic en **"Instalar Impostor"**
4. La app se abrirá en su propia ventana

## 🚀 Características PWA

### ✅ **Funcionamiento Offline**
- Una vez instalada, la app funciona sin conexión a internet
- Todos los recursos se guardan en caché automáticamente
- Ideal para jugar en cualquier lugar

### ✅ **Experiencia Nativa**
- Se abre en pantalla completa (sin barras del navegador)
- Icono en la pantalla de inicio
- Splash screen personalizada
- Notificaciones push (futuro)

### ✅ **Optimizada para Móviles**
- Diseño responsive perfecto para celulares
- Controles touch optimizados
- Safe area support para iPhone con notch
- Tema oscuro impostor

## 📁 Estructura de Archivos

```
juego/
├── Impostor.html          # Archivo principal del juego
├── manifest.json          # Configuración PWA
├── sw.js                 # Service Worker (offline)
├── icons/                # Iconos para diferentes tamaños
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-72.png
│   ├── icon-96.png
│   ├── icon-128.png
│   ├── icon-144.png
│   ├── icon-152.png
│   ├── icon-180.png
│   ├── icon-192.png
│   ├── icon-384.png
│   └── icon-512.png
├── create-icons.html     # Generador de iconos
└── README-PWA.md        # Esta guía
```

## 🔧 Para Desarrolladores

### **Hosting Requirements**
- ✅ HTTPS obligatorio (GitHub Pages, Netlify, Vercel)
- ✅ Todos los archivos en la misma carpeta
- ✅ Service Worker registrado correctamente

### **Generar Iconos**
1. Abre `create-icons.html` en tu navegador
2. Haz clic en "Generar Todos los Iconos"
3. Descarga cada icono con el botón correspondiente
4. Coloca todos los archivos PNG en la carpeta `icons/`

### **Personalización**
- **Colores**: Edita las variables CSS en `Impostor.html`
- **Iconos**: Modifica `create-icons.html` para cambiar el diseño
- **Manifest**: Ajusta `manifest.json` para cambiar nombre, descripción, etc.
- **Caché**: Modifica `sw.js` para agregar/quitar archivos del caché

### **Testing**
```bash
# Servir localmente con HTTPS (necesario para SW)
npx http-server -S -C cert.pem -K key.pem -p 8080
```

## 🌐 Hosting Recomendado

### **GitHub Pages (Gratis)**
1. Crea un repo público
2. Sube todos los archivos
3. Ve a Settings > Pages
4. Selecciona source: Deploy from branch
5. Tu app estará en: `https://usuario.github.io/repo-name/`

### **Netlify (Gratis)**
1. Arrastra la carpeta a netlify.com/drop
2. O conecta tu repo de GitHub
3. Deploy automático en cada commit

### **Vercel (Gratis)**
1. Instala Vercel CLI: `npm i -g vercel`
2. En la carpeta del proyecto: `vercel`
3. Sigue las instrucciones

## 🎮 Características del Juego

- **150+ palabras** organizadas por temáticas argentinas
- **10 categorías** activables/desactivables
- **Sistema de votación real** jugador por jugador
- **Revelado seguro** manteniendo pulsado 1.5s
- **Tiempo configurable** de 3min a sin límite
- **Persistencia** de datos en localStorage
- **Tema impostor** negro/rojo con efectos neón
- **Accesibilidad completa** con screen readers

¡Perfecto para fiestas, reuniones y eventos! 🎉
