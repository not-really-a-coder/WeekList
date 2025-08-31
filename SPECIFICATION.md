# FlowDo Technical Specification

This document provides a technical overview of the FlowDo application, a modern weekly task manager. Its purpose is to help developers understand the project's architecture, code structure, and key implementation details.

## 1. Tech Stack

FlowDo is built on a modern, robust technology stack:

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [React](https://react.dev/)
- **UI Components**: [ShadCN/UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: React Hooks (`useState`, `useCallback`, `useEffect`) and local state.
- **Drag & Drop**: [React DnD](https://react-dnd.github.io/react-dnd/)
- **Date/Time Management**: [date-fns](https://date-fns.org/)
- **AI Functionality**: [Genkit](https://firebase.google.com/docs/genkit) with Google's Gemini models.
- **Icons**: [Lucide React](https://lucide.dev/)

## 2. Project Structure

The project follows a standard Next.js App Router structure.

```
.
├── src
│   ├── app
│   │   ├── (main)
│   │   │   ├── page.tsx         # Main application component and logic
│   │   │   └── layout.tsx       # Root layout for the main app
│   │   ├── print
│   │   │   ├── page.tsx         # Component for the printable view
│   │   │   └── layout.tsx       # Layout for the print view
│   │   ├── actions.ts         # Server Actions for data manipulation
│   │   └── globals.css        # Global styles and Tailwind CSS theme
│   │
│   ├── ai
│   │   ├── flows/             # Genkit AI flows
│   │   └── genkit.ts          # Genkit initialization and configuration
│   │
│   ├── components
│   │   ├── ui/                # ShadCN UI components
│   │   ├── Header.tsx         # App header with logo and actions
│   │   ├── TaskGrid.tsx       # Main grid for displaying tasks
│   │   ├── TaskRow.tsx        # Component for a single task row
│   │   └── ...                # Other reusable components
│   │
│   ├── hooks
│   │   ├── use-mobile.tsx     # Hook to detect mobile viewports
│   │   └── use-toast.ts       # Hook for displaying notifications
│   │
│   └── lib
│       ├── types.ts           # Core TypeScript types (Task, TaskStatus)
│       └── utils.ts           # Utility functions (e.g., `cn` for classnames)
│
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

## 3. Core Components & Logic

### `src/app/page.tsx`

This is the main entry point of the application. It acts as the primary state manager and orchestrator.

- **State Management**:
  - `tasks`: The main array holding all task objects. This is the single source of truth.
  - `currentDate`: Manages which week is currently displayed.
  - `selectedTaskId`: Tracks the currently focused task for keyboard navigation and context menus.
  - `showWeekends`: Toggles the visibility of Saturday and Sunday columns.
- **Data Persistence**:
  - Tasks are persisted to the browser's `localStorage` under the key `weeklist-tasks`.
  - The component hydrates the state from `localStorage` on initial load. If no data exists, it fetches sample tasks from `getTasks()` in `actions.ts`.
- **Event Handling**: Contains all the core handler functions (`handleAddTask`, `handleUpdateTask`, `handleSetTaskParent`, `handleMoveTask`, etc.) which are passed down as props to child components.
- **Keyboard Shortcuts**: An effect hook (`useEffect`) listens for global keydown events to implement hotkeys for navigation (`ArrowUp`/`ArrowDown`), reordering (`Ctrl+Up/Down`), indentation (`Tab`/`Shift+Tab`), and deletion (`Delete`).

### `src/components/TaskGrid.tsx`

This component is responsible for rendering the main weekly grid structure.

- **Layout**: Uses CSS Grid to create the calendar layout. The number of columns adapts based on the `showWeekends` prop.
- **Task Rendering**: It receives the list of `navigableTasks` for the current week and recursively renders them using the `renderTask` function. This function handles the nesting of child tasks visually.
- **Headers**: Renders the day-of-the-week headers and the "Task" header, which includes the "Add Task" button and view options dropdown.

### `src/components/TaskRow.tsx`

Represents a single task within the grid.

- **Display & Edit Modes**: Manages its own `isEditing` state. It displays task titles as plain text but switches to an `<Input />` field when clicked or when a new task is created.
- **Drag and Drop**:
  - Implements both `useDrag` and `useDrop` from React DnD.
  - The drag handle (`GripVertical`) allows reordering.
  - The entire row is a drop target. Dropping an item on it triggers either a reorder (`onMove`) or an indentation (`onSetParent`) based on the drop position and drag delta.
- **Context Menu**: Contains a `DropdownMenu` with actions like "Break down task", "Move to next/previous week", and "Delete". The menu items and hotkey hints are responsive to the viewport (mobile vs. desktop).

## 4. State Management and Data Flow

The application uses a client-centric state management approach, keeping things simple and performant for a single-user experience.

1.  **Single Source of Truth**: The `tasks` array in `page.tsx` holds the entire application state.
2.  **Immutability**: All state updates are immutable. When a task is modified, a new array is created using `.map()` or by spreading the existing array. This is crucial for React's change detection.
3.  **Prop Drilling**: State and handler functions are passed down from `page.tsx` through `TaskGrid.tsx` to `TaskRow.tsx`. While not ideal for very deep component trees, it is effective for this application's structure.
4.  **Server Actions (`src/app/actions.ts`)**: Although most state logic is on the client, this file contains functions that could run on the server (or client).
    - `getTasks()`: Generates initial sample data.
    - `handleBreakDownTask()`: An async function that calls the Genkit AI flow.
    - `getTasksMarkdown()` / `parseTasksMarkdown()`: Handles the logic for importing and exporting task data as Markdown files.

## 5. AI Integration (Genkit)

- **File**: `src/ai/flows/break-down-large-tasks.ts`
- **Functionality**: Provides the "Break down task" feature.
- **Implementation**:
  - `breakDownTaskFlow`: A Genkit flow is defined using `ai.defineFlow`.
  - `breakDownTaskPrompt`: A prompt is defined using `ai.definePrompt`. It instructs the LLM (Gemini) to act as a task management assistant and break a given task title into smaller sub-tasks.
  - **Input/Output**: The flow uses Zod schemas (`BreakDownTaskInputSchema`, `BreakDownTaskOutputSchema`) to define and enforce the data structure for its inputs and outputs, ensuring the AI returns a clean array of strings.
  - **Invocation**: The `TaskRow` component calls the `handleBreakDownTask` action, which in turn invokes the Genkit flow and returns the generated sub-tasks.

## 6. Drag & Drop Logic

- **Library**: `react-dnd` with `react-dnd-html5-backend` for desktop and `react-dnd-touch-backend` for mobile.
- **Reordering**: Dragging a task vertically over another task triggers the `onMove` callback, which reorders the items in the main `tasks` array in `page.tsx`.
- **Indentation/Un-indentation**:
  - Dragging a task horizontally (a small delta to the right) while dropping it on another task triggers the `onSetParent` callback to make it a child.
  - Dragging horizontally to the left triggers un-indentation.
  - This logic is contained within the `drop` and `hover` handlers of the `useDrop` hook in `TaskRow.tsx`.
- **Keyboard Indentation**: The `Tab` key in edit mode also triggers `onSetParent`, providing a keyboard-based alternative to drag-and-drop.

## 7. Styling and Theme

- **Theme Provider**: `ThemeProvider` in `src/components/ThemeProvider.tsx` uses `next-themes` to manage light and dark modes.
- **CSS Variables**: `src/app/globals.css` defines HSL-based CSS variables for both light and dark themes, following the ShadCN convention.
- **Colors**: The primary, background, and accent colors are defined according to the project's style guidelines:
  - **Primary**: `hsl(207, 82%, 67%)` (Calm Blue)
  - **Background**: `hsl(215, 28%, 17%)` (Light Blue - Dark Theme)
  - **Accent**: `hsl(215, 28%, 22%)` (Soft Green - Analogous)
- **Fonts**: `Poppins` for headlines and `PT Sans` for body text are configured in `src/app/layout.tsx` and applied via Tailwind's font family utilities in `tailwind.config.ts`.
- **Component Styling**: Components are styled using Tailwind CSS classes. The `cn` utility merges classes and handles conditional styling.