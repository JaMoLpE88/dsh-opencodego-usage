# dsh-opencodego-usage

**Uso de la suscripción OpenCode Go en el composer de DeepSeek Harness.** Los tramos de 5 horas, semanal y mensual viven en una píldora compacta entre los controles de permiso y modelo; al pulsarla se abre una ventana de detalles estilo DSH con tiempos de reset, colores y un botón de refresco manual.

Cero configuración. El plugin usa la clave del proveedor OpenCode Go que DSH ya tiene guardada: sin cookie, sin workspace ID y sin página de ajustes.

[English](README.md)

[![npm](https://img.shields.io/npm/v/@jamolpe88/dsh-opencodego-usage.svg)](https://www.npmjs.com/package/@jamolpe88/dsh-opencodego-usage)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

![Píldora de uso en el composer](assets/usage-pill.png)

![Detalles de uso de OpenCode Go](assets/usage-panel.png)

*Capturas tomadas en DSH Desktop sobre Windows 11. El fondo del chat está difuminado; los porcentajes son los de la suscripción del autor.*

## Qué hace

- Muestra los tres tramos de OpenCode Go en una sola píldora compacta: **5 horas**, **semanal** y **mensual**.
- Usa los mismos anillos estilo contexto que el medidor de contexto de DSH, con separadores `·` entre ventanas.
- Colorea el anillo y la barra según la severidad: verde por debajo del 50 %, ámbar del 50 % al 74 % y rojo del 75 % al 100 % (un tramo limitado siempre aparece en rojo).
- Abre al pulsar una ventana de detalles con aspecto nativo: porcentaje, barra fina, cuenta atrás del reset, hora local del reset, última actualización, cadencia de auto-refresco, origen de los datos y botón **Refresh**.
- La cuenta atrás baja cada segundo mientras la ventana está abierta. Cuando un reset llega a cero, hace una lectura automática para resetear la ventana sin que el usuario haga nada.
- Refresca los porcentajes cada 60 segundos y al volver a la ventana de la aplicación.
- Solo aparece mientras el modelo activo pertenece al proveedor `opencode-go`. Con otros proveedores no muestra nada.
- No necesita ajustes: la clave que ya tiene DSH es la única credencial.

## Qué no hace

- No lee cookies de la consola de OpenCode ni hace scraping del HTML.
- No pide una clave ni guarda una en el plugin.
- No guarda historial de uso, telemetría ni datos en el almacenamiento local.
- No añade herramientas, comandos ni cambios al agente.
- No muestra nada si el modelo activo no es de OpenCode Go.

## Por qué no hay ajustes

Si hay un modelo de OpenCode Go seleccionado, el proveedor está configurado y su clave ya está disponible para DSH. El plugin resuelve esa clave en el Host y consulta la API oficial de uso. Si no hay un modelo de OpenCode Go seleccionado, no hay nada útil que mostrar y el plugin no renderiza nada.

No hay archivo de configuración, ni campo para pegar una clave, ni editor de umbrales, ni preferencia de refresco. Es lo que es: los datos de suscripción que el proveedor ya conoce.

## Requisitos

- **DSH Desktop** `>= 0.2.1-rc.3` (probado en `0.2.1-rc.3`, Windows 11).
- Un proveedor **OpenCode Go** configurado en **Settings → Models**, con una clave válida.
- Node 22+ (DSH trae su propio runtime).

Si el proveedor no está configurado no podrás seleccionar uno de sus modelos, así que el plugin nunca aparecerá. Es intencionado.

## Instalación

Desde npm:

```bash
dsh plugin --profile desktop add @jamolpe88/dsh-opencodego-usage
```

Desde el repositorio:

```bash
dsh plugin --profile desktop add github:JaMoLpE88/dsh-opencodego-usage
```

Desde un checkout local, mientras desarrollas:

```bash
dsh plugin --profile desktop add C:\ruta\a\dsh-opencodego-usage
```

Refresca la ventana de DSH después de instalar. La píldora aparece en el composer de cualquier sesión cuyo modelo activo use el proveedor `opencode-go`.

## Uso

1. Selecciona un modelo del proveedor **OpenCode Go**.
2. La píldora aparece centrada en la fila del composer, entre el control de permiso y el selector de modelo.
3. Púlsala para abrir la ventana de detalles.
4. Usa **Refresh** para una lectura inmediata; si no, el plugin se actualiza cada 60 segundos, al volver a la ventana y automáticamente cuando un reset llega a cero mientras la ventana está abierta.

Haz clic fuera de la ventana, pulsa **Escape** o vuelve a pulsar la píldora para cerrarla. Las horas de reset se muestran en la zona horaria local del navegador y las cuentas atrás se actualizan cada segundo sin hacer nada.

## Cómo funciona

La mitad Host llama al endpoint oficial de OpenCode Go con la clave del proveedor:

```http
GET https://opencode.ai/zen/go/v1/usage
Authorization: Bearer <OPENCODE_GO_API_KEY>
```

Devuelve los tres tramos:

```json
{
  "usage": {
    "rolling": { "status": "ok", "percent": 4,  "resetsAt": "2026-10-25T13:31:58.000Z" },
    "weekly":  { "status": "ok", "percent": 24, "resetsAt": "2026-10-26T00:00:00.000Z" },
    "monthly": { "status": "ok", "percent": 12, "resetsAt": "2026-11-07T14:35:16.000Z" }
  }
}
```

- La clave se resuelve desde el servicio de credenciales de DSH (`OPENCODE_GO_API_KEY`) en cada lectura; `OPENCODE_GO_API_KEY` del entorno del proceso es el fallback.
- El resultado se cachea 55 segundos para que el poll de 60 segundos y varias ventanas compartan una sola petición.
- Si falla la API, se conservan los últimos porcentajes y se marcan como **stale** en lugar de vaciar la píldora.
- La mitad navegador lee dos rutas same-origin: `/api/opencodego-usage` y `/api/opencodego-usage/refresh`. La clave nunca llega al navegador.
- La visibilidad usa la proyección viva `modelSelection`. Al cambiar a otro proveedor la píldora desaparece al instante; al volver, reaparece.
- El Client formatea las horas de reset con la zona horaria y el idioma del navegador, repinta la cuenta atrás cada segundo con la ventana abierta y fuerza una lectura nueva cuando una cuenta atrás llega a cero (con protección para que un reset no provoque un bucle de refrescos).

## Privacidad

- Sin cookies, sin scraping de la sesión del navegador y sin workspace ID.
- La clave de API no sale del proceso Host: el navegador solo recibe porcentajes y fechas de reset.
- Sin archivo de configuración, sin almacenamiento local, sin telemetría y sin peticiones a terceros más allá del endpoint oficial de uso.
- El Host no registra la clave ni la incluye en los mensajes de error.
- Las capturas de arriba se tomaron de una sesión real con el fondo del chat difuminado por privacidad.

Consulta [SECURITY.md](SECURITY.md) para la política resumida.

## Problemas frecuentes

**La píldora no aparece.**
Comprueba que el modelo activo pertenece al proveedor **OpenCode Go**. El plugin no renderiza nada para otros proveedores.

**La píldora muestra un punto rojo y un error.**
Abre la ventana para ver el código y la pista:

| Código | Significado |
|---|---|
| `missing-key` | DSH no tiene `OPENCODE_GO_API_KEY` para este perfil. Configura el proveedor OpenCode Go en **Settings → Models**. |
| `invalid-key` | La clave del proveedor fue rechazada (401). Revísala o sustitúyela en **Settings → Models**. |
| `no-subscription` | La clave no tiene una suscripción OpenCode Go activa (403). |
| `rate-limited` | La propia API de uso está limitando peticiones; inténtalo de nuevo en un rato. |
| `timeout` / `network` | El Host no pudo llegar a `opencode.ai`; reintenta con **Refresh**. |

El plugin no tiene ajustes propios: los problemas del proveedor se resuelven en los ajustes de modelos de DSH.

## Desarrollo

```bash
npm test        # node --test
npm run check   # comprobación de sintaxis del Host y el Client
```

Los tests cubren el parser de la API, el mapeo de errores HTTP, la caché, el caso de clave ausente y el fallback de datos stale. La mitad navegador es un `client.js` plano (sin build) y se verifica en el Harness en ejecución.

Instalación local:

```bash
dsh plugin --profile desktop add C:\ruta\a\dsh-opencodego-usage
```

## Marcas de terceros

OpenCode y el logo de OpenCode son marcas de sus respectivos propietarios. El logo se usa solo para identificar el servicio OpenCode Go; no está cubierto por la licencia MIT que se aplica al código. Ver [NOTICE](NOTICE).

## Licencia

[MIT](LICENSE) © 2026 JaMoLpE88
