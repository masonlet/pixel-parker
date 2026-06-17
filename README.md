# Pixel Parker

A top-down vehicle parking puzzle game built with TypeScript, Vite, and a custom Web Engine.

**Play it: [masonletoile.ca/pixel-parker](https://masonletoile.ca/pixel-parker/)**

## Tech Stack
<p align="left">
  <img height="35" src="https://img.shields.io/badge/HTML5-%23E34F26?logo=html5&logoColor=white&style=for-the-badge"/>
  <img height="35" src="https://img.shields.io/badge/CSS3-%231572B6?logo=css3&logoColor=white&style=for-the-badge"/>
  <img height="35" src="https://img.shields.io/badge/TypeScript-%23007ACC?logo=typescript&logoColor=white&style=for-the-badge"/>
  <img height="35" src="https://img.shields.io/badge/Node.js-%23339933?logo=node.js&logoColor=white&style=for-the-badge"/>
  <img height="35" src="https://img.shields.io/badge/Vite-%2300C0FF?logo=vite&logoColor=white&style=for-the-badge"/>
</p>

## Controls

| Key | Action |
| --- | ------ |
| W / S | Throttle / Reverse / Brake |
| Escape | Pause |
| 1 | Complete level ( Temporary, debug control ) |
| 2 | Cycle vehicle |
| 3 | Toggle debug mode |

## Deployment & Configuration

### Prerequisites

- npm
- Node.js 18+ (for local development and building only)

### 1. Clone the Repository

```bash
# Clone Pixel Parker
git clone https://github.com/masonlet/pixel-parker.git
cd pixel-parker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run Locally

```bash
npm run dev     # Local development http://localhost:5173
npm run build   # Vite build
npm run preview # Preview production Vite build http://localhost:4173
```
### 4. Deployment

The production build outputs static files to the `dist/` directory which can be hosted on any static hosting provider. Node.js is **not required** to run the deployed site.

## License
MIT License - see [LICENSE](./LICENSE) for details.
