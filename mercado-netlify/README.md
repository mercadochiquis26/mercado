# Mercado semanal en Netlify + Google Sheets

Este proyecto incluye una app lista para desplegar en Netlify con dos vistas:

- Vista empleada: link abierto para marcar faltantes y agregar productos.
- Vista administración: revisión, edición, eliminación y lista final agrupada por mercado.

## Mercados fijos

- Ribasmith
- Organica
- Rey
- Krume
- Otros

## Estructura del Google Sheet

Crear un Google Sheet con una pestaña llamada `productos` y esta fila de encabezados en la fila 1:

| id | producto | categoria | mercado | cantidad_sugerida | falta_esta_semana | activo | creado_por | updated_at |
|---|---|---|---|---|---|---|---|---|

Puedes empezar con filas vacías o cargar productos manualmente.

## Configuración de Google Cloud

1. Crear un proyecto en Google Cloud.
2. Habilitar Google Sheets API.
3. Crear una **Service Account**.
4. Generar una clave JSON.
5. Compartir el Google Sheet con el email de la service account con permisos de editor.

## Variables de entorno en Netlify

Configura estas variables:

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_SHEET_ID`
- `GOOGLE_SHEET_TAB` = `productos`

En `GOOGLE_PRIVATE_KEY`, pegar la clave completa reemplazando saltos de línea reales por `\n` si hace falta.

## Deploy

1. Subir esta carpeta a GitHub.
2. Conectar el repo a Netlify.
3. Netlify detectará `netlify.toml`.
4. Ejecutar instalación de dependencias desde `package.json`.
5. Configurar las variables de entorno.
6. Hacer deploy.

## Endpoints incluidos

- `getProducts`
- `addProduct`
- `toggleMissing`
- `updateProduct`
- `deleteProduct`
- `resetWeek`

## Notas

- La lista final solo aparece en administración.
- La función `deleteProduct` elimina la fila físicamente del Sheet.
- El botón de copiar usa `navigator.clipboard.writeText()`.
