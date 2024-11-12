# 🌊 Furina 3D Model Viewer

![Furina](https://i.imgur.com/placeholder.jpg)
> An interactive WebGL-powered 3D model viewer featuring Furina from Genshin Impact

## ✨ Features

- **High Performance WebGL Rendering** using Three.js
- **Interactive Controls**
  - Orbit camera with mouse/touch controls
  - Zoom in/out functionality 
  - Pan view with right-click
  - Reset view with 'R' key
- **Dynamic Lighting System**
  - Ambient hemisphere lighting
  - Directional main light with shadows
  - Animated RGB point lights
- **Quality Settings**
  - Adjustable render quality (Low/Medium/High)
  - Customizable background color
  - Animation speed control
- **Optimized Performance**
  - Model caching system
  - Draco compression support
  - FPS monitoring
- **Responsive Design**
  - Adapts to all screen sizes
  - Smooth animations and transitions
  - Modern glass-morphism UI
- **Audio Integration**
  - Background music player
  - Audio caching system
  - Volume controls

## 🚀 Quick Start

1. Clone the repository
```bash
git clone https://github.com/yourusername/furina-3d-viewer.git
```
2. install dependencies
```bash
npm install
```
3. start the development server
```bash
node server.js
```
4. Open `http://localhost:3001` in your browser

## 🛠️ Tech Stack

- **Three.js** - 3D graphics library
- **Express** - Backend server
- **GSAP** - Animations
- **Socket.io** - Real-time communications
- **Stats.js** - Performance monitoring

## 📦 Project Structure
furina-3d-viewer/
├── public/
│ ├── index.html # Main HTML file
│ ├── script.js # Three.js viewer implementation
│ ├── styke.css # Styling
│ └── assets/ # 3D models, textures, audio
├── server.js # Express server
└── package.json # Project dependencies


## 🎮 Controls

- **Left Click + Drag**: Rotate camera
- **Right Click + Drag**: Pan view
- **Scroll**: Zoom in/out
- **R Key**: Reset camera position
- **Settings Panel**: Customize viewing experience

## ⚙️ Configuration

The viewer supports various configuration options through the settings panel:

- Background Color
- Animation Speed
- Render Quality
- Volume Control

## 🎵 Audio System

Features an integrated audio player with:
- Background music support
- Volume control
- Play/Pause functionality
- Audio caching for performance

## 🔧 Performance Optimization

The viewer implements several optimization techniques:
- Model caching
- Draco compression
- Quality presets
- Efficient render loop
- Asset preloading

## 📱 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Credits

- Furina character model and assets belong to HoYoverse
- Three.js community for various utilities and examples
- Contributors and maintainers

---

<p align="center">Made with ❤️ by @Dlcuy22</p>



