# ⚡ PortKiller Desktop

Aplicación de escritorio multiplataforma para encontrar y eliminar procesos que usan puertos específicos.

![PortKiller Screenshot](https://via.placeholder.com/800x450?text=PortKiller+Desktop)

## 🌟 Características

- 🔍 **Búsqueda Rápida**: Encuentra procesos por puerto en segundos
- 💀 **Eliminación Segura**: Confirma antes de terminar procesos
- 🎨 **Interfaz Moderna**: Diseño limpio con tema oscuro
- 🖥️ **Multiplataforma**: Windows, macOS y Linux
- ⚡ **Rendimiento**: Construido con Tauri + Rust
- 🔐 **Permisos**: Manejo inteligente de permisos de administrador

## 📋 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

### 1. Node.js y npm
- **Node.js 18+** y npm
- Descargar desde: https://nodejs.org/

### 2. Rust
- **Rust 1.70+** y Cargo
- Instalar con: 
  ```bash
  # Windows (usar PowerShell como Administrador)
  winget install --id=Rustlang.Rustup -e
  
  # O visitar: https://rustup.rs/
  ```
- Después de instalar, reinicia tu terminal

### 3. Dependencias de Tauri (Windows)
Para Windows, también necesitas:
- **Microsoft Visual Studio C++ Build Tools**
  - Descargar: https://visualstudio.microsoft.com/visual-cpp-build-tools/
  - Durante la instalación, selecciona "Desarrollo para el escritorio con C++"
  
- **WebView2** (generalmente ya viene con Windows 10/11)
  - Si es necesario: https://developer.microsoft.com/microsoft-edge/webview2/

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   cd portkiller-desktop
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Verificar instalación de Rust**
   ```bash
   rustc --version
   cargo --version
   ```

## 💻 Desarrollo

### Modo Desarrollo
Ejecuta la aplicación en modo desarrollo con hot-reload:

```bash
npm run tauri dev
```

La aplicación se abrirá automáticamente. Los cambios en el código se reflejarán al guardar.

### Estructura del Proyecto

```
portkiller-desktop/
├── src/                    # Frontend React + TypeScript
│   ├── components/         # Componentes de UI
│   │   ├── PortInput.tsx
│   │   ├── SearchButton.tsx
│   │   ├── ProcessPanel.tsx
│   │   ├── KillButton.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── FeedbackMessage.tsx
│   ├── services/           # Servicios y API
│   │   └── tauri.service.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── App.tsx             # Componente principal
│   └── App.css             # Estilos globales
│
├── src-tauri/              # Backend Rust + Tauri
│   ├── src/
│   │   ├── lib.rs          # Lógica principal
│   │   └── main.rs         # Punto de entrada
│   └── Cargo.toml          # Dependencias Rust
│
├── src-core/               # Módulos core (Node.js)
│   ├── types.ts
│   ├── port-scanner.ts
│   ├── process-killer.ts
│   └── permission-handler.ts
│
└── package.json            # Dependencias npm
```

## 🏗️ Build para Producción

### Compilar la aplicación:
```bash
npm run tauri build
```

El instalador se generará en:
- Windows: `src-tauri/target/release/bundle/msi/`
- El archivo será algo como: `PortKiller Desktop_1.0.0_x64_en-US.msi`

### Ejecutables generados:
- **Windows**: `.exe` y `.msi`
- **macOS**: `.dmg` y `.app`
- **Linux**: `.AppImage`, `.deb`

## 📖 Uso

1. **Abrir la aplicación**
   - En Windows: ejecutar el `.exe` instalado

2. **Buscar un puerto**
   - Ingresa un número de puerto (1-65535)
   - Clic en "Buscar"

3. **Terminar proceso (si está en uso)**
   - Revisa los detalles del proceso
   - Clic en "Finalizar Proceso"
   - Confirma la acción

### 💡 Permisos

Si aparece un error de permisos:
- **Windows**: Ejecutar como Administrador (clic derecho → "Ejecutar como administrador")
- **macOS/Linux**: Ejecutar con `sudo`

## 🛠️ Tecnologías

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: Tailwind CSS
- **Desktop**: Tauri v2 (Rust)
- **Sistema**: sysinfo crate
- **Estado**: React Hooks

## 🎨 Principios de Diseño

- **Clean Code**: Código limpio y mantenible
- **Componentes Reutilizables**: Separación de responsabilidades
- **TypeScript Estricto**: Tipado fuerte para menos bugs
- **Arquitectura Escalable**: Preparado para crecer

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más información.

## 👨‍💻 Autor

Creado con ❤️ usando Tauri + React + TypeScript

## 🐛 Solución de Problemas

### "Error: cargo metadata failed"
- **Causa**: Rust no está instalado
- **Solución**: Instala Rust desde https://rustup.rs/

### "Error: Access Denied" al matar proceso
- **Causa**: Permisos insuficientes
- **Solución**: Ejecuta la app como administrador

### "Puerto no encontrado" pero sé que está en uso
- **Causa**: Procesos de sistema pueden no ser visibles sin permisos
- **Solución**: Ejecuta como administrador

### Problemas con la compilación
```bash
# Limpiar y reinstalar
npm run tauri clean
rm -rf node_modules
npm install
```

## 📞 Soporte

Si encuentras problemas:
1. Revisa la sección de Solución de Problemas
2. Busca en Issues existentes
3. Crea un nuevo Issue con detalles

---

**Nota**: Esta es la primera versión de PortKiller Desktop. Más características próximamente! 🚀
