# 🫧 Liquid Glass — Framer WebGL Shader

<p align="center">
  <strong>A living liquid-glass atmosphere for Framer.</strong><br />
  Procedural WebGL • Cursor Refraction • Liquid Distortion • Dynamic Light
</p>

<p align="center">
  <a href="https://liquidglassshaderbg.framer.website/">Live Demo</a> •
  <a href="https://www.framer.com/marketplace/components/liquid-glass-shader/">Framer Marketplace</a> •
  <a href="https://karimsaif.lemonsqueezy.com/checkout/buy/815988e9-5933-411a-84fb-f5648a190d8b">Get the Component</a>
</p>

---

## ✨ What is Liquid Glass?

**Liquid Glass** is a premium procedural WebGL background component built for Framer. It transforms an ordinary section into a dynamic, fluid visual surface with organic distortion, cursor-driven refraction, animated lighting, ripples, blur, and chromatic aberration.

Everything is generated in real time — no images, textures, or external shader libraries are required.

> **The idea:** make glass feel less like a static effect and more like a living material.

## 🚀 Live Links

- 🌊 **Live Demo:** https://liquidglassshaderbg.framer.website/
- 🧩 **Framer Marketplace:** https://www.framer.com/marketplace/components/liquid-glass-shader/
- 🛒 **Get Liquid Glass:** https://karimsaif.lemonsqueezy.com/checkout/buy/815988e9-5933-411a-84fb-f5648a190d8b
- 💻 **GitHub:** https://github.com/karimsaif0/Liquid-Glass-Shader-Background
- 𝕏 **X:** https://x.com/karimsaif0
- ✉️ **Support:** karimsaif010@gmail.com

## 🎨 Features

- Procedural WebGL rendering
- Organic liquid-glass distortion
- Cursor lens / refraction interaction
- Cursor enable / disable control
- Dynamic ripple distortion
- Animated procedural light
- Blur and diffusion controls
- Chromatic aberration
- Six visual presets: Aurora, Ocean, Violet, Sunset, Emerald, Monochrome
- Adjustable refraction and distortion
- Adjustable light intensity
- Adjustable animation speed
- Responsive canvas rendering
- Device-pixel-ratio optimization
- Viewport-aware animation with IntersectionObserver
- Reduced-motion support
- WebGL context loss / restoration handling
- Static-renderer support for Framer
- Automatic observer and WebGL cleanup
- No external dependencies
- No visible text inside the component

## 🎛️ Framer Controls

| Control | Description |
| --- | --- |
| **Refraction** | Controls how strongly the glass bends the visual field around the cursor. |
| **Glass Distortion** | Controls the intensity of organic surface deformation. |
| **Light Intensity** | Controls reflections, highlights, and optical glow. |
| **Ripple Radius** | Controls the size of the interactive cursor area. |
| **Cursor Influence** | Controls how strongly pointer movement affects the surface. |
| **Cursor** | Enables or disables cursor interaction. |
| **Blur** | Controls softness and diffusion. |
| **Chromatic Aberration** | Controls RGB separation for an optical-glass look. |
| **Speed** | Controls procedural animation speed. |
| **Color Preset** | Switches between Aurora, Ocean, Violet, Sunset, Emerald, and Monochrome. |

## 💡 Great For

Liquid Glass is especially effective for:

- Hero sections
- Landing pages
- Creative portfolios
- Design studios
- SaaS and AI products
- Technology websites
- Fashion and luxury experiences
- Digital art
- Experimental interfaces
- Interactive storytelling
- Full-screen visual backgrounds

## 🧑‍💻 Usage

The main source file is:

`LiquidGlass.tsx`

The component is designed for the **Framer Code Component** environment and uses Framer's `addPropertyControls` and `useIsStaticRenderer` APIs.

Copy the component into a Framer code component and configure the controls from the property panel.

## ⚡ Performance

Liquid Glass is built with performance-conscious rendering patterns:

- Animation stops when the component leaves the viewport.
- Rendering uses a capped device pixel ratio.
- ResizeObserver updates the canvas only when its container changes.
- Reduced-motion preferences are respected.
- WebGL resources are cleaned up when the component unmounts.
- WebGL context restoration is handled automatically.
- Static rendering avoids starting an animation loop.

For best performance, avoid stacking many large WebGL surfaces on the same page.

## 🛠️ Technical Stack

- React
- TypeScript
- Framer Code Components
- WebGL
- GLSL
- Procedural noise / FBM
- IntersectionObserver
- ResizeObserver
- `prefers-reduced-motion`

## 📁 Repository

```text
Liquid-Glass-Shader-Background/
├── LiquidGlass.tsx
└── README.md
```

## 🤝 Support

Found a bug, need help with setup, or have an idea for an improvement?

**Email:** karimsaif010@gmail.com  
**X:** https://x.com/karimsaif0

## 👨‍🎨 Creator

**Karim Saif**  
Product Designer • UI/UX Designer • Creative Coding

I build interactive Framer experiences, WebGL components, and experimental interfaces that bring motion and depth to the web.

**Made with 💛 by Karim Saif**

---

<p align="center">
  <strong>Make your interface feel alive.</strong><br />
  <a href="https://www.framer.com/marketplace/components/liquid-glass-shader/">Explore Liquid Glass on Framer Marketplace →</a>
</p>
