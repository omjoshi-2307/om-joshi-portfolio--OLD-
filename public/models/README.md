# 3D Avatar Models Directory

This directory is intentionally empty until an approved avatar model is
provided. Do not create a placeholder file and do not add an unapproved model.

## Optional model

Place the approved model in this directory with this exact name:

```text
public/models/om-avatar.glb
```

## Model Requirements

* **Filename**: `om-avatar.glb`
* **Format**: Binary glTF (`.glb`)
* **Geometry**: Stylized bust / upper-torso mascot matching Om Joshi's illustrated identity:
  * Wavy dark hair
  * Dark rectangular glasses
  * Dark tech hoodie (`#151922` / `#1C212B`)
  * Electric pink / magenta details (`#FF4FA3`)
* **Triangles**: 12,000 – 25,000 tris
* **Textures**: Embedded PBR atlas (1024×1024 or 2048×2048)
* **Mesh Naming**: If head node or bone is named `Head`, `head`, or `neck`, the renderer will articulate independent head movement.
* **Target Size**: < 1.5MB – 2.5MB (< 800KB with Draco)

## Automatic Detection

The portfolio checks for `/models/om-avatar.glb` before loading Three.js:

* **Missing or unavailable:** The existing interactive 2D character renders
  immediately. A missing file is an expected configuration state, not a
  page-level error.
* **Present but invalid or failed to load:** The 3D canvas is replaced by the
  same 2D fallback through the avatar error boundary.
* **Present and valid:** The model renders with Three.js studio lighting,
  pink rim light, and pointer tracking.

The fallback is the production-safe default and must remain functional when
WebGL is unavailable, disabled, unsupported, or the model is removed.
