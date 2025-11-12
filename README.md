# QuickNotes - Lightweight Note-Taking App

A simple, distraction-free note-taking application built with Next.js that supports brain dumps and structured ideas with local browser storage.

## Features

### Core Features
- **📝 Text Editor**: Clean, distraction-free writing environment with customizable font and size options
- **🧠 Dual Modes**: Toggle between "Brain Dump" (free-form writing) and "Idea" (structured thoughts) modes
- **💾 Local Storage**: All notes persist locally in your browser - no server required
- **📂 Collapsible Sidebar**: Easy access to all your saved notes with preview snippets
- **➕ Quick Creation**: One-click new note creation with the plus button
- **⏲️ 15-Minute Timer**: Optional time-boxed writing sessions with visual bounce notification
- **📋 One-Click Copy**: Instantly copy your note content to clipboard with visual confirmation

### Additional Features
- **Auto-save**: Notes automatically save as you type
- **Smart Titles**: Notes automatically generate titles from the first line of content
- **Date Organization**: Notes display creation timestamps (Today, Yesterday, or full date)
- **Visual Type Indicators**: Brain dump (brain icon) and Idea (lightbulb icon) badges
- **Responsive Design**: Clean, modern interface that works on all screen sizes

## Getting Started

### Prerequisites
- Node.js 18+ installed on your machine
- npm or yarn package manager

### Installation

1. Clone or download this project to your local machine

2. Navigate to the project directory:
```bash
cd quicknotes-app
```

3. Install dependencies:
```bash
npm install
# or
yarn install
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## Usage Guide

### Writing Notes
1. Start typing immediately in the main editor area
2. Choose between "Brain Dump" or "Idea" mode using the toggle buttons
3. Select your preferred font (Sans Serif, Serif, or Monospace)
4. Adjust text size (Small, Medium, Large, or Extra Large)

### Managing Notes
- **Create New**: Click the blue plus (+) button in the top-right corner
- **Switch Notes**: Click on any note in the sidebar to load it
- **Delete Notes**: Click the X button on any note in the sidebar
- **View History**: Toggle the sidebar with the menu button (☰)

### Timer Feature
- Click the clock icon to start a 15-minute writing session
- Timer counts down in MM:SS format
- When time expires, the timer bounces to notify you
- Click again to stop the timer at any time

### Copying Content
- Click the copy icon to copy the entire note to your clipboard
- A green checkmark confirms successful copying
- "Copied!" message appears briefly

## Data Storage

All notes are stored locally in your browser's localStorage. This means:
- ✅ Your notes are private and never leave your device
- ✅ No account or login required
- ✅ Works offline
- ✅ Zero server costs
- ⚠️ Notes are tied to your specific browser
- ⚠️ Clearing browser data will delete your notes
- ⚠️ Consider backing up important notes externally

### Note Data Structure
Each note stores:
- Unique ID
- Content text
- Entry type (brain dump or idea)
- Selected font family
- Selected font size
- Creation timestamp
- Auto-generated title

## Keyboard Shortcuts

The app currently relies on standard browser shortcuts:
- `Ctrl/Cmd + A`: Select all text
- `Ctrl/Cmd + C`: Copy selected text
- `Ctrl/Cmd + V`: Paste text
- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Y`: Redo

## Technical Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Storage**: Browser localStorage
- **State Management**: React Hooks (useState, useEffect, useRef)

## Browser Compatibility

Works on all modern browsers that support:
- ES6+ JavaScript
- localStorage API
- CSS Grid and Flexbox
- Clipboard API

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Customization

You can easily customize the app by modifying:
- Font options in the `FONTS` array
- Font size options in the `FONT_SIZES` array
- Timer duration (default: 900 seconds / 15 minutes)
- Color scheme via Tailwind classes
- Sidebar width and animation duration

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## Support

For questions or issues, please create an issue in the project repository.
