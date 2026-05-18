# SILVERBACK — Casos de Uso del Sistema

**Proyecto:** SILVERBACK — Plataforma de Gamificación del Entrenamiento Físico  
**Entrega:** E1 — Especificación Técnica  
**Universidad:** UAI — Seminario de Trabajo Final (SAP 2026)  
**Versión:** 3.1

---

## Actores del Sistema

| Actor | Tipo | Descripción |
|-------|------|-------------|
| **Miembro** | Principal | Usuario registrado en un clan. Accede a todas las funcionalidades de entrenamiento, evolución y perfil. |
| **Líder de Clan (Silverback)** | Principal | Miembro con permisos de administración: gestiona roles, crea desafíos y toma decisiones tácticas. |
| **Sistema SilverBack** | Secundario | Motor de procesamiento que calcula el puntaje CER, gestiona XP, rachas, niveles de fatiga y recompensas. |
| **Aliado Comercial** | Secundario | Proveedor externo que otorga beneficios y descuentos a los miembros del clan según su nivel. |

---

## Índice de Casos de Uso por Componente

| Componente | Código | Nombre |
|-----------|--------|--------|
| **CU-001 — INCORPORACIÓN** | CU-001-001 | Registrar Datos Biométricos Iniciales |
| | CU-001-002 | Seleccionar Arquetipo de Entrenamiento |
| | CU-001-003 | Buscar Manadas Disponibles |
| | CU-001-004 | Unirse a una Manada |
| **CU-002 — SANTUARIO** | CU-002-001 | Visualizar el Panel del Santuario |
| | CU-002-002 | Consultar Desafíos en La Forja |
| | CU-002-003 | Aceptar un Desafío Semanal |
| | CU-002-004 | Comunicarse en la Sala de Tácticas |
| | CU-002-005 | Asignar Rol a un Miembro del Clan |
| | CU-002-006 | Expulsar a un Miembro del Clan |
| **CU-003 — ARENA** | CU-003-001 | Consultar el Estado de la Guerra Global |
| | CU-003-002 | Registrar un Entrenamiento |
| | CU-003-003 | Calcular el Puntaje CER |
| | CU-003-004 | Consultar el Historial de Batallas |
| **CU-004 — EVOLUCIÓN / BÓVEDA** | CU-004-001 | Visualizar Progreso de Evolución |
| | CU-004-002 | Mejorar Nodo del Árbol de Habilidades |
| | CU-004-003 | Reclamar Recompensa de la Bóveda |
| | CU-004-004 | Adquirir Ítem en el Marketplace |
| **CU-005 — PERFIL** | CU-005-001 | Consultar Dashboard de Rendimiento Personal |
| | CU-005-002 | Consultar Racha de Entrenamiento |
| | CU-005-003 | Salvar Racha con Puntos de Clan |
| | CU-005-004 | Monitorear Estado de Fatiga Biométrica |
| | CU-005-005 | Consultar Vitrina de Trofeos |
| | CU-005-006 | Reclamar Beneficio de un Aliado Comercial |

---

---

# CU-001 — INCORPORACIÓN

*Flujo lineal de 4 pasos. El usuario completa estos casos de uso en secuencia antes de acceder a la aplicación principal. Layout centrado, sin Topbar ni Sidebar.*

---

## CU-001-001: Registrar Datos Biométricos Iniciales

**Descripción:** Este caso de uso describe el proceso mediante el cual un nuevo usuario ingresa sus datos biométricos personales al sistema por primera vez, como parte del flujo de incorporación al clan. El objetivo es que el Sistema SilverBack disponga de una línea base fisiológica del miembro para calibrar su protocolo de entrenamiento óptimo. Los datos capturados —edad, peso, altura y nivel de experiencia— determinan los parámetros iniciales del cálculo CER y la progresión de atributos del usuario dentro de la plataforma.

**Actores:** Miembro (nuevo usuario), Sistema SilverBack

**Precondiciones:** El usuario ha ingresado a la plataforma por primera vez y es dirigido automáticamente a la pantalla de calibración biométrica.

**Escenario Principal de Éxito:**

1. El sistema presenta la pantalla "CALIBRACIÓN BIOMÉTRICA" con el indicador de paso 1 de 3 activo.
2. El usuario visualiza el formulario con los campos: EDAD, PESO (KG), ALTURA (CM) y NIVEL DE EXPERIENCIA.
3. El usuario hace clic en el campo EDAD y digita su edad en años completos.
4. El sistema muestra el icono de calendario como indicador visual del campo de fecha/edad.
5. El usuario hace clic en el campo PESO (KG) y digita su peso corporal con un decimal.
6. El sistema muestra el icono de balanza como indicador visual del tipo de dato esperado.
7. El usuario hace clic en el campo ALTURA (CM) y digita su altura en centímetros.
8. El sistema muestra el icono de regla como indicador visual del tipo de dato esperado.
9. El usuario despliega el selector NIVEL DE EXPERIENCIA y visualiza las opciones: Principiante, Intermedio, Avanzado, Élite.
10. El usuario selecciona su nivel de experiencia correspondiente.
11. El sistema actualiza el selector mostrando el nivel elegido como valor activo.
12. El usuario revisa que todos los campos contengan información correcta antes de continuar.
13. El usuario presiona el botón "CONTINUAR →".
14. El sistema valida que todos los campos obligatorios estén completos y con valores dentro del rango esperado.
15. El sistema almacena los datos biométricos del usuario y genera la línea base fisiológica.
16. El sistema redirige automáticamente al usuario a la pantalla de selección de arquetipo (paso 2 de 3).
17. El indicador de progreso en la parte inferior muestra el primer punto activo y los dos siguientes inactivos.

**Flujos Alternativos:**

- **[FA-1]** Si el usuario presiona "CONTINUAR →" con uno o más campos vacíos, el sistema resalta los campos incompletos con borde naranja y no avanza al siguiente paso.
- **[FA-2]** Si el usuario ingresa un valor fuera de rango (ej. peso negativo o edad mayor a 120), el sistema muestra un mensaje de validación junto al campo correspondiente sin borrar el resto del formulario.

---

## CU-001-002: Seleccionar Arquetipo de Entrenamiento

**Descripción:** Este caso de uso describe el proceso mediante el cual el usuario elige su arquetipo de entrenamiento dentro del flujo de incorporación, determinando así su identidad dentro del sistema SilverBack. Los tres arquetipos disponibles —VOLUMEN (El Gorila), DEFINIDO (La Pantera) y ATLÉTICO (El Chimpancé)— representan filosofías de entrenamiento diferenciadas que impactan directamente en el multiplicador del cálculo CER, el camino de progresión de habilidades y los desafíos que el sistema propone al usuario. La selección de arquetipo es una decisión de largo plazo que define la identidad táctica del miembro dentro del clan.

**Actores:** Miembro, Sistema SilverBack

**Precondiciones:** El usuario completó la calibración biométrica (CU-001-001) y fue redirigido al paso 2 del flujo de incorporación.

**Escenario Principal de Éxito:**

1. El sistema presenta la pantalla "ELIGE TU ARQUETIPO" con el subtítulo "Selecciona tu protocolo operativo".
2. El usuario visualiza tres tarjetas de arquetipo dispuestas en grilla horizontal.
3. La tarjeta VOLUMEN — EL GORILA aparece preseleccionada por defecto, con borde naranja y checkmark visible.
4. El usuario lee la descripción del arquetipo VOLUMEN: acumulación de fuerza bruta, movimientos compuestos pesados y sobrecarga progresiva.
5. El usuario hace clic sobre la tarjeta DEFINIDO — LA PANTERA para explorar esa opción.
6. El sistema remueve el estado activo de VOLUMEN y aplica el borde naranja y checkmark a DEFINIDO.
7. El usuario lee la descripción: entrenamiento de intervalos de alta intensidad, hipertrofia dirigida y acondicionamiento metabólico.
8. El usuario hace clic sobre la tarjeta ATLÉTICO — EL CHIMPANCÉ para conocer la tercera opción.
9. El sistema transfiere el estado activo a la tarjeta ATLÉTICO, mostrando el emoji 🐒 y la descripción de potencia explosiva y movilidad.
10. El usuario decide volver a seleccionar VOLUMEN — EL GORILA como su arquetipo definitivo.
11. El sistema actualiza visualmente la selección: borde naranja en VOLUMEN, resto de tarjetas con borde gris.
12. El usuario confirma que la tarjeta seleccionada tiene el checkmark naranja en la esquina superior derecha.
13. El usuario presiona el botón "CONFIRMAR ARQUETIPO →".
14. El sistema registra el arquetipo elegido y configura el multiplicador CER correspondiente (1.15x para Silverback).
15. El sistema redirige al usuario a la pantalla de Radar de Manadas (paso 3 de 3).
16. El indicador de progreso en la parte inferior muestra el segundo punto activo.

**Flujos Alternativos:**

- **[FA-1]** Si el usuario presiona "VOLVER AL INICIO", el sistema regresa a la pantalla de calibración biométrica sin perder los datos ya ingresados.
- **[FA-2]** Si el usuario no selecciona ninguna tarjeta manualmente, el sistema asume el arquetipo VOLUMEN (preseleccionado por defecto) al confirmar.

---

## CU-001-003: Buscar Manadas Disponibles

**Descripción:** Este caso de uso describe el proceso mediante el cual el usuario recién incorporado explora el catálogo de clanes disponibles en el sistema SilverBack utilizando el buscador del Radar de Manadas. El usuario puede filtrar clanes por nombre, evaluar la capacidad disponible de cada uno y comparar las opciones antes de tomar una decisión. El sistema muestra en tiempo real el estado de cada clan (disponible, casi lleno o completamente lleno), permitiendo al usuario hacer una elección informada sobre a qué grupo de entrenamiento unirse.

**Actores:** Miembro, Sistema SilverBack

**Precondiciones:** El usuario completó la selección de arquetipo (CU-001-002) y fue redirigido al paso 3 del flujo de incorporación.

**Escenario Principal de Éxito:**

1. El sistema presenta la pantalla "RADAR DE MANADAS" con el subtítulo "Encuentra tu manada. Domina la arena."
2. El usuario visualiza el campo de búsqueda "Buscar Clanes..." con ícono de lupa en el margen izquierdo.
3. El sistema muestra de forma inmediata el listado de clanes disponibles sin requerir búsqueda previa.
4. La lista presenta los clanes disponibles con su nombre, el contador de miembros actuales sobre la capacidad máxima y el estado de disponibilidad (disponible o LLENO).
5. El usuario observa que el clan con estado LLENO tiene el ícono de candado y la etiqueta "LLENO", indicando que no acepta nuevos miembros.
6. El usuario hace clic en el campo de búsqueda y digita un término para filtrar el listado.
7. El sistema actualiza la lista mostrando únicamente los clanes cuyo nombre coincide con el término ingresado, con sus datos de capacidad.
8. El usuario evalúa que el clan filtrado tiene cupos disponibles dentro de su capacidad máxima, indicando margen de ingreso.
9. El usuario borra el texto del buscador para restablecer el listado completo.
10. El usuario digita otro término en el buscador para evaluar una segunda opción.
11. El sistema filtra mostrando el clan cuyo nombre coincide, con su nivel de ocupación actual.
12. El usuario nota que ese clan tiene pocos cupos libres, indicando alta saturación.
13. El usuario borra el filtro nuevamente para comparar todas las opciones en pantalla.
14. El usuario evalúa la relación capacidad/disponibilidad de cada clan visible.
15. El usuario identifica el clan con mayor margen de capacidad disponible como la opción preferida.
16. El sistema mantiene el estado de la búsqueda activo mientras el usuario continúa evaluando las opciones disponibles.

**Flujos Alternativos:**

- **[FA-1]** Si el usuario ingresa un término que no coincide con ningún clan registrado, el sistema muestra el listado vacío con el mensaje "No se encontraron clanes con ese nombre."
- **[FA-2]** Si el usuario presiona directamente "INICIAR VIAJE →" sin realizar ninguna búsqueda ni selección, el sistema lo asigna al clan disponible con mayor afinidad según su arquetipo.

---

## CU-001-004: Unirse a una Manada

**Descripción:** Este caso de uso describe el proceso mediante el cual el usuario selecciona y confirma su adhesión a un clan disponible en el Radar de Manadas, completando así el último paso del flujo de incorporación. La acción de unirse establece la pertenencia del usuario al clan, le asigna el rol inicial de RECLUTA y habilita el acceso a todas las funcionalidades colectivas de la plataforma: Guerra Global, Sala de Tácticas, La Forja y la gestión de rangos del clan.

**Actores:** Miembro, Sistema SilverBack

**Precondiciones:** El usuario visualizó el listado de clanes disponibles (CU-001-003) e identificó el clan al que desea unirse.

**Escenario Principal de Éxito:**

1. El usuario confirma visualmente la tarjeta del clan seleccionado, verificando su nombre y el contador de capacidad actual, con el botón "UNIRSE" habilitado en naranja.
2. El usuario verifica que el clan no está marcado como LLENO y que el botón de acción está activo.
3. El usuario comprueba la cantidad de cupos libres disponibles en el clan seleccionado.
4. El usuario presiona el botón "UNIRSE" en la tarjeta del clan seleccionado.
5. El sistema valida en tiempo real que el clan aún tiene capacidad disponible (contador de miembros actual inferior a la capacidad máxima).
6. El sistema procesa la solicitud de adhesión del usuario al clan seleccionado.
7. El sistema registra al usuario como nuevo miembro del clan en la base de datos.
8. El sistema actualiza el contador de miembros del clan incrementándolo en una unidad.
9. El sistema asigna automáticamente el rol inicial "RECLUTA" al nuevo miembro.
10. El sistema vincula el perfil del usuario (datos biométricos y arquetipo) al historial del clan.
11. El sistema confirma la incorporación con una señal visual de éxito en la interfaz.
12. El botón "UNIRSE" pasa a estado confirmado indicando que la adhesión fue procesada.
13. El usuario visualiza el botón "INICIAR VIAJE →" habilitado en la parte inferior de la pantalla.
14. El usuario presiona "INICIAR VIAJE →" para completar el flujo de incorporación.
15. El sistema marca el onboarding como completado para el perfil del usuario.
16. El sistema redirige al usuario al Santuario del clan (/santuario) como pantalla principal de la aplicación.
17. El usuario accede por primera vez al hub del clan con todos los permisos de nivel RECLUTA activos.

**Flujos Alternativos:**

- **[FA-1]** Si el clan alcanzó su capacidad máxima entre que el usuario lo seleccionó y confirmó, el sistema muestra un mensaje de error indicando que el clan ya no tiene cupos disponibles y sugiere elegir otra manada.
- **[FA-2]** Si el usuario presiona "UNIRSE" en un clan con estado LLENO, el botón permanece deshabilitado y no se ejecuta ninguna acción.

---

---

# CU-002 — SANTUARIO

*Hub central del clan. Accessible desde el tab "Santuario" de la Topbar. Incluye panel principal, desafíos, comunicación y gestión de miembros.*

---

## CU-002-001: Visualizar el Panel del Santuario

**Descripción:** Este caso de uso describe el acceso del miembro al panel principal del clan, denominado El Santuario, que funciona como hub central de la aplicación SilverBack. Desde este panel, el usuario puede visualizar la identidad del clan, su racha activa de entrenamiento, los indicadores clave de rendimiento colectivo y acceder a las funcionalidades principales de la plataforma. El Santuario es el punto de convergencia desde el cual el miembro navega hacia la Arena, la Sala de Tácticas y las demás secciones del sistema.

**Actores:** Miembro, Sistema SilverBack

**Escenario Principal de Éxito:**

1. El usuario accede a la pantalla del Santuario desde el menú de navegación superior (sección "Santuario").
2. El sistema presenta el encabezado "CLAN HUB // SANTUARIO" junto al nombre del clan del usuario.
3. El usuario visualiza el avatar del clan: un gorila de gran tamaño con borde circular.
4. El sistema muestra el botón de racha activa en naranja, indicando el número de días consecutivos acumulados.
5. El usuario puede hacer clic en el botón de racha para ser redirigido al termómetro de racha (/perfil/racha).
6. El usuario visualiza los dos botones de acción principal: "IR A LA ARENA" y "CHAT".
7. El usuario puede presionar "IR A LA ARENA" para acceder a la sección de Guerra Global (/arena).
8. El usuario puede presionar "CHAT" para acceder a la Sala de Tácticas (/santuario/tacticas).
9. El sistema presenta cuatro tarjetas de estadísticas del clan en la parte inferior.
10. La primera tarjeta muestra la cantidad de miembros activos del clan con ícono de grupo.
11. La segunda tarjeta muestra la posición porcentual del clan en el ranking global con la etiqueta "RANGO GLOBAL".
12. La tercera tarjeta muestra el total de batallas ganadas por el clan con ícono de espadas.
13. La cuarta tarjeta muestra el puntaje de poder acumulado del clan con ícono de rayo.
14. El usuario utiliza la barra lateral (Sidebar) para navegar hacia otras secciones como Historial, Beneficios o Trofeos.
15. El sistema mantiene el estado activo del ítem "Santuario" en la topbar durante toda la sesión en esta sección.

**Flujos Alternativos:**

- **[FA-1]** Si el usuario no ha completado su racha del día, el botón de racha muestra una alerta visual indicando que el día está pendiente.
- **[FA-2]** Si el clan no ha registrado batallas aún, el contador de batallas ganadas aparece en cero sin generar errores de interfaz.

---

## CU-002-002: Consultar Desafíos en La Forja

**Descripción:** Este caso de uso describe la visualización por parte del miembro del listado de directivas semanales publicadas por el Líder de Clan en La Forja. Cada desafío presenta su categoría (tier), nombre, descripción de requisitos, objetivo medible con unidad de medida, porcentaje de progreso actual y estado (activo o completado). La consulta permite al miembro dimensionar el esfuerzo requerido por cada directiva y evaluar cuáles puede comprometerse a completar dentro del período semanal, contribuyendo al puntaje de poder del clan en el ranking global.

**Actores:** Miembro, Líder de Clan, Sistema SilverBack

**Precondiciones:** El Líder de Clan publicó al menos una directiva semanal en La Forja.

**Escenario Principal de Éxito:**

1. El usuario accede a la pantalla "ARENA DESAFÍOS" mediante la navegación interna del Santuario o desde la Topbar.
2. El sistema muestra el encabezado con el título "ARENA DESAFÍOS" y la etiqueta "RANGO DEL CLAN:" con la posición actual del clan en el ranking.
3. El usuario visualiza la sección "DIRECTIVAS SEMANALES" con el subtítulo descriptivo del propósito de la sección.
4. El sistema presenta los desafíos activos y completados en formato de tarjeta expandida con imagen lateral y detalle a la derecha.
5. El primer desafío muestra la etiqueta TITAN TIER en naranja y el nombre del desafío.
6. La descripción del primer desafío especifica el objetivo cuantificable a alcanzar en el plazo semanal.
7. La barra de progreso del primer desafío indica el avance acumulado por el clan como fracción del total requerido.
8. El segundo desafío muestra la etiqueta ENDURANCE en rojo y el nombre del desafío.
9. La descripción del segundo desafío especifica el objetivo con su meta medible.
10. La barra de progreso del segundo desafío indica el avance actual como fracción del total requerido.
11. El tercer desafío muestra la etiqueta COMPLETADO en gris y el nombre del desafío con tachado visual.
12. La barra de progreso del tercer desafío está al 100% y el botón muestra "PROTOCOLO ASEGURADO" deshabilitado.
13. El usuario puede retroceder al Santuario mediante el botón de flecha izquierda en el encabezado.
14. El usuario evalúa el progreso de cada desafío activo y determina cuáles puede comprometerse a completar.
15. El usuario comprende que los desafíos activos (no completados) tienen el botón "ACEPTAR DESAFÍO" habilitado.
16. El sistema actualiza el puntaje de poder del clan en función del progreso acumulado por todos los miembros.

**Flujos Alternativos:**

- **[FA-1]** Si el Líder de Clan no publicó directivas para la semana, el sistema muestra un estado vacío con el mensaje "No hay directivas activas esta semana."
- **[FA-2]** Si el usuario accede a esta pantalla y el clan no tiene rango asignado, la etiqueta del encabezado muestra "SIN CLASIFICAR" en lugar del número de rango.

---

## CU-002-003: Aceptar un Desafío Semanal

**Descripción:** Este caso de uso describe la acción mediante la cual el miembro se compromete formalmente con una directiva semanal publicada por el Líder de Clan en La Forja. La aceptación de un desafío vincula el seguimiento de progreso del miembro al objetivo colectivo del clan y habilita la acumulación de puntaje hacia el ranking de la Guerra Global. Un mismo miembro puede aceptar múltiples desafíos activos simultáneamente, maximizando así su contribución al poder colectivo del clan.

**Actores:** Miembro, Sistema SilverBack

**Precondiciones:** El usuario visualizó el listado de desafíos activos (CU-002-002) y existe al menos un desafío con el botón "ACEPTAR DESAFÍO" habilitado.

**Escenario Principal de Éxito:**

1. El usuario está en la pantalla "ARENA DESAFÍOS" con el listado de directivas semanales visible.
2. El usuario identifica el primer desafío de tipo TITAN TIER como activo y no completado.
3. El usuario verifica el objetivo cuantificable del desafío y el plazo de cumplimiento.
4. El usuario observa el progreso acumulado por el clan en ese desafío, expresado como porcentaje del total requerido.
5. El usuario evalúa que la diferencia restante para alcanzar el objetivo es alcanzable dentro del período semanal.
6. El usuario lee la descripción del requisito adicional del desafío.
7. El desafío TITAN TIER muestra el botón "ACEPTAR DESAFÍO" en naranja y habilitado.
8. El usuario presiona "ACEPTAR DESAFÍO" en la tarjeta del primer desafío.
9. El sistema registra la aceptación y asocia el seguimiento de progreso futuro al perfil del miembro.
10. El botón de la tarjeta actualiza su estado visual confirmando que el compromiso fue registrado.
11. El usuario procede al segundo desafío activo de tipo ENDURANCE con su nombre visible.
12. El usuario verifica el progreso actual del segundo desafío como fracción del objetivo total.
13. El usuario evalúa que la diferencia restante para completar el objetivo requiere un esfuerzo sostenido a lo largo de la semana.
14. El usuario considera que puede distribuir el esfuerzo en varios días y decide comprometerse.
15. El usuario presiona "ACEPTAR DESAFÍO" en la tarjeta del segundo desafío.
16. El sistema registra la aceptación del segundo desafío y vincula ambos compromisos al perfil del miembro.
17. El sistema actualiza el puntaje de poder del clan reflejando los nuevos compromisos adquiridos.

**Flujos Alternativos:**

- **[FA-1]** Si el usuario intenta aceptar un desafío ya completado, el botón aparece como "PROTOCOLO ASEGURADO" en gris y no ejecuta ninguna acción al ser presionado.
- **[FA-2]** Si el Líder de Clan no publicó directivas para la semana, la pantalla no muestra ningún botón "ACEPTAR DESAFÍO" disponible.

---

## CU-002-004: Comunicarse en la Sala de Tácticas

**Descripción:** Este caso de uso describe la participación del miembro en el canal de comunicación grupal del clan, denominado Sala de Tácticas. Este espacio funciona como un chat en tiempo real donde los miembros pueden intercambiar estrategias, el sistema publica alertas automáticas de rendimiento y el Líder de Clan puede notificar desafíos emergentes. Los mensajes se clasifican en tres tipos: mensajes de sistema (alertas automáticas), mensajes de miembro (comunicación entre usuarios) y notificaciones de desafío (publicadas por el Líder). La sala incluye un indicador LIVE que señala actividad en tiempo real.

**Actores:** Miembro, Líder de Clan, Sistema SilverBack

**Precondiciones:** El miembro pertenece a un clan activo y accede a la Sala de Tácticas desde el Santuario o la barra lateral de navegación.

**Escenario Principal de Éxito:**

1. El usuario accede a la pantalla "SALA DE TÁCTICAS" desde el ítem de navegación en la barra lateral o desde el botón "CHAT" en el Santuario.
2. El sistema presenta el encabezado "SALA DE TÁCTICAS" con el indicador LIVE (punto verde parpadeante) que confirma actividad en tiempo real.
3. El usuario visualiza el historial de mensajes en el área central de la pantalla.
4. El sistema muestra un mensaje de tipo "system" con fondo naranja translúcido: notificación de que un miembro del clan superó el objetivo semanal de puntaje.
5. Debajo, aparece un mensaje de tipo "member" de otro integrante del clan visible en el historial.
6. El sistema muestra una notificación de desafío con fondo diferenciado: un nuevo desafío publicado por el Líder de Clan.
7. El usuario lee los mensajes del historial y desplaza hacia arriba para ver conversaciones anteriores.
8. El usuario hace clic en el campo de texto ubicado en la parte inferior de la pantalla.
9. El usuario redacta su mensaje de respuesta al canal.
10. El usuario puede ver su texto en tiempo real mientras escribe en el campo de entrada.
11. El usuario presiona el botón "ENVIAR" a la derecha del campo de texto.
12. El sistema publica el mensaje en el chat y lo muestra alineado a la derecha, diferenciado del resto de mensajes.
13. El nuevo mensaje del usuario aparece con formato de burbuja distinto al de los demás miembros.
14. El sistema actualiza automáticamente el historial de mensajes sin necesidad de recargar la pantalla.
15. El usuario visualiza el nuevo mensaje en la parte inferior del chat como el más reciente.
16. El usuario puede continuar enviando mensajes o navegar hacia otra sección mediante la barra lateral.

**Flujos Alternativos:**

- **[FA-1]** Si el usuario presiona "ENVIAR" con el campo de texto vacío, el sistema no publica ningún mensaje y mantiene el foco en el campo de entrada.
- **[FA-2]** Si la conexión en tiempo real se interrumpe, el indicador LIVE cambia a estado inactivo y los mensajes nuevos se encolan hasta restablecer la conexión.

---

## CU-002-005: Asignar Rol a un Miembro del Clan

**Descripción:** Este caso de uso describe el proceso mediante el cual el Líder de Clan reasigna el rol jerárquico de un miembro desde el Panel de Gestión Táctica. La jerarquía disponible comprende cuatro niveles: SILVERBACK (Líder), BETA (Oficial), EXPLORADOR (Miembro) y RECLUTA. El cambio de rol determina el nivel de acceso a funcionalidades administrativas del clan y es efectivo de forma inmediata en la interfaz, sin requerir aprobación adicional.

**Actores:** Líder de Clan (Silverback), Sistema SilverBack

**Precondiciones:** El usuario autenticado posee el rol SILVERBACK (Líder) dentro del clan.

**Escenario Principal de Éxito:**

1. El Líder accede a la pantalla "PANEL DE GESTIÓN TÁCTICA" desde el menú de navegación o desde el Santuario.
2. El sistema presenta el título del panel y el contador de capacidad del clan en formato "miembros actuales / capacidad máxima MIEMBROS ACTIVOS".
3. El Líder visualiza la línea divisoria y la lista de miembros activos bajo ella.
4. El sistema muestra al Líder del clan con su alias de clan, nivel, antigüedad en días y rol SILVERBACK (LÍDER), con avatar de gorila.
5. El sistema muestra a un miembro oficial con su alias, nivel, antigüedad y rol BETA (OFICIAL), con avatar de gorila.
6. El sistema muestra al miembro a gestionar con su nivel, antigüedad, rol EXPLORADOR (MIEMBRO) e iniciales en el avatar.
7. El Líder evalúa el desempeño reciente del miembro y determina que merece una promoción.
8. El Líder ubica la fila del miembro y localiza el selector de rol (dropdown) a la derecha.
9. El Líder despliega el selector y visualiza las cuatro opciones: SILVERBACK, BETA, EXPLORADOR, RECLUTA.
10. El Líder selecciona "BETA (OFICIAL)" del dropdown para promover al miembro seleccionado.
11. El sistema actualiza inmediatamente el rol del miembro en la interfaz sin requerir confirmación adicional.
12. La fila del miembro ahora refleja el nuevo rol "BETA (OFICIAL)" como valor activo del selector.
13. El Líder verifica visualmente que el cambio se aplicó correctamente en la fila del miembro.
14. El Líder evalúa si el miembro oficial debe mantenerse en su rol actual o ascender a SILVERBACK como co-líder.
15. El Líder accede al dropdown del miembro oficial para revisar las opciones disponibles.
16. El sistema muestra que el rol SILVERBACK puede asignarse, pero advierte que solo puede haber un SILVERBACK activo por clan.
17. El Líder decide mantener el rol actual del miembro oficial y cierra el panel sin realizar cambios adicionales.

**Flujos Alternativos:**

- **[FA-1]** Si un miembro sin permisos de Líder accede a esta pantalla, el sistema muestra el listado en modo solo lectura sin los selectores de rol ni el botón EXPULSAR.
- **[FA-2]** Si el Líder intenta cambiar su propio rol de SILVERBACK, el sistema deshabilita esa opción para evitar que el clan quede sin líder.

---

## CU-002-006: Expulsar a un Miembro del Clan

**Descripción:** Este caso de uso describe la acción mediante la cual el Líder de Clan remueve a un miembro de la organización desde el Panel de Gestión Táctica. La expulsión es una acción irreversible que elimina al miembro del clan, revoca su acceso a las funcionalidades colectivas (Guerra Global, Sala de Tácticas, La Forja) y actualiza el contador de capacidad del clan. El sistema requiere confirmación explícita antes de ejecutar la acción para evitar expulsiones accidentales.

**Actores:** Líder de Clan (Silverback), Sistema SilverBack

**Precondiciones:** El usuario autenticado posee el rol SILVERBACK (Líder) dentro del clan y existe al menos un miembro distinto al Líder en el listado.

**Escenario Principal de Éxito:**

1. El Líder accede a la pantalla "PANEL DE GESTIÓN TÁCTICA" desde el menú de navegación o desde el Santuario.
2. El sistema presenta el contador de capacidad actual del clan en formato "miembros actuales / capacidad máxima MIEMBROS ACTIVOS".
3. El Líder revisa el listado de miembros y detecta inactividad prolongada en un miembro con bajo nivel y corta antigüedad en el clan.
4. El Líder ubica la fila correspondiente al miembro en el listado.
5. El Líder verifica que el miembro tiene el rol EXPLORADOR (MIEMBRO), confirmando que no es el Líder ni un Oficial con permisos críticos.
6. El Líder localiza el botón "EXPULSAR" con ícono de UserMinus y borde naranja en la fila del miembro.
7. El Líder presiona el botón "EXPULSAR" en la fila del miembro seleccionado.
8. El sistema despliega un modal de confirmación mostrando el nombre del miembro y una advertencia de que la acción es irreversible.
9. El modal presenta dos opciones de acción: "CONFIRMAR EXPULSIÓN" y "CANCELAR".
10. El Líder lee la advertencia y verifica que el miembro a expulsar es el correcto.
11. El Líder presiona "CONFIRMAR EXPULSIÓN" en el modal para proceder con la acción.
12. El sistema elimina al miembro del clan y revoca su acceso a todas las funcionalidades colectivas.
13. La fila del miembro expulsado desaparece del listado de miembros activos.
14. El contador de capacidad se actualiza automáticamente decrementando en una unidad el total de miembros activos.
15. El sistema registra el evento de expulsión en el historial de administración del clan con marca de tiempo y el nombre del Líder que ejecutó la acción.
16. El Líder verifica el listado actualizado y confirma que el miembro ya no figura entre los integrantes del clan.

**Flujos Alternativos:**

- **[FA-1]** Si el Líder presiona "CANCELAR" en el modal de confirmación, el sistema cierra el modal sin ejecutar ninguna acción y el miembro permanece en el clan.
- **[FA-2]** Si el Líder intenta expulsar a un miembro con rol SILVERBACK, el botón "EXPULSAR" está deshabilitado en esa fila para proteger la integridad del liderazgo del clan.

---

---

# CU-003 — ARENA

*Zona competitiva del sistema. Accessible desde el tab "Arena" de la Topbar. Incluye la guerra global, registro de entrenamientos, calculadora CER e historial.*

---

## CU-003-001: Consultar el Estado de la Guerra Global

**Descripción:** Este caso de uso describe la visualización por parte del miembro del estado actual de la competencia semanal entre clanes, denominada Guerra Global. La pantalla muestra el enfrentamiento en curso entre el clan propio (NUESTRA MANADA) y el clan rival (CLAN RIVAL), incluyendo el puntaje acumulado de cada equipo, su porcentaje de avance hacia el objetivo de puntaje y el rango global de cada clan. La Guerra Global es el eje competitivo central de SilverBack y motiva a los miembros a registrar entrenamientos para contribuir al puntaje colectivo.

**Actores:** Miembro, Sistema SilverBack

**Escenario Principal de Éxito:**

1. El usuario accede a la pantalla "GUERRA GLOBAL" desde la sección "Arena" del menú de navegación superior.
2. El sistema presenta el encabezado "GUERRA GLOBAL" con el subtítulo indicando el número y nombre de la semana activa de la guerra.
3. El usuario visualiza dos tarjetas de clan dispuestas en columnas paralelas.
4. La tarjeta izquierda muestra "NUESTRA MANADA" con borde naranja y el rango actual del clan propio.
5. El sistema indica el puntaje acumulado por el clan propio expresado en puntos.
6. La barra de progreso naranja de la tarjeta izquierda refleja el porcentaje de avance hacia el objetivo de puntaje total.
7. La tarjeta derecha muestra "CLAN RIVAL" con borde gris y el rango actual del clan rival.
8. El sistema indica el puntaje acumulado por el clan rival expresado en puntos.
9. La barra de progreso gris de la tarjeta derecha refleja el porcentaje de avance del rival hacia el mismo objetivo.
10. Entre ambas tarjetas, el sistema muestra el distintivo "VS" con borde naranja como elemento visual central.
11. El usuario interpreta la diferencia de puntaje entre ambos clanes para evaluar la ventaja o desventaja competitiva.
12. El usuario visualiza el botón "REGISTRAR ENTRENAMIENTO" en la parte inferior de la pantalla.
13. El usuario comprende que registrar un entrenamiento contribuirá puntos al total de su clan.
14. El usuario puede acceder al historial de batallas navegando hacia la sección "Historial" en la barra lateral.
15. El sistema actualiza los puntajes en tiempo real a medida que los miembros del clan registran entrenamientos.

**Flujos Alternativos:**

- **[FA-1]** Si el clan del usuario no tiene rival asignado para la semana, el sistema muestra la tarjeta rival con el estado "SIN RIVAL ASIGNADO" y la barra de progreso en cero.
- **[FA-2]** Si el usuario accede a esta pantalla desde la barra lateral sin haber completado el onboarding, el sistema lo redirige al flujo de incorporación.

---

## CU-003-002: Registrar un Entrenamiento

**Descripción:** Este caso de uso describe el proceso mediante el cual el miembro registra los datos de un ejercicio realizado durante su sesión de entrenamiento. El formulario de ingreso solicita el nombre del ejercicio, el peso utilizado en kilogramos y la cantidad de repeticiones completadas. Estos datos son la entrada principal del Algoritmo CER (Capacidad de Esfuerzo Relativa), que calcula el puntaje de rendimiento del miembro y lo convierte en puntos para la Guerra Global. El sistema ofrece además la posibilidad de previsualizar el puntaje CER antes de confirmar el registro.

**Actores:** Miembro, Sistema SilverBack

**Precondiciones:** El usuario accedió a la pantalla de registro desde el botón "REGISTRAR ENTRENAMIENTO" en la Guerra Global o desde la navegación directa.

**Escenario Principal de Éxito:**

1. El usuario llega a la pantalla "REGISTRAR ESFUERZO DE BATALLA" con el subtítulo "Registra tu rendimiento. La precisión es poder."
2. El sistema muestra el botón de retroceso (flecha izquierda) que permite volver a la pantalla de Guerra Global.
3. El usuario visualiza el formulario con tres secciones: nombre del ejercicio, control de peso y control de repeticiones.
4. El usuario hace clic en el campo "NOMBRE DEL EJERCICIO" con el placeholder "EJ. SENTADILLA CON BARRA".
5. El usuario digita el nombre del ejercicio realizado.
6. El sistema actualiza el campo con el texto ingresado en mayúsculas.
7. El usuario observa el control de PESO (KG) con el valor predeterminado del campo.
8. El usuario presiona el botón "–" para reducir el peso en incrementos de 5 kg hasta llegar al valor deseado.
9. El usuario también puede presionar el botón "+" para aumentar el peso en incrementos de 5 kg.
10. El usuario ajusta el valor al peso utilizado en su ejercicio.
11. El usuario observa el control de REPETICIONES con el valor predeterminado del campo.
12. El usuario presiona el botón "+" para incrementar las repeticiones en 1 unidad hasta el número realizado.
13. El usuario puede reducir las repeticiones presionando "–" (el mínimo posible es 1).
14. El usuario revisa los valores ingresados: nombre del ejercicio, peso en kilogramos y cantidad de repeticiones.
15. El usuario presiona el botón "CALCULAR CER" para previsualizar el puntaje antes de registrar.
16. El sistema redirige al usuario a la pantalla de la Calculadora CER con los datos del ejercicio en contexto.
17. Tras revisar el CER, el usuario regresa y presiona "REGISTRAR ESFUERZO" para confirmar el registro.
18. El sistema guarda el entrenamiento, calcula los puntos CER y los acredita al perfil del miembro y al total de la Guerra Global.

**Flujos Alternativos:**

- **[FA-1]** Si el usuario presiona "REGISTRAR ESFUERZO" sin haber ingresado el nombre del ejercicio, el sistema resalta el campo vacío y solicita completarlo antes de proceder.
- **[FA-2]** Si el usuario reduce el peso a 0 con el botón "–", el sistema no permite valores negativos y mantiene el mínimo en 0.

---

## CU-003-003: Calcular el Puntaje CER

**Descripción:** Este caso de uso describe la consulta del Algoritmo CER (Capacidad de Esfuerzo Relativa) por parte del miembro, que le permite previsualizar en tiempo real el puntaje que obtendrá por un entrenamiento antes de confirmarlo. La pantalla presenta la fórmula del CER de forma visual, descompuesta en sus factores (multiplicador de arquetipo, datos de ejercicio y multiplicador base), junto con el puntaje resultante en naranja y los datos de contexto del ejercicio actual (peso en libras y repeticiones). Esta funcionalidad permite al usuario optimizar sus parámetros de entrenamiento para maximizar el puntaje obtenido.

**Actores:** Miembro, Sistema SilverBack

**Precondiciones:** El usuario accedió a la calculadora CER desde la pantalla de registro de entrenamiento presionando "CALCULAR CER".

**Escenario Principal de Éxito:**

1. El sistema presenta la pantalla modal "ALGORITMO CER" con el ícono de grilla y el título en mayúsculas.
2. El usuario visualiza el botón de cierre (X) en la esquina superior derecha del modal.
3. El sistema muestra el panel de "CALCULADORA CER EN VIVO" con la fórmula descompuesta.
4. El usuario puede ver el primer factor de la fórmula: "MULTIPLICADOR DE ARQUETIPO" como numerador.
5. El usuario visualiza el divisor de la fórmula con el ícono de actualización, que indica recalculado dinámico.
6. El sistema muestra el tercer factor de la fórmula con el ícono naranja y el texto "MULTIPLICADOR DE ARQUETIPO — Silverback (1.15x)".
7. El usuario comprende que su arquetipo Silverback otorga un multiplicador de 1.15 sobre el puntaje base.
8. El sistema presenta el "PUNTAJE CER ACTUAL" con el valor resultante en tipografía grande color naranja.
9. El usuario observa el indicador de estado "Cálculo en Vivo Activo" con el punto naranja parpadeante.
10. El usuario revisa la tarjeta "PESO REGISTRADO" con el valor en libras del peso ingresado para el ejercicio.
11. El sistema también muestra la tarjeta "REPETICIONES COMPLETADAS" con el valor de repeticiones registradas.
12. El usuario evalúa si el puntaje CER resultante es satisfactorio para el ejercicio realizado.
13. El usuario puede decidir cerrar el modal y ajustar el peso o las repeticiones para obtener un mejor puntaje.
14. Si el usuario está conforme, presiona el botón "CONFIRMAR" en la parte inferior derecha del modal.
15. El sistema registra el ejercicio con el puntaje CER calculado y redirige al usuario a la pantalla de Guerra Global.
16. Los puntos CER se acreditan automáticamente al perfil del miembro y al contador de la Guerra Global.

**Flujos Alternativos:**

- **[FA-1]** Si el usuario presiona "CERRAR" en lugar de "CONFIRMAR", el sistema descarta el resultado sin registrar el entrenamiento y regresa a la pantalla de ingreso de esfuerzo.
- **[FA-2]** Si el usuario presiona la X del encabezado, el sistema ejecuta el mismo comportamiento que "CERRAR" (regresa sin guardar).

---

## CU-003-004: Consultar el Historial de Batallas

**Descripción:** Este caso de uso describe la revisión por parte del miembro de su historial completo de enfrentamientos contra otros clanes en la Arena de SilverBack. La pantalla muestra estadísticas agregadas (total de enfrentamientos, tasa de victoria y racha actual de victorias consecutivas) y el detalle de los compromisos más recientes, incluyendo el nombre del rival, fecha, hora, duración del enfrentamiento, nivel de intensidad y resultado (VICTORIA o DERROTA). El historial permite al miembro analizar su evolución como competidor y planificar su estrategia futura.

**Actores:** Miembro, Sistema SilverBack

**Escenario Principal de Éxito:**

1. El usuario accede a la pantalla "HISTORIAL DE BATALLA" desde el ítem "Historial" de la barra lateral de navegación.
2. El sistema presenta el encabezado con el título en dos líneas: "HISTORIAL / DE BATALLA" y la descripción del propósito de la sección.
3. El usuario visualiza los botones de acción en el encabezado: "FILTRAR PARTIDAS" y "INFORME COMPLETO".
4. El sistema muestra la tarjeta de estadística "TOTAL DE ENFRENTAMIENTOS" con la cantidad acumulada de batallas del miembro.
5. La tarjeta "TASA DE VICTORIA" muestra el porcentaje de victorias en verde como indicador positivo.
6. La tarjeta "RACHA ACTUAL" muestra el número de victorias consecutivas activas con el valor en naranja.
7. El usuario procede a revisar la sección "COMPROMISOS RECIENTES".
8. El primer ítem muestra el nombre del rival del enfrentamiento más reciente, con fecha y hora del registro.
9. El sistema indica la duración del enfrentamiento expresada en minutos:segundos y el nivel de intensidad.
10. El resultado se muestra como "VICTORIA" con borde verde, resaltando el logro positivo.
11. El segundo ítem muestra el nombre del rival del segundo enfrentamiento más reciente, con fecha y hora.
12. El sistema indica la duración e intensidad del segundo enfrentamiento y el resultado aparece como "DERROTA" con borde rojo.
13. El tercer ítem muestra el nombre del rival del tercer enfrentamiento, con fecha y hora.
14. El sistema indica la duración e intensidad del tercer enfrentamiento, que resultó en una "VICTORIA" con borde verde.
15. El usuario presiona el botón "FILTRAR PARTIDAS" para segmentar el historial por resultado, fecha o rival.
16. El usuario puede presionar "ACCEDER A REGISTROS ANTERIORES" para cargar más enfrentamientos del historial extendido.

**Flujos Alternativos:**

- **[FA-1]** Si el usuario presiona "INFORME COMPLETO", el sistema genera un reporte detallado en formato exportable con todos los enfrentamientos y métricas de rendimiento.
- **[FA-2]** Si el miembro no tiene enfrentamientos registrados aún, el sistema muestra las estadísticas en cero y la sección de compromisos recientes vacía con un mensaje de instrucción.

---

---

# CU-004 — EVOLUCIÓN / BÓVEDA

*Zona de progresión individual. Accessible desde el tab "Bóveda" de la Topbar. Incluye perfil de evolución, árbol de habilidades, recompensas y marketplace.*

---

## CU-004-001: Visualizar Progreso de Evolución

**Descripción:** Este caso de uso describe la consulta del estado de progresión personal del miembro en el sistema SilverBack, accesible desde la sección "Cámara de Evolución". La pantalla presenta el avatar del miembro con su nivel actual, la barra de experiencia hacia el siguiente rango, y tres tarjetas de atributos físicos —FUERZA, AGILIDAD y RESISTENCIA— calculados en base al historial de entrenamientos. Esta sección permite al miembro dimensionar su crecimiento individual y orientar sus próximas sesiones hacia los atributos que requieren más desarrollo.

**Actores:** Miembro, Sistema SilverBack

**Escenario Principal de Éxito:**

1. El usuario accede a la sección de Evolución desde el menú de navegación superior (sección "Bóveda/Evolución").
2. El sistema presenta la pantalla con el título "PERFIL" y el subtítulo "Cámara de desarrollo de atributos físicos y nivel de clan."
3. El usuario visualiza el avatar del miembro: un gorila con borde naranja de 4px en formato circular.
4. El sistema muestra la insignia de nivel actual del miembro en naranja debajo del avatar.
5. La barra de progreso de rango indica el XP acumulado sobre el XP requerido para el siguiente rango, con el porcentaje de avance completado.
6. El sistema muestra a la izquierda de la barra el rango actual (ej. PLATA) y a la derecha el próximo rango (ej. ORO).
7. La progresión completa de rangos se visualiza debajo: BRONCE — PLATA ◆ — ORO.
8. El usuario interpreta la diferencia de XP restante para ascender al rango siguiente.
9. El usuario visualiza la columna derecha con las tres tarjetas de atributos individuales.
10. La tarjeta FUERZA muestra el puntaje acumulado de fuerza con ícono de mancuerna naranja.
11. La tarjeta AGILIDAD muestra el puntaje acumulado de agilidad con ícono de rayo naranja.
12. La tarjeta RESISTENCIA muestra el puntaje acumulado de resistencia con ícono de actividad naranja.
13. El usuario compara sus atributos e identifica el de menor puntaje relativo.
14. El usuario decide navegar hacia la pantalla de Árbol de Habilidades para invertir puntos en el atributo más débil.
15. El usuario presiona el botón "RENDIMIENTO" en la parte inferior de la columna derecha.
16. El sistema redirige al usuario al Dashboard de Rendimiento Personal (/perfil) para análisis comparativo.

**Flujos Alternativos:**

- **[FA-1]** Si el miembro acaba de alcanzar el nivel máximo, la barra de XP muestra "MAX LEVEL" y el botón de rango siguiente no está disponible.
- **[FA-2]** Si el atributo de un miembro supera el máximo de la escala, el sistema lo muestra como "999+ PTS" con una estrella indicadora de logro extraordinario.

---

## CU-004-002: Mejorar Nodo del Árbol de Habilidades

**Descripción:** Este caso de uso describe el proceso mediante el cual el miembro invierte los Puntos de Clan acumulados en nodos específicos del árbol de habilidades del clan, con el objetivo de desbloquear mejoras colectivas que benefician a todos los miembros. El árbol está organizado jerárquicamente: parte desde un nodo raíz (FUERZA) y se ramifica en especializaciones desbloqueables (RESISTENCIA, ATAQUE, FUEGO y nodos bloqueados). Cada mejora tiene un costo en puntos, un efecto actual y un próximo nivel con beneficios superiores. El panel derecho muestra el detalle del nodo seleccionado y el historial de inversiones recientes.

**Actores:** Miembro, Líder de Clan, Sistema SilverBack

**Precondiciones:** El usuario dispone de Puntos de Clan suficientes para cubrir el costo del nodo que desea mejorar.

**Escenario Principal de Éxito:**

1. El usuario accede a la pantalla "SKILL TREE" desde el ítem "Árbol de Habilidades" en la barra lateral de navegación.
2. El sistema presenta el saldo de Puntos de Clan disponibles del usuario en la esquina superior derecha.
3. El usuario visualiza el diagrama del árbol con los nodos posicionados y conectados mediante líneas SVG.
4. El nodo raíz "FUERZA" aparece en la posición central superior, sin nivel asignado (nodo origen).
5. Las líneas naranja conectan FUERZA con RESISTENCIA (izquierda) y con ATAQUE (derecha).
6. El usuario identifica el nodo "RESISTENCIA" activo con borde naranja (desbloqueado).
7. El usuario hace clic sobre el nodo RESISTENCIA para seleccionarlo y ver sus detalles.
8. El sistema resalta el nodo RESISTENCIA con fondo naranja completo indicando que está activo.
9. El panel derecho se actualiza mostrando: nombre "RESISTENCIA", el nivel actual sobre el nivel máximo, y el ícono correspondiente.
10. El usuario lee la descripción del efecto del nodo sobre las capacidades del clan.
11. El sistema indica el efecto activo del nodo y el efecto del siguiente nivel como mejora.
12. El usuario visualiza el costo de mejora expresado en Puntos de Clan.
13. El usuario verifica que su saldo de Puntos de Clan es suficiente para cubrir el costo.
14. El usuario presiona el botón "MEJORAR NODO" en la parte inferior del panel derecho.
15. El sistema descuenta el costo del nodo y actualiza el saldo de Puntos de Clan.
16. El nodo RESISTENCIA avanza al siguiente nivel y el sistema actualiza la insignia del nodo en el diagrama.
17. El panel "ÚLTIMAS INVERSIONES" se actualiza mostrando el nombre del nodo mejorado, el nuevo nivel alcanzado y el costo deducido como entrada más reciente.

**Flujos Alternativos:**

- **[FA-1]** Si el usuario hace clic sobre un nodo "BLOQUEADO", el sistema no permite la selección y muestra un tooltip indicando el prerrequisito necesario para desbloquearlo.
- **[FA-2]** Si el usuario no tiene suficientes puntos para cubrir el costo del nodo, el botón "MEJORAR NODO" aparece deshabilitado con el mensaje "PUNTOS INSUFICIENTES".

---

## CU-004-003: Reclamar Recompensa de la Bóveda

**Descripción:** Este caso de uso describe el proceso mediante el cual el miembro accede a su Bóveda personal y reclama las recompensas acumuladas por su rendimiento en la Arena. La Bóveda presenta cajas y cofres de distintos niveles de rareza: desde un cofre básico disponible hasta cofres bloqueados que requieren Llaves de Acero y cofres de evento limitado de alta rareza. El sistema también informa el multiplicador de XP activo, el tiempo hasta el próximo botín disponible y el total de cajas acumuladas, incentivando la participación sostenida en la plataforma.

**Actores:** Miembro, Sistema SilverBack

**Escenario Principal de Éxito:**

1. El usuario accede a la pantalla "BÓVEDA" desde la sección de Evolución en el menú de navegación superior.
2. El sistema presenta el subtítulo "Reclama tus recompensas de alto rendimiento. El esfuerzo se paga en metal y recursos."
3. El usuario visualiza las cuatro tarjetas de estadísticas en la parte superior.
4. La primera tarjeta indica la cantidad total de cajas disponibles en la bóveda del miembro.
5. La segunda tarjeta indica la cantidad de cofres listos para reclamar en ese momento.
6. La tercera tarjeta muestra la etiqueta "MULTIPLICADOR XP" con el valor activo para todos los cofres del día.
7. La cuarta tarjeta muestra la etiqueta "PRÓXIMO" con el tiempo restante hasta el siguiente botín disponible.
8. El usuario desciende a la grilla de tres cofres y evalúa sus opciones de reclamo.
9. La primera tarjeta de cofre muestra el nombre del cofre básico disponible con la etiqueta naranja "LISTO".
10. La descripción indica el tipo de contenido esperado al abrir ese cofre.
11. El usuario presiona el botón "RECLAMAR" en la tarjeta del cofre disponible.
12. El sistema procesa el reclamo, abre el cofre virtualmente y acredita las recompensas al inventario del miembro.
13. El usuario observa la segunda tarjeta: un cofre bloqueado con la etiqueta gris "BLOQUEADO" y un candado superpuesto.
14. El botón de esta tarjeta indica el costo en Llaves de Acero necesario para desbloquearlo.
15. El usuario observa la tercera tarjeta: un cofre de evento con borde naranja y etiqueta rosa "EVENTO LIMITADO".
16. La descripción anuncia el tipo de recompensas garantizadas incluidas en el cofre de evento.
17. El usuario presiona "RECLAMAR AHORA" en el cofre de evento y el sistema procesa el reclamo del cofre de evento limitado.

**Flujos Alternativos:**

- **[FA-1]** Si el usuario no posee las Llaves de Acero necesarias para el cofre bloqueado, el sistema muestra el botón deshabilitado y una indicación de cómo obtener las llaves.
- **[FA-2]** Si el contador de tiempo del próximo botín llega a cero mientras el usuario está en la pantalla, el sistema actualiza automáticamente el estado del cofre correspondiente de "no disponible" a "LISTO".

---

## CU-004-004: Adquirir Ítem en el Marketplace

**Descripción:** Este caso de uso describe el proceso mediante el cual el miembro navega el catálogo de ítems cosméticos del Marketplace de SilverBack y adquiere uno utilizando su saldo de moneda SB (SilverBack Coins). El Marketplace ofrece cuatro categorías de ítems: SKINS (apariencias de avatar), AURAS (efectos visuales activos durante el entrenamiento), ICONOS (imágenes de perfil exclusivas) y la vista TODOS que muestra el catálogo completo. La adquisición de estos ítems no afecta el rendimiento del usuario pero sí su identidad visual dentro del clan, reforzando el sistema de estatus y recompensas.

**Actores:** Miembro, Sistema SilverBack

**Precondiciones:** El miembro dispone de saldo suficiente en su billetera de SilverBack Coins (SB).

**Escenario Principal de Éxito:**

1. El usuario accede a la pantalla "MARKETPLACE" desde el ítem "Mercado" en la barra lateral de navegación.
2. El sistema presenta el subtítulo "Equípate con las mejores skins, auras e iconos. Demuestra tu jerarquía en la arena."
3. El sistema muestra el saldo actual del usuario expresado en SB (SilverBack Coins) en la esquina superior derecha.
4. El usuario visualiza los cuatro filtros de categoría: TODOS (activo por defecto), SKINS, AURAS, ICONOS.
5. El catálogo inicial muestra todos los ítems disponibles en la vista TODOS.
6. El usuario lee la tarjeta del primer ítem de categoría SKIN disponible, con su precio en SB y descripción del efecto visual.
7. El usuario hace clic en la pestaña "SKINS" para filtrar solo los ítems de tipo skin.
8. El sistema actualiza la grilla mostrando únicamente los ítems de categoría SKIN disponibles.
9. El usuario lee el segundo ítem de categoría SKIN disponible con su precio y descripción.
10. El usuario regresa a la pestaña "TODOS" y evalúa el ítem de categoría AURA disponible y su precio en SB.
11. La descripción indica el efecto visual del ítem AURA que se activa durante el entrenamiento.
12. El usuario también considera el ítem de categoría ICONO disponible como opción de menor precio.
13. El usuario decide adquirir el ítem AURA y presiona el botón "COMPRAR" en esa tarjeta.
14. El sistema solicita confirmación de la compra mostrando el nombre del ítem y el costo final.
15. El usuario confirma la transacción y el sistema descuenta el precio del ítem del saldo, actualizando el total disponible.
16. El ítem adquirido queda registrado en el inventario del usuario y disponible para activar desde el perfil.

**Flujos Alternativos:**

- **[FA-1]** Si el saldo del usuario es insuficiente para el ítem seleccionado, el botón "COMPRAR" aparece deshabilitado y el precio se muestra en rojo indicando fondos insuficientes.
- **[FA-2]** Si el usuario filtra por una categoría sin ítems disponibles en ese momento, el sistema muestra la grilla vacía con el mensaje "No hay ítems disponibles en esta categoría."

---

---

# CU-005 — PERFIL

*Zona de análisis personal. Accessible desde el tab "Perfil" de la Topbar o desde la barra lateral. Incluye dashboard de rendimiento, racha, fatiga, trofeos y beneficios.*

---

## CU-005-001: Consultar Dashboard de Rendimiento Personal

**Descripción:** Este caso de uso describe la consulta por parte del miembro de su panel de análisis comparativo de rendimiento, que sintetiza los indicadores más relevantes de su actividad en SilverBack. El Dashboard está compuesto por cuatro bloques: el Índice de Dominancia (posición relativa dentro del clan), el Perfil Táctico (visualización en radar de los atributos del usuario vs. el promedio del clan), el Volumen Total (kilogramos acumulados vs. la media del clan) y el Puntaje C.E.R. descompuesto en Capacidad, Eficiencia y Recuperación con rango de clasificación.

**Actores:** Miembro, Sistema SilverBack

**Escenario Principal de Éxito:**

1. El usuario accede a la pantalla "DASHBOARD DE RENDIMIENTO" desde el ítem "Perfil" en el menú de navegación superior o desde el botón "RENDIMIENTO" de la Cámara de Evolución.
2. El sistema presenta el título y el subtítulo "Análisis comparativo contra el promedio del clan. Sector Delta."
3. El usuario visualiza la grilla de cuatro bloques en layout de 2x2.
4. El bloque superior izquierdo muestra "ÍNDICE DE DOMINANCIA" con el valor porcentual del usuario en tipografía gigante naranja.
5. El sistema muestra la insignia de posición relativa dentro del clan, indicando el percentil del usuario frente al resto de los miembros.
6. El usuario pasa al bloque superior derecho: "PERFIL TÁCTICO" con el gráfico de radar en formato SVG.
7. El polígono naranja representa los atributos del usuario y el polígono gris punteado el promedio del clan.
8. El eje superior del radar indica "FUERZA BRUTA", el derecho "RESISTENCIA", el inferior "AGILIDAD" y el izquierdo "TÉCNICA".
9. El usuario interpreta visualmente su perfil respecto al promedio del clan en cada eje.
10. El usuario examina el bloque inferior izquierdo: "VOLUMEN TOTAL (KG)".
11. La barra naranja con la etiqueta "TU RENDIMIENTO" indica el volumen total acumulado por el usuario en kilogramos.
12. La barra gris con la etiqueta "PROMEDIO CLAN" indica el volumen promedio del clan en kilogramos.
13. El sistema muestra el diferencial positivo del usuario respecto al promedio del clan expresado en porcentaje.
14. El usuario revisa el bloque inferior derecho: "PUNTAJE C.E.R." con la insignia de rango CER en naranja.
15. Los tres sub-indicadores muestran los puntajes de CAPACIDAD, EFICIENCIA y RECUPERACIÓN expresados sobre 100 en barras verticales.
16. El usuario identifica el sub-indicador con menor puntaje y planifica ajustar su protocolo de entrenamiento.

**Flujos Alternativos:**

- **[FA-1]** Si el usuario no tiene suficiente historial de entrenamientos para calcular el Índice de Dominancia, el sistema muestra "--" en lugar del porcentaje y un mensaje invitando a registrar al menos 3 sesiones.
- **[FA-2]** Si los datos del radar no están actualizados (sincronización pendiente), el sistema muestra el gráfico con el timestamp del último cálculo disponible.

---

## CU-005-002: Consultar Racha de Entrenamiento

**Descripción:** Este caso de uso describe la visualización por parte del miembro de su racha de entrenamiento activa, que registra la cantidad de días consecutivos en los que el usuario registró al menos una sesión en la plataforma. La pantalla del Termómetro de Racha muestra el contador actual, el estado de alerta si la racha está en riesgo, el costo de rescate disponible y las opciones de acción que el miembro puede tomar. La consulta es el paso previo a decidir si se desea salvar la racha mediante puntos (CU-005-003) o dejarla expirar.

**Actores:** Miembro, Sistema SilverBack

**Escenario Principal de Éxito:**

1. El usuario accede a la pantalla del Termómetro de Racha desde el botón de racha activa en el Santuario o desde la barra lateral de navegación.
2. El sistema muestra el encabezado con la marca "SILVERBACK" y la flecha de retroceso hacia el Santuario.
3. El usuario visualiza la tarjeta central con el título "RACHA ACTUAL" y el subtítulo "Tu disciplina está en riesgo."
4. El sistema muestra el número de días consecutivos acumulados en tipografía grande con un halo de luz naranja generado por sombra de texto.
5. Debajo del número aparece la leyenda "DÍAS CONSECUTIVOS" indicando la magnitud del logro acumulado.
6. El usuario visualiza el banner de advertencia en rojo: "RACHA A PUNTO DE PERDERSE" con ícono de alerta.
7. El usuario comprende que no registró entrenamiento en el día en curso y su racha está en riesgo.
8. El sistema muestra el botón "SALVAR RACHA" con ícono de escudo en color naranja como opción principal.
9. Debajo del botón, el sistema informa el costo de rescate y el saldo actual del usuario en el formato "costo pts (Tienes: saldo pts)".
10. El usuario verifica el saldo disponible y el costo de rescate informados por el sistema.
11. El usuario evalúa si la racha acumulada justifica el gasto del costo de rescate.
12. El usuario comprende que perder la racha implica reiniciar el contador desde cero al día siguiente.
13. El usuario lee el enlace "DEJAR MORIR LA RACHA" ubicado en la parte inferior de la tarjeta como alternativa gratuita.
14. El usuario comprende que elegir esa opción descarta de forma definitiva la racha acumulada sin costo alguno.
15. El usuario toma la decisión de salvar la racha y continúa hacia CU-005-003, o presiona "DEJAR MORIR LA RACHA" para reiniciar el contador.

**Flujos Alternativos:**

- **[FA-1]** Si el usuario ya registró entrenamiento en el día en curso, el sistema muestra el contador de racha sin el banner de advertencia y sin las opciones de salvar o perder.
- **[FA-2]** Si el usuario lleva 0 días de racha, el contador muestra 0 sin opciones de rescate disponibles.

---

## CU-005-003: Salvar Racha con Puntos de Clan

**Descripción:** Este caso de uso describe la acción mediante la cual el miembro utiliza parte de su saldo de puntos para rescatar su racha de entrenamiento en riesgo de perderse, sin necesidad de haber registrado una sesión en el día en curso. El sistema descuenta el costo fijo de rescate, marca la racha como mantenida para el día vigente y actualiza el saldo del miembro. Esta mecánica permite al usuario preservar rachas de larga data en situaciones excepcionales, reforzando el valor de la consistencia dentro de SilverBack.

**Actores:** Miembro, Sistema SilverBack

**Precondiciones:** El usuario consultó el estado de su racha (CU-005-002), confirmó que está en riesgo y verificó que dispone de saldo suficiente para cubrir el costo de rescate.

**Escenario Principal de Éxito:**

1. El usuario se encuentra en la pantalla del Termómetro de Racha con el banner de advertencia rojo activo.
2. El sistema confirma que la racha activa del usuario está en riesgo de perderse al no haber entrenamiento registrado en el día.
3. El usuario visualiza el botón "SALVAR RACHA" con ícono de escudo en color naranja, habilitado y disponible.
4. El sistema informa el costo de rescate y el saldo disponible del usuario en el formato "costo pts (Tienes: saldo pts)".
5. El usuario verifica que su saldo es suficiente para cubrir el costo de rescate.
6. El usuario pondera el valor de proteger la racha acumulada frente al gasto del costo de rescate.
7. El usuario decide proceder y presiona el botón "SALVAR RACHA".
8. El sistema valida que el saldo del usuario cubre el costo de rescate.
9. El sistema descuenta el costo de rescate del saldo del usuario.
10. El saldo actualizado refleja el descuento aplicado.
11. El sistema registra la racha del día en curso como mantenida mediante rescate por puntos.
12. El contador de racha permanece sin reiniciarse.
13. El sistema genera una confirmación visual del éxito de la operación en la interfaz.
14. El banner de advertencia rojo desaparece de la pantalla indicando que la racha está asegurada.
15. El sistema redirige al usuario al Santuario del clan.
16. En el Santuario, el botón de racha activa muestra el contador de días sin ninguna alerta de riesgo activa.

**Flujos Alternativos:**

- **[FA-1]** Si el saldo del usuario es insuficiente para cubrir el costo de rescate, el botón "SALVAR RACHA" aparece deshabilitado con un mensaje indicando el saldo insuficiente y cómo ganar más puntos.
- **[FA-2]** Si el usuario presiona "DEJAR MORIR LA RACHA" en lugar de salvar, el sistema reinicia el contador a 0 días sin realizar ningún cargo al saldo.

---

## CU-005-004: Monitorear Estado de Fatiga Biométrica

**Descripción:** Este caso de uso describe la consulta por parte del miembro de su estado de fatiga actual, analizado por el Sistema SilverBack en base a los datos biométricos y la carga de entrenamiento reciente. La pantalla presenta un indicador circular de riesgo con el nivel de carga como porcentaje, un diagnóstico estructural con la descripción de la sobrecarga detectada y el protocolo de recuperación mandatorio, y un gráfico de tendencia semanal que muestra la evolución de la carga a lo largo de los días. Esta funcionalidad tiene como objetivo prevenir lesiones y guiar al usuario hacia un entrenamiento sostenible.

**Actores:** Miembro, Sistema SilverBack

**Escenario Principal de Éxito:**

1. El usuario accede a la pantalla "ANÁLISIS BIOMÉTRICO DE RECUPERACIÓN" desde el menú de navegación.
2. El sistema presenta el encabezado con la barra naranja vertical, la etiqueta "MONITOR DE FATIGA" y el título principal.
3. El usuario visualiza el layout de dos columnas: el panel de estado actual a la izquierda y el panel de diagnóstico a la derecha.
4. El indicador circular en la columna izquierda muestra el estado: "ALTO RIESGO DE FATIGA" con fondo naranja oscuro y borde naranja con halo de luz.
5. El sistema presenta el ícono de alerta (triángulo) dentro del círculo como señal visual de peligro.
6. Debajo del indicador circular, aparece la barra de carga con la etiqueta "CARGA" y el porcentaje actual de fatiga acumulada.
7. La barra de progreso naranja refleja visualmente el nivel de carga actual del usuario.
8. En la columna derecha, el usuario visualiza el bloque "DIAGNÓSTICO ESTRUCTURAL" con ícono de actividad.
9. La celda izquierda del diagnóstico muestra con borde naranja la alerta "! SOBRECARGA DETECTADA".
10. La descripción de la alerta indica los indicadores fisiológicos que evidencian el estrés sistémico detectado.
11. La celda derecha muestra el "PROTOCOLO DE RECUPERACIÓN" con la insignia "MANDATO" en naranja.
12. El usuario lee las acciones mandatorias del protocolo de recuperación recomendadas por el sistema.
13. El usuario baja al segundo bloque del panel derecho: "TENDENCIA SEMANAL".
14. El gráfico de barras muestra el nivel de carga diaria de cada día de la semana, con la barra del día actual destacada en naranja y los días futuros representados en gris punteado.
15. El usuario identifica el día de mayor carga como el origen del estado de fatiga actual.
16. El usuario decide seguir el protocolo de recuperación mandatorio y planifica su sesión del siguiente día con menor intensidad.

**Flujos Alternativos:**

- **[FA-1]** Si los niveles de fatiga están dentro del rango seguro, el indicador circular muestra "ESTADO ÓPTIMO" en verde y el bloque de diagnóstico presenta un mensaje de confirmación positiva.
- **[FA-2]** Si los datos biométricos del usuario no están actualizados (wearable desconectado), el sistema muestra el panel con una advertencia de sincronización pendiente y los valores del último análisis disponible.

---

## CU-005-005: Consultar Vitrina de Trofeos

**Descripción:** Este caso de uso describe la visualización por parte del miembro de su colección de trofeos y logros obtenidos a lo largo de su participación en SilverBack. La Vitrina de Trofeos es una representación del historial de victorias y hazañas del usuario, organizada en una grilla asimétrica que destaca el logro más importante (trofeo destacado) y acompaña con trofeos secundarios de temporada, desafíos y logros de rendimiento. El encabezado muestra el contador de victorias totales y el rango alcanzado, sintetizando el nivel de maestría del competidor.

**Actores:** Miembro, Sistema SilverBack

**Escenario Principal de Éxito:**

1. El usuario accede a la pantalla "VITRINA DE TROFEOS" desde el ítem "Trofeos" en la barra lateral de navegación.
2. El sistema presenta el encabezado con el avatar del clan (gorila) en un recuadro con borde de 1px.
3. El usuario visualiza el título "VITRINA DE TROFEOS" en tipografía de 5xl y la etiqueta "LOGROS DE COMBATE" en naranja.
4. El sistema muestra la tarjeta de estadística "VICTORIAS:" con el total de victorias acumuladas del miembro.
5. La tarjeta de rango muestra el nivel de excelencia alcanzado por el usuario con fondo naranja.
6. El usuario desciende a la sección principal de trofeos separada por una línea divisoria.
7. El trofeo destacado ocupa las dos columnas del lado izquierdo: etiqueta naranja con el nombre del torneo o evento y estrella dorada en la esquina.
8. El título del trofeo destacado aparece en tipografía de 4xl.
9. La descripción indica el logro obtenido, detallando las condiciones cumplidas y el alcance de la victoria.
10. El emoji del trofeo aparece en el extremo derecho con 30% de opacidad como elemento decorativo de fondo.
11. La columna derecha superior muestra el trofeo de temporada con su nombre y descripción del logro obtenido.
12. La columna derecha inferior muestra el trofeo de desafío mensual con su nombre y descripción del requisito cumplido.
13. En la fila inferior, la tarjeta izquierda muestra un trofeo de rendimiento con ícono de mancuerna y el dato de volumen total acumulado como indicador del logro.
14. La tarjeta derecha inferior muestra un trofeo de velocidad sobre fondo naranja con ícono de actividad y el récord registrado como indicador del logro.
15. El usuario puede desplazarse hacia arriba para volver al encabezado y revisar su rango y victorias totales.
16. El sistema no ofrece interacciones adicionales en esta pantalla; es una vista de solo lectura de los logros del miembro.

**Flujos Alternativos:**

- **[FA-1]** Si el usuario aún no ha obtenido ningún trofeo, el sistema muestra la vitrina vacía con el mensaje "Aún no tienes trofeos. Participa en la Arena para comenzar tu historia."
- **[FA-2]** Si el usuario presiona sobre un trofeo específico, el sistema muestra un modal con el detalle expandido del logro, incluyendo fecha de obtención y condiciones cumplidas.

---

## CU-005-006: Reclamar Beneficio de un Aliado Comercial

**Descripción:** Este caso de uso describe el proceso mediante el cual el miembro accede al catálogo de beneficios exclusivos otorgados por los aliados comerciales del clan SilverBack y gestiona el reclamo de los que le resulten de interés. Los beneficios incluyen descuentos en equipamiento, productos de nutrición, indumentaria deportiva, recuperación y planes de alimentación, y están disponibles según el nivel del miembro. Algunos beneficios tienen fecha de vencimiento visible, requieren nivel mínimo para ser desbloqueados o se activan mediante un código de cupón.

**Actores:** Miembro, Aliado Comercial, Sistema SilverBack

**Precondiciones:** El miembro dispone del nivel mínimo requerido para al menos algunos de los beneficios disponibles.

**Escenario Principal de Éxito:**

1. El usuario accede a la pantalla "BENEFICIOS ALIADOS" desde el ítem "Beneficios" en la barra lateral de navegación.
2. El sistema presenta el subtítulo "Arsenal de recompensas exclusivas para el Clan Silverback. Reclama tu ventaja."
3. El usuario visualiza el botón "FILTROS" en la esquina superior derecha para segmentar por categoría.
4. El sistema muestra la grilla de beneficios en tres columnas con una tarjeta destacada que ocupa dos columnas.
5. La tarjeta destacada muestra la etiqueta naranja "DESTACADO" y el nombre del aliado comercial destacado.
6. El título del beneficio destacado y su descripción indican los productos o servicios aplicables y el nivel mínimo requerido para acceder.
7. El usuario presiona el botón "DESBLOQUEAR CÓDIGO" en el beneficio destacado.
8. El sistema genera y muestra el código de descuento exclusivo para el usuario.
9. El usuario copia el código y lo utilizará en la tienda del aliado.
10. En la columna derecha del primer bloque, el usuario visualiza el beneficio del aliado de nutrición con la etiqueta roja indicando la expiración próxima del beneficio.
11. El usuario presiona "CANJEAR →" para acceder al beneficio de nutrición.
12. El sistema redirige al usuario a la plataforma del aliado o activa el beneficio en su cuenta.
13. En la segunda fila, el usuario encuentra el beneficio del aliado de indumentaria con etiqueta de categoría "ROPA DEPORTIVA".
14. El usuario presiona "COPIAR CUPÓN" para el beneficio de indumentaria con envío gratis y descuento porcentual.
15. El sistema copia el código de cupón al portapapeles del dispositivo.
16. El usuario observa el beneficio de recuperación con menor opacidad y el estado "BLOQUEADO" junto al nivel mínimo requerido.
17. El usuario entiende que deberá alcanzar el nivel requerido para acceder a ese beneficio de recuperación.
18. El usuario presiona "ACTIVAR OFERTA" en el beneficio del aliado de alimentación para activar la suscripción a precio base.

**Flujos Alternativos:**

- **[FA-1]** Si el usuario intenta interactuar con un beneficio bloqueado por nivel insuficiente, el botón "BLOQUEADO" no ejecuta ninguna acción y el sistema muestra el nivel requerido como información.
- **[FA-2]** Si un beneficio con fecha de vencimiento expiró mientras el usuario estaba en la pantalla, el sistema actualiza el estado de la tarjeta a "EXPIRADO" y deshabilita su botón de acción.

---

*Documento generado en base al código fuente en `silverback/src/app/` — versión 3.1, mayo 2026.*

---

---

# ANEXO — CAMPOS PENDIENTES POR CU

*Esta sección lista los campos que faltan agregar a cada CU para cumplir el formato UAI 10.5.3. Copiá cada bloque en el CU correspondiente.*

**Leyenda:**
- **Actores Primarios (10.5.3.9):** actores que interactúan directamente con el sistema en el CU.
- **Actores Secundarios (10.5.3.10):** actores que participan indirectamente o son necesarios en algún punto.
- **Evento Disparador (10.5.3.10.1):** el evento que da inicio al caso de uso.
- **Post Condición (10.5.3.8):** estado del sistema al finalizar el CU exitosamente. Solo se incluye si aporta valor.
- **Extensiones (10.5.3.11):** aclaraciones o reglas de negocio que complementan el escenario. Solo se incluye si aplica.

---

## CU-001-001 — Registrar Datos Biométricos Iniciales

**Actores Primarios:** Miembro

**Actores Secundarios:** Sistema SilverBack

**Evento Disparador:** El usuario abre la aplicación por primera vez y el sistema lo redirige automáticamente a la pantalla de Calibración Biométrica.

**Post Condición:** Los datos biométricos del usuario quedan almacenados y el sistema genera la línea base fisiológica inicial.

---

## CU-001-002 — Seleccionar Arquetipo de Entrenamiento

**Actores Primarios:** Miembro

**Actores Secundarios:** Sistema SilverBack

**Evento Disparador:** El usuario completó el registro biométrico (CU-001-001) y el sistema lo redirige a la pantalla de selección de arquetipo.

**Post Condición:** El arquetipo elegido queda registrado en el perfil del usuario y el multiplicador CER correspondiente queda configurado.

---

## CU-001-003 — Buscar Manadas Disponibles

**Actores Primarios:** Miembro

**Actores Secundarios:** Sistema SilverBack

**Evento Disparador:** El usuario completó la selección de arquetipo (CU-001-002) y el sistema lo redirige al Radar de Manadas.

---

## CU-001-004 — Unirse a una Manada

**Actores Primarios:** Miembro

**Actores Secundarios:** Sistema SilverBack

**Evento Disparador:** El usuario identificó el clan de destino en el Radar de Manadas (CU-001-003) y presiona el botón "UNIRSE" en la tarjeta del clan seleccionado.

**Post Condición:** El usuario queda registrado como miembro del clan con rol RECLUTA, el onboarding queda marcado como completado y el contador de miembros del clan se incrementa en una unidad.

---

## CU-002-001 — Visualizar el Panel del Santuario

**Actores Primarios:** Miembro

**Actores Secundarios:** Sistema SilverBack

**Evento Disparador:** El usuario hace clic en el ítem "Santuario" del menú de navegación superior, o es redirigido automáticamente al completar el flujo de incorporación.

---

## CU-002-002 — Consultar Desafíos en La Forja

**Actores Primarios:** Miembro

**Actores Secundarios:** Líder de Clan (Silverback), Sistema SilverBack

**Evento Disparador:** El usuario accede a la sección "Forja" desde la navegación interna del Santuario o desde la Topbar.

---

## CU-002-003 — Aceptar un Desafío Semanal

**Actores Primarios:** Miembro

**Actores Secundarios:** Sistema SilverBack

**Evento Disparador:** El usuario visualiza el listado de desafíos activos (CU-002-002) y presiona el botón "ACEPTAR DESAFÍO" en una tarjeta habilitada.

**Post Condición:** El compromiso del miembro queda registrado y vinculado al seguimiento del desafío. El puntaje de poder del clan se actualiza reflejando el nuevo compromiso.

---

## CU-002-004 — Comunicarse en la Sala de Tácticas

**Actores Primarios:** Miembro

**Actores Secundarios:** Líder de Clan (Silverback), Sistema SilverBack

**Evento Disparador:** El usuario hace clic en el botón "CHAT" en el Santuario o selecciona el ítem "Sala de Tácticas" en la barra lateral de navegación.

**Post Condición:** El mensaje enviado queda publicado en el canal del clan y es visible para todos los miembros activos.

---

## CU-002-005 — Asignar Rol a un Miembro del Clan

**Actores Primarios:** Líder de Clan (Silverback)

**Actores Secundarios:** Sistema SilverBack

**Evento Disparador:** El Líder accede al "Panel de Gestión Táctica" y selecciona un nuevo rol para un miembro en el selector de rol (dropdown).

**Post Condición:** El rol del miembro queda actualizado en el sistema con efecto inmediato y sin requerir confirmación adicional.

**Extensiones:** Solo el miembro con rol SILVERBACK puede modificar roles de otros miembros. Un clan puede tener un único SILVERBACK activo; el sistema bloquea la asignación de ese rol si ya está ocupado.

---

## CU-002-006 — Expulsar a un Miembro del Clan

**Actores Primarios:** Líder de Clan (Silverback)

**Actores Secundarios:** Sistema SilverBack

**Evento Disparador:** El Líder presiona el botón "EXPULSAR" en la fila de un miembro dentro del Panel de Gestión Táctica.

**Post Condición:** El miembro queda eliminado del clan, su acceso a todas las funcionalidades colectivas es revocado y el contador de capacidad del clan se decrementa en una unidad.

**Extensiones:** La expulsión es irreversible; el sistema no ofrece mecanismo de reintegración desde esta pantalla. Cada expulsión queda registrada en el historial de administración del clan con marca de tiempo y el nombre del Líder responsable.

---

## CU-003-001 — Consultar el Estado de la Guerra Global

**Actores Primarios:** Miembro

**Actores Secundarios:** Sistema SilverBack

**Evento Disparador:** El usuario hace clic en el ítem "Arena" del menú de navegación superior.

---

## CU-003-002 — Registrar un Entrenamiento

**Actores Primarios:** Miembro

**Actores Secundarios:** Sistema SilverBack

**Evento Disparador:** El usuario presiona el botón "REGISTRAR ENTRENAMIENTO" en la pantalla de Guerra Global.

**Post Condición:** El entrenamiento queda registrado, el puntaje CER calculado es acreditado al perfil del miembro y los puntos se suman al total de la Guerra Global del clan.

---

## CU-003-003 — Calcular el Puntaje CER

**Actores Primarios:** Miembro

**Actores Secundarios:** Sistema SilverBack

**Evento Disparador:** El usuario presiona el botón "CALCULAR CER" en la pantalla de registro de entrenamiento.

**Post Condición:** Si el usuario presiona "CONFIRMAR", el entrenamiento queda registrado con el puntaje CER calculado. Si presiona "CERRAR" o la X, no se registra ningún dato.

**Extensiones:** El modal "ALGORITMO CER" es una pantalla de previsualización en tiempo real. El registro definitivo del entrenamiento solo ocurre al presionar "CONFIRMAR"; cualquier cierre del modal sin confirmar descarta el cálculo sin efecto sobre el perfil ni la Guerra Global.

---

## CU-003-004 — Consultar el Historial de Batallas

**Actores Primarios:** Miembro

**Actores Secundarios:** Sistema SilverBack

**Evento Disparador:** El usuario selecciona el ítem "Historial" en la barra lateral de navegación.

---

## CU-004-001 — Visualizar Progreso de Evolución

**Actores Primarios:** Miembro

**Actores Secundarios:** Sistema SilverBack

**Evento Disparador:** El usuario hace clic en el ítem "Bóveda/Evolución" del menú de navegación superior, o accede desde el botón "RENDIMIENTO" en el Dashboard de Rendimiento Personal.

---

## CU-004-002 — Mejorar Nodo del Árbol de Habilidades

**Actores Primarios:** Miembro

**Actores Secundarios:** Líder de Clan (Silverback), Sistema SilverBack

**Evento Disparador:** El usuario selecciona un nodo activo en el diagrama del Árbol de Habilidades y presiona el botón "MEJORAR NODO".

**Post Condición:** El nodo avanza al siguiente nivel, el saldo de Puntos de Clan se actualiza con el descuento correspondiente y el historial de inversiones registra la mejora realizada.

**Extensiones:** Solo pueden mejorarse nodos con estado desbloqueado (borde naranja). Los nodos bloqueados requieren desbloquear el nodo prerrequisito antes de poder invertir en ellos.

---

## CU-004-003 — Reclamar Recompensa de la Bóveda

**Actores Primarios:** Miembro

**Actores Secundarios:** Sistema SilverBack

**Evento Disparador:** El usuario accede a la pantalla "BÓVEDA" y presiona el botón "RECLAMAR" o "RECLAMAR AHORA" en una tarjeta de cofre con estado "LISTO".

**Post Condición:** Las recompensas del cofre quedan acreditadas en el inventario del miembro y el cofre pasa al estado reclamado.

---

## CU-004-004 — Adquirir Ítem en el Marketplace

**Actores Primarios:** Miembro

**Actores Secundarios:** Sistema SilverBack

**Evento Disparador:** El usuario presiona el botón "COMPRAR" en la tarjeta de un ítem del Marketplace y confirma la transacción en el modal de confirmación.

**Post Condición:** El ítem queda registrado en el inventario del usuario y el saldo de SB se actualiza descontando el precio del ítem adquirido.

**Extensiones:** Los ítems del Marketplace son exclusivamente cosméticos; su adquisición no modifica el rendimiento del usuario en la Arena ni el puntaje CER. Los SilverBack Coins (SB) son moneda virtual interna sin valor monetario externo.

---

## CU-005-001 — Consultar Dashboard de Rendimiento Personal

**Actores Primarios:** Miembro

**Actores Secundarios:** Sistema SilverBack

**Evento Disparador:** El usuario hace clic en el ítem "Perfil" del menú de navegación superior, o presiona el botón "RENDIMIENTO" en la Cámara de Evolución.

---

## CU-005-002 — Consultar Racha de Entrenamiento

**Actores Primarios:** Miembro

**Actores Secundarios:** Sistema SilverBack

**Evento Disparador:** El usuario hace clic en el botón de racha activa en el Santuario, o selecciona el ítem "Racha" en la barra lateral de navegación.

---

## CU-005-003 — Salvar Racha con Puntos de Clan

**Actores Primarios:** Miembro

**Actores Secundarios:** Sistema SilverBack

**Evento Disparador:** El usuario presiona el botón "SALVAR RACHA" en el Termómetro de Racha mientras el banner de advertencia "RACHA A PUNTO DE PERDERSE" está activo.

**Post Condición:** La racha del usuario queda marcada como mantenida para el día en curso. El saldo de Puntos de Clan se actualiza descontando el costo de rescate.

---

## CU-005-004 — Monitorear Estado de Fatiga Biométrica

**Actores Primarios:** Miembro

**Actores Secundarios:** Sistema SilverBack

**Evento Disparador:** El usuario selecciona el ítem "Fatiga" en la barra lateral de navegación.

---

## CU-005-005 — Consultar Vitrina de Trofeos

**Actores Primarios:** Miembro

**Actores Secundarios:** Sistema SilverBack

**Evento Disparador:** El usuario selecciona el ítem "Trofeos" en la barra lateral de navegación.

---

## CU-005-006 — Reclamar Beneficio de un Aliado Comercial

**Actores Primarios:** Miembro

**Actores Secundarios:** Sistema SilverBack, Aliado Comercial

**Evento Disparador:** El usuario selecciona el ítem "Beneficios" en la barra lateral de navegación y presiona una acción de reclamo ("DESBLOQUEAR CÓDIGO", "CANJEAR →", "COPIAR CUPÓN" o "ACTIVAR OFERTA") en la tarjeta de un beneficio disponible.

**Post Condición:** El beneficio queda activado o el código de descuento queda generado y disponible para su uso en la tienda del aliado.

**Extensiones:** Los beneficios con estado "BLOQUEADO" no ejecutan ninguna acción al presionar su botón; el sistema informa el nivel mínimo requerido. Los beneficios con estado "EXPIRADO" tampoco ejecutan acciones.

---

*Fin del anexo — campos pendientes de incorporar al cuerpo de cada CU.*
