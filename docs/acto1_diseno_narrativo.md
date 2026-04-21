# Acto 1 - Diseno narrativo y jugable

## Objetivo del Acto 1

Presentar a Xavier, establecer el tono de misterio-comedia y cerrar un primer arco corto:
**entrar al pueblo superando al Guardian del Peaje**.

## Mapa inicial (3 rooms)

## Room 1: El Muelle (inicio)

- **Mood:** humedad, madera podrida, niebla, faroles con luz verdosa.
- **Elementos clave:**
  - Cartel roto: `Bienve idos a Isla B uma`.
  - Charco de ectoplasma.
  - Guardian Espectral bloqueando el paso.
- **Funcion narrativa:** primer contacto con el absurdo reglamentario de la isla.

## Room 2: Taberna “El Marinero Ahogado”

- **Mood:** bar decadente, cabezas marinas disecadas, olor a sal y formol.
- **NPC:** tabernero zombi amable.
- **Funcion narrativa:** exposicion dosificada de rumores, pista sobre tinta de calamar espectral.

## Room 3: Callejon de la Tienda Vudu

- **Mood:** claustrofobico, amuletos colgantes, velas casi apagadas.
- **Objeto clave:** frasco de cristal vacio (basura).
- **Funcion narrativa:** exploracion y primera cadena de inventario.

## Cadena de progreso base (quest loop)

1. Xavier llega al muelle.
2. Interactua con cartel y guardian.
3. Descubre que necesita formulario + tinta de calamar espectral.
4. Explora el callejon y consigue `frasco vacio`.
5. Usa frasco en charco y obtiene `ectoplasma`.
6. Habla en taberna para conseguir pista de preparacion de tinta.
7. Resuelve mini paso burocratico y desbloquea acceso al pueblo.

## Inventario minimo Acto 1

- `Frasco vacio`
- `Frasco con ectoplasma`
- `Formulario del peaje`
- `Tinta de calamar espectral` (resultado de combinacion o intercambio)

## Reglas de dialogo por personaje

## Xavier

- Sarcasmo corto, frases de detective cansado.
- Comentarios meta ocasionales si el jugador insiste en acciones absurdas.

## Guardian del Peaje

- Registro formal y pasivo-agresivo.
- Repite protocolos con variaciones comicas.

## Tabernero

- Habla lento y con pausas.
- Suelta informacion util camuflada entre anecdotas marinas.

## Pistas narrativas obligatorias del Acto 1

- Mencion del mentor Alistair en al menos 2 interacciones.
- Primer indicio de que el alcalde oculta algo.
- Confirmacion de que la isla “no figura” en mapas modernos.
- Referencia a la gravedad alterada como fenomeno creciente.

## Ganchos para Acto 2

- Documento sellado con insignia municipal encontrado tras superar el peaje.
- Nota de Alistair: `Si cruzaste, aun estas a tiempo de cerrar la costura`.
- Primer evento visual anomalo fuerte (objeto flotando al reves en plaza).

## Checklist de implementacion narrativa

- [ ] Dialogos de Xavier para cartel, charco y guardian.
- [ ] Dialogo condicional del guardian segun inventario.
- [ ] Dialogo del tabernero con pista de tinta.
- [ ] Texto de objeto para frasco vacio / frasco con ectoplasma.
- [ ] Evento de desbloqueo del peaje con feedback claro.
- [ ] Linea final del acto conectando con objetivo del Acto 2.
