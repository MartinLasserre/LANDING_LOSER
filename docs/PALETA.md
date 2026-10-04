# Paleta LUCKY LOSERS — rojos de la foto en vivo

Extraída de la foto del show (luz roja, long exposure, sombras vino). Los valores base salen del análisis de píxeles; el neón y el glow son ajustes a ojo de las estelas de luz.

| Token | Hex | Origen en la foto | Uso sugerido |
|---|---|---|---|
| `--red-ink` | `#1A0303` | Sombras profundas, techo y bordes | Fondo base, viñeta |
| `--red-oxblood` | `#480000` | Color rojo más frecuente (paredes, sombras) | Fondos de secciones, humo oscuro |
| `--red-wine` | `#6B0A0A` | Madera y alfombra en penumbra | Superficies, bordes, líneas |
| `--red-blood` | `#A80018` | Alfombra y ropa iluminada | Títulos, links, hover |
| `--red-flare` | `#D80018` | Zonas de luz directa | Acento fuerte, botón |
| `--red-neon` | `#FF2A1A` | Estela de luz sobre la guitarra | Glitch, destellos, foco |
| `--red-glow` | `#FF7A66` | Bordes calientes de la estela | Highlights, grano claro |
| `--bone` | `#E8E4DC` | Remera y luz blanca | Texto principal |

## CSS

```css
:root {
  --red-ink: #1A0303;
  --red-oxblood: #480000;
  --red-wine: #6B0A0A;
  --red-blood: #A80018;
  --red-flare: #D80018;
  --red-neon: #FF2A1A;
  --red-glow: #FF7A66;
  --bone: #E8E4DC;
}
```

## Contraste sobre `--red-ink` (aprox.)

- `--bone`: muy alto, apto para texto.
- `--red-glow` y `--red-neon`: aptos para texto grande y acentos.
- `--red-blood`: solo títulos grandes. Para texto chico usar `--red-glow`.
- `--red-oxblood` y `--red-wine`: no usar para texto, solo superficies.

## Degradé del fondo (humo)

`--red-ink` → `--red-oxblood` → `--red-blood`, con picos de `--red-neon` y un toque de `--red-glow`.
