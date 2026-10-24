# Blockfall for Nintendo Switch 2 (HBLauncher GPU app)

A Tetris-based falling-block puzzle game built as a GPU-compute homebrew app for
[HBLauncherNS2](https://github.com/CostelaCNX/HBLauncherNS2). All game logic
and rendering run as GLSL compute/fragment shaders over a shared storage
buffer — there is no CPU-side game code.

Features: 7-bag piece randomizer, hold, ghost piece, lock delay, soft/hard
drop, line-clear flash, and an increasing-speed level system.

## Requirements

- [HBLauncherNS2](https://github.com/CostelaCNX/HBLauncherNS2) set up and able
  to reach a qualified Nintendo Switch 2 / SmileBASIC 4.4.9 session. This repo
  only contains the app itself; HBLauncherNS2 is the runtime that loads and
  executes it on console.
- Node.js 22+
- Python 3 with Pillow
- `glslangValidator` and `spirv-val` (prebuilt Windows copies are vendored
  under `tools/`; on other platforms install `glslang-tools`/`spirv-tools`
  from your package manager, or set `GLSLANG` / `SPIRV_VAL` to their paths)

## Build

```sh
node build.cjs
```

This rasterizes the text/icon assets, installs the shared shader headers
under `shaders/`, and compiles+validates `app.vert.spv`, `app.frag.spv` and
`app.comp.spv`.

## Install

Copy this folder into HBLauncherNS2's `apps/` directory (e.g. `apps/blockfall/`),
then refresh the app catalog from the HBLauncher menu on console.

## Controls

| Button | Action |
| --- | --- |
| Left / Right | Move |
| Up / A | Rotate clockwise |
| B | Rotate counter-clockwise |
| Down (hold) | Soft drop |
| Y | Hard drop |
| X | Hold piece |
| + / - | Return to HBLauncher |
| A (on Game Over) | Play again |

## Project layout

```
include/        Shared GPU-app headers vendored from HBLauncherNS2's SDK
shaders/         app.vert / app.comp / app.frag, plus this app's own shapes.glsl
assets.py        Rasterizes the text atlas, digit glyphs and icon
build.cjs        Build entry point
app.json         App manifest
```

## License

The game code and assets in this repository are original. `assets/DejaVuSans.ttf`
is distributed under the Bitstream Vera / Arev license (see the
[DejaVu Fonts project](https://dejavu-fonts.github.io/)). `tools/` contains
unmodified upstream builds of Khronos `glslangValidator` and `spirv-val`
(Apache 2.0 / MIT); they are not tracked in this repository — fetch your own
copies from [KhronosGroup/glslang](https://github.com/KhronosGroup/glslang)
and [KhronosGroup/SPIRV-Tools](https://github.com/KhronosGroup/SPIRV-Tools).
