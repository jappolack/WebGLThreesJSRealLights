# Three.js Real Lights Demo

A small browser-based Three.js scene for experimenting with real-time lighting. The scene includes a detailed house, textured ground and roof, trees, shadows, and independently controlled lights with visible helper markers.

## Run

The project uses native JavaScript modules and loads Three.js from unpkg, so serve the folder over HTTP and keep an internet connection available:

```bash
python3 -m http.server 8000
```

Open [http://localhost:8000/lightingDemo.html](http://localhost:8000/lightingDemo.html).

## Controls

| Key | Action |
| --- | --- |
| `D` | Set daytime |
| `S` | Set sunset |
| `N` | Set nighttime |
| `A` | Toggle automatic day/night cycle |
| `I` | Toggle ambient light |
| `H` | Toggle hemisphere light |
| `U` | Toggle sun light and stop the automatic cycle |
| `M` | Toggle moon light and stop the automatic cycle |
| `L` | Toggle house light and window glow |
| `P` | Toggle porch light |
| `F` | Toggle flashlight |
| `T` | Toggle TV light and screen glow |
| `0` | Toggle all lights |
| `1` | Show or hide all light helper markers |
| `2` | Set the sun color to orange |
| `3` | Set the sun color to red |
| `4` | Set the sun color to white |
| Arrow keys | Move the sun horizontally |

The helper markers are colored spheres: yellow for the sun, blue for the moon, white for the flashlight, orange for the porch light, and cyan for the TV light.