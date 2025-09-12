# WebTeX Preview

A VS Code extension that provides live LaTeX preview using the WebTeX library.

## Features

- **Live Preview**: Real-time LaTeX compilation and preview as you type
- **WebTeX Integration**: Uses the modern WebTeX library for high-quality LaTeX rendering
- **Side-by-Side View**: Open preview alongside your LaTeX editor
- **Automatic Updates**: Preview updates as you type or save
- **VS Code Integration**: Seamlessly integrates with VS Code's interface and themes

## Usage

### Opening a Preview

1. **From Command Palette**: 
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type "WebTeX" and select:
     - "WebTeX: Open LaTeX Preview" - Opens in current column
     - "WebTeX: Open LaTeX Preview to the Side" - Opens side-by-side

2. **Using Keyboard Shortcut**:
   - `Ctrl+Shift+V` (or `Cmd+Shift+V` on Mac) when editing a `.tex` file

3. **From Context Menu**:
   - Right-click on a `.tex` file in the Explorer
   - Select "Open LaTeX Preview"

4. **From Editor Title**:
   - Click the preview button in the editor title bar when editing a `.tex` file

### Live Updates

The preview automatically updates when you:
- Save your LaTeX file (`Ctrl+S` / `Cmd+S`)
- Make changes to any `.tex` file being watched

## Supported LaTeX Features (simplified)

- Document classes: `article`, `book`, `report`
- Text formatting: bold, italic, fonts, sizes
- Lists: itemize, enumerate, description
- Tables and alignments
- Cross-references and labels
- Custom macro definitions

## Requirements

- VS Code 1.103.0 or higher
- Node.js 22.x or higher (for development)

## Extension Settings

This extension doesn't currently contribute any VS Code settings.

## Known Issues

- Large documents may take a moment to render initially
- Some advanced LaTeX packages may not be fully supported
- Preview styling follows VS Code theme but uses LaTeX typography

## Development

### Setup

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to compile TypeScript
4. Press `F5` to run the extension in a new Extension Development Host window

### Building

```bash
npm run compile
```

### Testing

Open a `.tex` file and use the preview commands to test functionality. Unit tests cover core editor-to-preview data flow.

## Release Notes

### 0.0.1

Initial release with basic LaTeX preview functionality:
- Live preview with WebTeX integration
- File watching for automatic updates
- Side-by-side preview support
- Context menu and keyboard shortcuts

## License

This extension is licensed under the MIT License.

## Credits

This extension uses the [WebTeX](https://github.com/tani/webtex) library for LaTeX compilation and rendering.
