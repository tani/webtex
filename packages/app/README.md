# WebTeX Live Preview App

Interactive web-based LaTeX to HTML5 converter with real-time preview.

## Features

- **Live Preview**: See your LaTeX rendered as HTML in real-time
- **Interactive Editor**: Syntax-aware LaTeX editor with line wrapping toggle
- **Example Templates**: Quick access to article, math, and table examples
- **HTML Export**: Download the compiled HTML output
- **Responsive Layout**: Resizable panels for optimal workflow
- **Status Tracking**: Real-time compilation status and editor statistics

## Development

### Prerequisites

This package is part of the WebTeX monorepo and requires the core WebTeX library to be built first.

From the repository root:

```bash
# Install dependencies
npm install

# Build the core library first
npm run build:core
```

### Running the Development Server

```bash
# Start the development server
npm run dev:app

# Or from the app package directory
cd packages/app
npm run dev
```

The development server will start on `http://localhost:3000` with hot module replacement enabled.

### Building for Production

```bash
# Build the app for production
npm run build:app

# Or from the app package directory
cd packages/app
npm run build
```

The built files will be output to `packages/app/dist/`.

### Scripts

- `npm run dev` - Start development server with HMR (syncs CSS first)
- `npm run build` - Build for production (syncs CSS first)
- `npm run preview` - Preview the production build
- `npm run sync-css` - Copy CSS files from core package to public directory
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run code linting
- `npm run format` - Format code with Biome

## Architecture

The app consists of three main files:

- **`index.html`** - Main HTML structure with editor and preview panels
- **`main.js`** - JavaScript application logic with WebTeX integration
- **`styles.css`** - CSS styling for the user interface

### Resource Handling

The app automatically syncs CSS files from the core WebTeX package:

- **Build Time**: CSS files are copied from `../core/dist/css/` to `public/css/`
- **Runtime**: Generated HTML references CSS files at `/css/article.css`
- **Development**: CSS files are re-synced on each dev/build command
- **Production**: CSS files are included in the built output

### Key Components

- **Editor Panel**: LaTeX source code editor with line numbers and statistics
- **Preview Panel**: Iframe displaying the rendered HTML output
- **Toolbar**: Quick actions for examples, download, and editor controls
- **Splitter**: Resizable divider between editor and preview panels

## Usage

1. **Enter LaTeX Code**: Type or paste LaTeX code into the left editor panel
2. **View Live Preview**: The right panel shows the rendered HTML in real-time
3. **Load Examples**: Use toolbar buttons to load pre-built examples
4. **Download HTML**: Export the compiled HTML using the download button
5. **Toggle Line Wrap**: Use the wrap button to toggle editor line wrapping

## Dependencies

- **webtex**: Core WebTeX library for LaTeX to HTML conversion
- **vite**: Development server and build tool
- **typescript**: Type checking (development)
- **biome**: Code linting and formatting (development)

## Browser Support

The app works in all modern browsers that support:
- ES6 modules
- CSS Grid
- Iframe sandbox attribute
- Local storage (for settings persistence)

## Contributing

This package is part of the WebTeX monorepo. Please refer to the main repository README for contribution guidelines.