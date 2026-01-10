# TaskFlow (todo-app)

TaskFlow es una app sencilla para organizar tareas del dia a dia. La idea es que puedas escribir lo que necesitas hacer, marcarlo cuando lo completes y ordenar todo por categorias con colores e iconos, sin complicarte.

## Que incluye

- Crear, editar y eliminar tareas.
- Marcar tareas como completadas o pendientes.
- Agrupar por categorias con color e icono.
- Filtro por categoria y resumen de progreso.
- Guardado local en el dispositivo (funciona sin cuenta).

## Hecho con

- Ionic + Angular.
- Capacitor (almacenamiento local).
- Firebase Remote Config para activar/desactivar secciones desde la nube.

## Como ejecutarlo en local

1. Instala dependencias:

```bash
npm install
```

2. Levanta el proyecto:

```bash
npm start
```

3. Abre `http://localhost:8100` en tu navegador.

## Configuracion opcional (Remote Config)

Si quieres usar tus propios ajustes de Firebase, reemplaza la configuracion en:

- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

Las banderas usadas son:

- `feature_categories`
- `feature_statistics`

Si no lo configuras, la app usa valores por defecto y funciona igual.

## Comandos utiles

- `npm run build` compila el proyecto.
- `npm test` ejecuta pruebas.
- `npm run lint` revisa el codigo.
- `npm run watch` compila en modo observacion.
