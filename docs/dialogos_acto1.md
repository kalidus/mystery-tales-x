# Dialogos Acto 1

Documento de dialogos base para integrar en el sistema conversacional del juego.
Tono: misterio + comedia sarcastica.

## Convenciones

- `XAVIER`: linea del protagonista.
- `NPC_*`: linea de NPC.
- `SYS`: feedback del sistema/juego.
- Variables sugeridas: `{playerName}`, `{itemName}`.

## Room 1 - Muelle

## Hotspot: Cartel roto

### Primera interaccion

- `XAVIER`: "Bienve... idos... Isla B... uma. Cuando un cartel se desintegra asi, o hay humedad, o hay presupuesto publico."
- `XAVIER`: "Estoy apostando por las dos."

### Repeticion

- `XAVIER`: "Sigue sin mejorar. Igual espera una restauracion patrimonial fantasma."

## Hotspot: Charco de ectoplasma

### Sin frasco vacio

- `XAVIER`: "Ectoplasma fresco. Verde neon. Huele a bateria vieja y tragedia burocratica."
- `XAVIER`: "Necesito algo para recogerlo. Y preferiblemente que no sea mi sombrero."

### Con frasco vacio

- `SYS`: "Usas el frasco vacio en el charco."
- `SYS`: "Obtienes: Frasco con ectoplasma."
- `XAVIER`: "Perfecto. Nada dice 'noche productiva' como embotellar sustancia de ultratumba."

### Ya recogido

- `XAVIER`: "Solo quedan restos. El charco ya no coopera."

## NPC: Guardian del Peaje

### Primer encuentro

- `NPC_GUARDIAN`: "Alto. Paso restringido por Ordenanza Espectral 13-B."
- `NPC_GUARDIAN`: "Para ingresar al pueblo debe presentar Formulario de Transito Interplanar, copia simple y tinta de calamar espectral."
- `XAVIER`: "Claro. Falto pedir tambien certificado de no estar maldito."
- `NPC_GUARDIAN`: "Se solicita en ventanilla dos. Cerrada desde 1847."

### Sin formulario

- `XAVIER`: "No tengo el formulario."
- `NPC_GUARDIAN`: "Sin formulario no hay fila. Sin fila no hay civilizacion."

### Con formulario, sin tinta

- `XAVIER`: "Tengo el formulario."
- `NPC_GUARDIAN`: "Vacio. Sin tinta espectral esto es papel con autoestima."

### Con formulario y tinta

- `NPC_GUARDIAN`: "Verificando sello... firma... dramatismo..."
- `NPC_GUARDIAN`: "En regla. Concedo acceso temporal al pueblo."
- `XAVIER`: "No llore, funcionario. Volvere por mas tramites."
- `SYS`: "Acceso al pueblo desbloqueado."

### Repeticion tras desbloqueo

- `NPC_GUARDIAN`: "Circule con cuidado. Si la gravedad cambia, adapte su caligrafia."

## Room 2 - Taberna "El Marinero Ahogado"

## NPC: Tabernero zombi

### Primer encuentro

- `NPC_TABERNERO`: "Bue... nas... no... ches..."
- `XAVIER`: "Aprecio el esfuerzo fonetico."
- `NPC_TABERNERO`: "Si... bus... cas... a Alis... tair... pre... gun... ta... por... la... tin... ta..."

### Preguntar por tinta espectral

- `XAVIER`: "Necesito tinta de calamar espectral para un tramite absurdamente real."
- `NPC_TABERNERO`: "Re... ce... ta... cor... ta... ecto... plas... ma... +... sa... de... ne... gra..."
- `NPC_TABERNERO`: "Agi... tar... en... fras... co... y... no... in... ha... lar."
- `XAVIER`: "Anotado: mezcla maldita, lejos de la nariz."

### Preguntar por Alistair

- `XAVIER`: "Busco al profesor Alistair Grimm."
- `NPC_TABERNERO`: "Vi... no... ha... ce... tres... ma... reas..."
- `NPC_TABERNERO`: "De... jo... una... no... ta... en... el... pue... blo..."
- `XAVIER`: "Perfecto. Mentor desaparecido, nota misteriosa. Mi martes promedio."

### Repeticion

- `NPC_TABERNERO`: "Si... la... lu... na... a... u... lla... no... sal... gas..."
- `XAVIER`: "Consejo inquietante. Lo tomo."

## Room 3 - Callejon Vudu

## Hotspot: Basura (frasco vacio)

### Primera interaccion

- `XAVIER`: "Tesoro urbano. Oxido, cuerda, y..."
- `SYS`: "Encuentras: Frasco de cristal vacio."
- `XAVIER`: "Un frasco. Mi dignidad baja, pero mi inventario sube."

### Repeticion

- `XAVIER`: "Nada mas util. Solo desechos y malas decisiones."

## Hotspot: Puerta de la tienda vudu (cerrada en Acto 1)

- `XAVIER`: "Cerrado. Tiene treinta amuletos y cero horario comercial."
- `XAVIER`: "Volvere cuando el guion me lo permita."

## Linea de cierre Acto 1

- `SYS`: "Has superado el peaje espectral."
- `XAVIER`: "Bien. Hora de entrar al pueblo, encontrar a Alistair y cuestionar cada cosa peluda que vea."
