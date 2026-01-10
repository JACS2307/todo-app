# TaskFlow (todo-app)

TaskFlow es una aplicacion movil multiplataforma para organizar tareas del dia a dia. Permite crear, editar y eliminar tareas, organizarlas por categorias personalizadas con colores e iconos, y visualizar el progreso de completado.

## Funcionalidades Principales

- **Gestion de tareas**: Crear, editar, eliminar y marcar como completadas.
- **Categorias personalizadas**: Agrupar tareas con colores e iconos personalizables.
- **Filtrado inteligente**: Filtrar tareas por categoria con conteo en tiempo real.
- **Estadisticas de progreso**: Visualizacion del porcentaje de tareas completadas.
- **Menu lateral**: Navegacion fluida con resumen de estadisticas.
- **Almacenamiento local**: Persistencia de datos sin necesidad de cuenta.
- **Feature Flags**: Control remoto de funcionalidades via Firebase Remote Config.

## Archivos de Distribucion

### Android (APK)

- **Archivo**: `TaskFlow.apk` (4.3 MB)
- **Instalacion**: Descargar y abrir en dispositivo Android
- **Requisitos**: Android 5.0 o superior

### iOS (IPA)

- **Archivo**: `TaskFlow.ipa` (1.0 MB)
- **Nota**: Generado con firma de desarrollo personal
- **Para evaluar en iOS**:
  1. Compilar desde codigo fuente con Xcode
  2. O re-firmar el IPA con cuenta de desarrollador

---

## Como Ejecutar la Aplicacion

### Requisitos Previos

- Node.js 18+
- pnpm (recomendado) o npm
- Android Studio (para Android)
- Xcode 15+ (para iOS, solo macOS)

### 1. Instalacion

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd todo-app

# Instalar dependencias
pnpm install
```

### 2. Ejecutar en Navegador (Desarrollo)

```bash
pnpm start
# Abre http://localhost:8100
```

### 3. Ejecutar en Android

```bash
# Compilar y sincronizar
pnpm build && npx cap sync android

# Abrir en Android Studio
npx cap open android

# Ejecutar en emulador o dispositivo conectado
```

### 4. Ejecutar en iOS

```bash
# Compilar y sincronizar
pnpm build && npx cap sync ios

# Abrir en Xcode
npx cap open ios

# Ejecutar en simulador o dispositivo conectado
```

---

### Funcionalidades Implementadas

- **Sistema de categorias**: CRUD completo con selector de colores (12) e iconos (20).
- **Filtrado por categoria**: Chips interactivos con conteo de tareas en tiempo real.
- **Estadisticas visuales**: Progress ring SVG con porcentaje de completado.
- **Menu lateral**: Navegacion con `ion-split-pane` y estadisticas resumidas.
- **Feature Flags**: Integracion con Firebase Remote Config para `feature_categories` y `feature_statistics`.

---

## Preguntas Tecnicas

### 1. Cuales fueron los principales desafios al implementar las nuevas funcionalidades?

**Compatibilidad Web vs Nativo**: El desafio principal fue asegurar que la interfaz se renderizara correctamente tanto en navegador como en dispositivos nativos. Inicialmente hubo un problema donde los componentes se mostraban incorrectamente en Android debido a una mezcla de imports de Ionic (`IonicModule` tradicional vs `@ionic/angular/standalone`). La solucion fue migrar completamente a Ionic Standalone Components, importando cada componente individualmente desde `@ionic/angular/standalone`.

**Routing Anidado con Split Pane**: Configurar el `ion-router-outlet` dentro del `ion-split-pane` requirio atencion especial para que las rutas hijas (`/home/tasks`, `/home/categories`) se renderizaran correctamente dentro del area de contenido principal mientras el menu lateral funcionaba como overlay.

**Sincronizacion de Estado Reactivo**: Mantener sincronizadas las estadisticas del menu lateral con los cambios en tareas y categorias requirio el uso de Angular Signals y computed properties para evitar inconsistencias.

### 2. Que tecnicas de optimizacion de rendimiento aplicaste y por que?

**Angular Signals**: Utilice Signals en lugar de RxJS tradicional para el manejo de estado reactivo. Los Signals ofrecen mejor rendimiento porque solo notifican cambios cuando el valor realmente cambia, reduciendo re-renders innecesarios.

**ChangeDetectionStrategy.OnPush**: Implementado en componentes complejos (`TasksComponent`, `CategoryComponent`) para que Angular solo verifique cambios cuando las referencias de inputs cambien, no en cada ciclo de deteccion.

**Lazy Loading**: Las rutas cargan componentes bajo demanda con `loadComponent()`, reduciendo el bundle inicial. Solo se carga `HomePage` inicialmente, y `TasksComponent`/`CategoryComponent` se cargan cuando el usuario navega.

**Computed Properties**: En lugar de recalcular estadisticas en cada render, use `computed()` para crear valores derivados que se cachean automaticamente y solo se recalculan cuando sus dependencias cambian.

**Tree Shaking con Standalone Components**: Al importar solo los componentes de Ionic necesarios (ej: `IonButton`, `IonContent`) en lugar de todo `IonicModule`, el bundle final es mas pequeno.

### 3. Como aseguraste la calidad y mantenibilidad del codigo?

**Tipado Estricto con TypeScript**: Todos los modelos (`Task`, `Category`) estan tipados. Los servicios usan genericos para operaciones de storage, previniendo errores en tiempo de compilacion.

**Separacion de Responsabilidades**:

- `TaskService` / `CategoryService`: Logica de negocio y persistencia.
- `StorageService`: Abstraccion del almacenamiento (facilita cambiar de local a cloud).
- `RemoteConfigService`: Manejo centralizado de feature flags.
- Componentes: Solo presentacion y manejo de UI.

**Patron de Servicios Inyectables**: Todos los servicios usan `providedIn: 'root'` para ser singletons, asegurando consistencia de datos en toda la app.

**Codigo Autodocumentado**: Nombres descriptivos para funciones (`toggleTaskCompletion`, `filterByCategory`), variables (`pendingTasksCount`, `selectedCategoryFilter`) y componentes que reflejan su proposito.

**Manejo de Errores**: Try-catch en operaciones de storage con feedback visual al usuario mediante toasts.

---

## Configuracion de Firebase (Opcional)

Si deseas usar tu propia configuracion de Firebase Remote Config:

1. Reemplaza la configuracion en:

   - `src/environments/environment.ts`
   - `src/environments/environment.prod.ts`

2. Feature flags utilizados:
   - `feature_categories`: Habilita/deshabilita el filtro de categorias
   - `feature_statistics`: Habilita/deshabilita las estadisticas de progreso

Si no configuras Firebase, la app usa valores por defecto y funciona normalmente.

---

## Comandos Utiles

| Comando                | Descripcion                        |
| ---------------------- | ---------------------------------- |
| `pnpm start`           | Inicia servidor de desarrollo      |
| `pnpm build`           | Compila para produccion            |
| `pnpm test`            | Ejecuta pruebas unitarias          |
| `pnpm lint`            | Analiza el codigo                  |
| `npx cap sync`         | Sincroniza con plataformas nativas |
| `npx cap open android` | Abre proyecto en Android Studio    |
| `npx cap open ios`     | Abre proyecto en Xcode             |

---

## Estructura del Proyecto

```
src/
├── app/
│   ├── components/
│   │   ├── tasks/          # Componente de tareas
│   │   └── category/       # Componente de categorias
│   ├── home/               # Pagina principal con menu
│   ├── models/             # Interfaces TypeScript
│   ├── services/           # Logica de negocio
│   ├── app.component.ts    # Componente raiz
│   └── app.routes.ts       # Configuracion de rutas
├── environments/           # Configuracion por entorno
├── theme/                  # Variables de estilo
└── global.scss             # Estilos globales
```

---
