# Quests Acto 1 (Plantilla estructurada)

Este documento define una estructura tipo JSON para implementar la progresion del Acto 1.

```json
{
  "actId": "acto_1",
  "name": "Llegada a Isla Bruma",
  "startRoom": "muelle",
  "quests": [
    {
      "id": "q1_llegada_muelle",
      "title": "Desembarco nocturno",
      "description": "Inspecciona el muelle y entiende por que no puedes entrar al pueblo.",
      "status": "active",
      "objectives": [
        {
          "id": "q1_obj_cartel",
          "type": "interact",
          "target": "hotspot_cartel_muelle",
          "required": 1,
          "progress": 0
        },
        {
          "id": "q1_obj_guardian",
          "type": "talk",
          "target": "npc_guardian_peaje",
          "required": 1,
          "progress": 0
        }
      ],
      "onComplete": {
        "setFlags": ["knows_peaje_requirements"],
        "unlockQuests": ["q2_conseguir_frasco"]
      }
    },
    {
      "id": "q2_conseguir_frasco",
      "title": "Contenedor improvisado",
      "description": "Encuentra algo donde guardar ectoplasma.",
      "status": "locked",
      "unlockConditionFlags": ["knows_peaje_requirements"],
      "objectives": [
        {
          "id": "q2_obj_frasco",
          "type": "pickup",
          "target": "item_frasco_vacio",
          "required": 1,
          "progress": 0
        }
      ],
      "rewards": {
        "items": ["item_frasco_vacio"]
      },
      "onComplete": {
        "unlockQuests": ["q3_recolectar_ectoplasma"]
      }
    },
    {
      "id": "q3_recolectar_ectoplasma",
      "title": "Muestra paranormal",
      "description": "Usa el frasco vacio en el charco de ectoplasma del muelle.",
      "status": "locked",
      "unlockConditionQuests": ["q2_conseguir_frasco"],
      "objectives": [
        {
          "id": "q3_obj_usar_frasco",
          "type": "use_item_on_hotspot",
          "item": "item_frasco_vacio",
          "target": "hotspot_charco_ectoplasma",
          "required": 1,
          "progress": 0
        }
      ],
      "rewards": {
        "removeItems": ["item_frasco_vacio"],
        "addItems": ["item_frasco_ectoplasma"]
      },
      "onComplete": {
        "setFlags": ["has_ectoplasma_sample"],
        "unlockQuests": ["q4_obtener_tinta_espectral"]
      }
    },
    {
      "id": "q4_obtener_tinta_espectral",
      "title": "Tinta de calamar espectral",
      "description": "Consulta al tabernero y prepara la tinta para validar el formulario del peaje.",
      "status": "locked",
      "unlockConditionFlags": ["has_ectoplasma_sample"],
      "objectives": [
        {
          "id": "q4_obj_hablar_tabernero",
          "type": "talk",
          "target": "npc_tabernero",
          "required": 1,
          "progress": 0
        },
        {
          "id": "q4_obj_combinar_tinta",
          "type": "craft",
          "recipeId": "receta_tinta_calamar_espectral",
          "required": 1,
          "progress": 0
        }
      ],
      "rewards": {
        "items": ["item_tinta_calamar_espectral", "item_formulario_peaje"]
      },
      "onComplete": {
        "setFlags": ["has_signed_form"],
        "unlockQuests": ["q5_superar_peaje"]
      }
    },
    {
      "id": "q5_superar_peaje",
      "title": "Paso al pueblo",
      "description": "Entrega formulario y tinta al Guardian del Peaje para desbloquear la entrada al pueblo.",
      "status": "locked",
      "unlockConditionFlags": ["has_signed_form"],
      "objectives": [
        {
          "id": "q5_obj_entregar_form",
          "type": "give_items",
          "target": "npc_guardian_peaje",
          "items": ["item_formulario_peaje", "item_tinta_calamar_espectral"],
          "required": 1,
          "progress": 0
        }
      ],
      "onComplete": {
        "setFlags": ["peaje_desbloqueado", "acto1_completado"],
        "worldChanges": [
          {
            "type": "unlock_transition",
            "transitionId": "muelle_to_pueblo"
          }
        ],
        "triggerDialogue": "dlg_acto1_cierre",
        "unlockAct": "acto_2"
      }
    }
  ],
  "items": [
    {
      "id": "item_frasco_vacio",
      "name": "Frasco vacio",
      "description": "Cristal opaco, tapa oxidada, potencial narrativo enorme."
    },
    {
      "id": "item_frasco_ectoplasma",
      "name": "Frasco con ectoplasma",
      "description": "Sustancia verdosa, altamente inestable y ligeramente ofendida."
    },
    {
      "id": "item_tinta_calamar_espectral",
      "name": "Tinta de calamar espectral",
      "description": "Tinta apta para tramites de ultratumba."
    },
    {
      "id": "item_formulario_peaje",
      "name": "Formulario de transito interplanar",
      "description": "Tres paginas, siete sellos y cero alegria."
    }
  ],
  "recipes": [
    {
      "id": "receta_tinta_calamar_espectral",
      "name": "Tinta de calamar espectral",
      "ingredients": ["item_frasco_ectoplasma", "item_sal_negra"],
      "result": "item_tinta_calamar_espectral"
    }
  ],
  "flags": [
    "knows_peaje_requirements",
    "has_ectoplasma_sample",
    "has_signed_form",
    "peaje_desbloqueado",
    "acto1_completado"
  ]
}
```

## Notas de integracion

- Si aun no existe sistema de `craft`, reemplazar `q4_obj_combinar_tinta` por un intercambio en dialogo con el tabernero.
- Si no hay `give_items` directo, modelarlo como uso de item sobre NPC.
- `unlock_transition` puede mapearse a una flag que habilite hotspot de salida al pueblo.
