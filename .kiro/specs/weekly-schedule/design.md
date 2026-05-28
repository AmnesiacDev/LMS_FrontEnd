# Design Document: Weekly Schedule

## Overview

The Weekly Schedule feature adds a calendar-style scheduling page at `/dashboard/schedule` to the existing React + Vite LMS frontend. It renders a Saturday–Friday weekly grid that aggregates `session`, `task_due`, and `custom` schedule entries from the backend's `/api/v1/schedule/*` API. The page follows the project's Neo-Brutalist design system (inline styles, CSS variables, Font Awesome icons) and reuses existing infrastructure: `useApiRequest` for authenticated mutations, `useFetchData` for GET requests, the shared `Modal` component, and `AuthContext` for role resolution.

Key design goals:
- **Pure utility isolation**: `Week_Boundary_Calculator` is a pure function with no side effects, enabling property-based testing.
- **Race-condition safety**: `Schedule_API_Client` uses `AbortController` to cancel stale in-flight requests on navigation.
- **Role-gated rendering**: All mutation controls and drag behavior are conditionally rendered based on `user.role` from `AuthContext`.
- **Responsive fallback**: Below 768 px the grid is replaced by a date-grouped `Agenda_View`.
- **Accessibility first**: The grid exposes ARIA grid semantics; all modals reuse the existing focus-trapping `Modal` component.


## Architecture

### Component Tree

```
WeeklySchedulePage                    ← page root, owns all state
├── PageHeader                        ← "WEEKLY" + "SCHEDULE" pill + subtitle
├── WeekNavBar                        ← prev / today / next + week label
├── ConflictWarningBanner             ← non-blocking conflicts overlay (conditional)
├── [viewport >= 768px]
│   └── CalendarGrid                  ← role="grid", CSS-grid layout
│       ├── DayHeaderBand             ← TIME | SAT SUN MON TUE WED THU FRI
│       └── TimeSlotRows[]            ← one row per 30-min slot (08:00–22:00)
│           ├── TimeGutterCell        ← role="rowheader", hourly label
│           └── DayCell[]             ← role="gridcell", drop target
│               └── EntryCard[]       ← draggable (Manager only)
└── [viewport < 768px]
    └── AgendaView                    ← date-grouped list
        └── AgendaDateGroup[]
            └── AgendaEntryRow[]      ← tappable, opens EntryDetailView

Modals (rendered at WeeklySchedulePage level, portal into body):
├── EntryDetailView                   ← read + edit/delete for Manager
├── CustomEntryModal                  ← create / edit custom entries
└── SeriesModal                       ← list / create / edit / delete series
```

### Data Flow

```
AuthContext (user.role, user._id)
        │
        ▼
WeeklySchedulePage
  ├── currentWeek: { start: Date, end: Date }   ← from Week_Boundary_Calculator
  ├── entries: ScheduleEntry[]                   ← from Schedule_API_Client
  ├── loading / error / conflicts state
  └── activeModal: null | 'detail' | 'custom' | 'series'
        │
        ├── Schedule_API_Client.fetchWeek(start, end)
        │     └── AbortController per request
        │
        └── Drag_Reschedule_Handler
              └── Schedule_API_Client.patchEntry(id, { startAt, endAt })
```


## Components and Interfaces

### File / Directory Structure

```
src/
├── pages/Dashboard/
│   └── WeeklySchedulePage.jsx          ← page root + state orchestration
├── components/WeeklySchedule/
│   ├── PageHeader.jsx                  ← branded header
│   ├── WeekNavBar.jsx                  ← prev/today/next navigation
│   ├── CalendarGrid.jsx                ← CSS-grid calendar (desktop)
│   ├── DayHeaderBand.jsx               ← day label row
│   ├── EntryCard.jsx                   ← single entry card (draggable)
│   ├── AgendaView.jsx                  ← mobile list fallback
│   ├── ConflictWarningBanner.jsx       ← conflicts overlay
│   ├── EntryDetailView.jsx             ← detail modal content
│   ├── CustomEntryModal.jsx            ← create/edit custom entry form
│   └── SeriesModal.jsx                 ← series CRUD modal
├── utils/
│   └── weekBoundary.js                 ← Week_Boundary_Calculator (pure)
└── hooks/
    └── useScheduleApi.js               ← Schedule_API_Client hook
```

### Component Prop Interfaces

**WeeklySchedulePage** — no props (reads from `AuthContext` and `useScheduleApi`)

**PageHeader**
```js
{ /* no props — static branded content */ }
```

**WeekNavBar**
```js
{
  weekStart: Date,          // Saturday of displayed week
  weekEnd: Date,            // Friday of displayed week
  loading: bool,            // disables controls while fetching
  onPrev: () => void,
  onNext: () => void,
  onToday: () => void,
}
```

**CalendarGrid**
```js
{
  entries: ScheduleEntry[],
  weekStart: Date,
  isManager: bool,          // enables drag + edit/delete controls
  onEntryClick: (entry) => void,
  onEntryDrop: (id, newStartAt, newEndAt) => void,
}
```

**EntryCard**
```js
{
  entry: ScheduleEntry,
  isManager: bool,
  isDragging: bool,
  onPointerDown: (e, entry) => void,
  onClick: (entry) => void,
}
```

**AgendaView**
```js
{
  entries: ScheduleEntry[],
  weekStart: Date,
  onEntryClick: (entry) => void,
}
```

**ConflictWarningBanner**
```js
{
  conflicts: ConflictItem[],   // array from API response
  onDismiss: () => void,
}
```

**EntryDetailView** (rendered inside `Modal`)
```js
{
  entryId: string,
  isManager: bool,
  onClose: () => void,
  onEdit: (entry) => void,
  onDelete: (entry) => void,
  onRefetch: () => void,
}
```

**CustomEntryModal** (rendered inside `Modal`)
```js
{
  mode: 'create' | 'edit',
  initialData: Partial<ScheduleEntry> | null,
  onClose: () => void,
  onSuccess: () => void,
}
```

**SeriesModal** (rendered inside `Modal`)
```js
{
  onClose: () => void,
  onSuccess: () => void,
}
```


## Data Models

### ScheduleEntry (frontend shape, mirrors API response)

```js
{
  _id: string,
  entryType: 'session' | 'task_due' | 'custom',
  title: string,
  subject: string,
  startAt: string,          // ISO 8601
  endAt: string,            // ISO 8601
  status: string,           // e.g. 'scheduled', 'completed', 'canceled'
  color: string | null,     // CSS color or null
  notes: string | null,
  studentProfileId: string | { _id: string, user: { FullName: string } },
  instructorId: string | {
    _id: string,
    FullName: string,
    avatarUrl: string | null,
  },
  sessionId: string | null,
  taskId: string | null,
  seriesId: string | null,
}
```

### WeekBounds

```js
{ start: Date, end: Date }
```

### ConflictItem (from API response `conflicts` array)

```js
{ _id: string, title: string, startAt: string, endAt: string }
```

### SeriesRecord

```js
{
  _id: string,
  templateTitle: string,
  subject: string,
  frequency: 'weekly' | 'biweekly',
  daysOfWeek: number[],     // 0–6, 0 = Sunday
  startTime: string,        // HH:MM UTC
  durationMin: number,
  startsOn: string,         // ISO date
  endsOn: string | null,
  studentProfileId: string,
  instructorId: string,
}
```

### WeeklySchedulePage State Shape

```js
{
  currentWeek: WeekBounds,
  entries: ScheduleEntry[],
  loading: bool,
  error: string | null,
  conflicts: ConflictItem[],
  activeModal: null | 'detail' | 'custom' | 'series',
  selectedEntryId: string | null,   // for detail view
  editEntry: ScheduleEntry | null,  // for custom edit
  dragState: {
    entryId: string | null,
    originalStartAt: string | null,
    originalEndAt: string | null,
    isDragging: bool,
  },
  triggerRef: React.RefObject | null,  // focus-return target
}
```


## Week_Boundary_Calculator Design

**File**: `src/utils/weekBoundary.js`

This is a pure function with no side effects, no external reads/writes, and no mutation of its input. It uses only local-timezone `Date` methods (`getDay`, `getFullYear`, `getMonth`, `getDate`) to avoid UTC-offset drift.

### Algorithm

```js
/**
 * Returns the Saturday-to-Friday week bounds containing the given date,
 * computed entirely in the user's local timezone.
 *
 * @param {Date} date - Any valid Date instance
 * @returns {{ start: Date, end: Date }}
 * @throws {TypeError} if date is not a valid Date instance
 */
export function getWeekBounds(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new TypeError('getWeekBounds: expected a valid Date instance');
  }

  // getDay(): 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  const dayOfWeek = date.getDay(); // local timezone

  // Days since the most recent Saturday:
  // Sat=6 → 0, Sun=0 → 1, Mon=1 → 2, ..., Fri=5 → 6
  const daysSinceSat = dayOfWeek === 6 ? 0 : dayOfWeek + 1;

  // Build Saturday 00:00:00.000 local
  const start = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - daysSinceSat,
    0, 0, 0, 0
  );

  // Build Friday 23:59:59.999 local (start + 6 calendar days)
  const end = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate() + 6,
    23, 59, 59, 999
  );

  return { start, end };
}

/**
 * Formats a Date as YYYY-MM-DD in the user's local timezone.
 * Used to build the startDate / endDate query parameters.
 */
export function formatLocalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
```

### DST Safety

Using `new Date(year, month, day, ...)` (local-timezone constructor) instead of arithmetic on `.getTime()` means the function is immune to DST transitions. When clocks spring forward or fall back, the local-timezone calendar date arithmetic remains correct even though the elapsed-millisecond span of the week may differ by ±1 hour.


## Schedule_API_Client Design

**File**: `src/hooks/useScheduleApi.js`

The hook wraps `useApiRequest` and adds:
1. **AbortController** per fetch to cancel stale in-flight requests on navigation.
2. **10-second timeout** via `AbortSignal.timeout(10_000)` (or a manual `setTimeout` + `controller.abort()` fallback for older browsers).
3. **Conflict extraction** — returns `data.conflicts` alongside the entry list.

### Interface

```js
const {
  entries,
  loading,
  error,
  conflicts,
  fetchWeek,       // (start: Date, end: Date) => Promise<void>
  createCustom,    // (payload) => Promise<{ conflicts }>
  patchEntry,      // (id, patch) => Promise<{ conflicts }>
  deleteEntry,     // (id) => Promise<void>
  getEntry,        // (id) => Promise<ScheduleEntry>
  fetchSeries,     // () => Promise<SeriesRecord[]>
  getSeries,       // (id) => Promise<SeriesRecord>
  createSeries,    // (payload) => Promise<void>
  patchSeries,     // (id, patch) => Promise<void>
  deleteSeries,    // (id) => Promise<void>
} = useScheduleApi();
```

### Race-Condition Handling

```js
// Inside useScheduleApi:
const abortRef = useRef(null);

const fetchWeek = useCallback(async (start, end) => {
  // Cancel any previous in-flight request
  abortRef.current?.abort();
  const controller = new AbortController();
  abortRef.current = controller;

  // Combine abort signal with 10-second timeout
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('access-token') || '';
    const startDate = formatLocalDate(start);
    const endDate = formatLocalDate(end);
    const res = await fetch(
      `/api/v1/schedule?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error((await res.json()).message || `HTTP ${res.status}`);
    const data = await res.json();
    setEntries(data.data?.entries ?? data.data ?? []);
  } catch (err) {
    if (err.name === 'AbortError') return; // stale request — ignore silently
    setError(err.message);
  } finally {
    if (!controller.signal.aborted) setLoading(false);
  }
}, []);
```

Mutation methods (`createCustom`, `patchEntry`, etc.) delegate to `useApiRequest`'s `request()` which already handles JWT refresh and 401/419 retry. They do not use `AbortController` because mutations are not cancelled on navigation.


## Calendar_Grid Layout

**File**: `src/components/WeeklySchedule/CalendarGrid.jsx`

### CSS Grid Structure

The grid uses a single CSS Grid with named areas. All layout is via inline style objects (no Tailwind, no CSS modules) consistent with the project pattern.

```
Columns: [time-gutter] [sat] [sun] [mon] [tue] [wed] [thu] [fri]
         80px          1fr   1fr   1fr   1fr   1fr   1fr   1fr

Rows:    [header]  auto
         [08:00]   ROW_HEIGHT_PX
         [08:30]   ROW_HEIGHT_PX
         ...
         [22:00]   ROW_HEIGHT_PX
```

Constants:
```js
const GRID_START_HOUR = 8;    // 08:00
const GRID_END_HOUR   = 22;   // 22:00 (last slot starts at 22:00)
const TOTAL_SLOTS     = (GRID_END_HOUR - GRID_START_HOUR) * 2; // 28 slots
const ROW_HEIGHT_PX   = 48;   // height of one 30-min slot
const GUTTER_WIDTH    = 80;   // px
```

### Time Slot Positioning Math

For an entry with `startAt` and `endAt`:

```js
// Convert to local-timezone minutes since midnight
function minutesSinceMidnight(isoString) {
  const d = new Date(isoString);
  return d.getHours() * 60 + d.getMinutes();
}

// Row index (0-based from GRID_START_HOUR)
function slotIndex(isoString) {
  const mins = minutesSinceMidnight(isoString);
  const gridStartMins = GRID_START_HOUR * 60;
  return Math.floor((mins - gridStartMins) / 30);
}

// CSS grid-row value (1-based; row 1 = header, row 2 = first slot)
function gridRowStart(isoString) {
  return slotIndex(isoString) + 2; // +1 for 1-based, +1 for header row
}

function gridRowSpan(startIso, endIso) {
  const startSlot = slotIndex(startIso);
  const endMins   = minutesSinceMidnight(endIso);
  const gridStartMins = GRID_START_HOUR * 60;
  const endSlot   = Math.ceil((endMins - gridStartMins) / 30);
  return Math.max(1, endSlot - startSlot); // minimum 1 slot
}
```

### Day Column Mapping

```js
const DAY_ORDER = [6, 0, 1, 2, 3, 4, 5]; // Sat=6, Sun=0, Mon=1, ..., Fri=5
// Column index = DAY_ORDER.indexOf(entry.localDayOfWeek) + 2 (1-based + gutter)
```

### Midnight-Crossing Entries

When `endAt` is on a different calendar date than `startAt`, the entry is split into two visual segments:
- Segment A: from `startAt` to `23:59:59.999` of the start day
- Segment B: from `00:00:00.000` of the end day to `endAt`

Both segments share the same `entry._id` and open the same `EntryDetailView` on click.

### Overlapping Entries

When two or more entries share the same day column and their time ranges overlap, they are rendered side-by-side within the cell using `width: calc(100% / n)` and `left: calc(100% / n * i)` where `n` is the overlap group size and `i` is the entry's index within the group. Overlap detection runs as a pre-render pass over the entries array.


## Entry_Card Component Design

**File**: `src/components/WeeklySchedule/EntryCard.jsx`

### Visual Structure

```
┌─────────────────────────────────┐
│ [accent stripe — left border]   │
│ SUBJECT / TITLE (uppercase)     │  ← header region
│ [type icon + type label]        │
│                                 │
│ [avatar] Instructor Name [badge]│  ← footer region
└─────────────────────────────────┘
```

### Color Coding

```js
const ENTRY_TYPE_COLORS = {
  session:  { accent: '#3b82f6', bg: 'rgba(59,130,246,0.08)', label: '📅 Session'  },
  task_due: { accent: '#f59e0b', bg: 'rgba(245,158,11,0.08)', label: '📝 Task Due' },
  custom:   { accent: '#10b981', bg: 'rgba(16,185,129,0.08)', label: '✏️ Custom'   },
};

function resolveAccentColor(entry) {
  if (!entry.color) return ENTRY_TYPE_COLORS[entry.entryType]?.accent;
  // Validate: CSS named color or #RGB / #RRGGBB / #RRGGBBAA
  const valid = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(entry.color)
    || CSS.supports('color', entry.color);
  return valid ? entry.color : ENTRY_TYPE_COLORS[entry.entryType]?.accent;
}
```

The accent color is applied as a `4px solid` left border. The card body uses the type's `bg` tint. The type label (text + icon) is always rendered regardless of color, satisfying the non-color indicator requirement.

### Avatar Rendering

```js
function Avatar({ instructor }) {
  if (instructor?.avatarUrl) {
    return <img src={instructor.avatarUrl} alt={instructor.FullName} style={avatarStyle} />;
  }
  const initials = (instructor?.FullName || '?')
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return <div style={initialsStyle}>{initials}</div>;
}
```

### Duration / Status Badge

```js
function formatDuration(startIso, endIso) {
  const mins = (new Date(endIso) - new Date(startIso)) / 60000;
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
// Badge shows status if present, otherwise duration
const badgeText = entry.status || formatDuration(entry.startAt, entry.endAt);
```

### Neo-Brutalist Card Style

```js
const cardStyle = {
  background: typeColors.bg,
  border: '2px solid var(--border-color)',
  borderLeft: `4px solid ${accentColor}`,
  borderRadius: 'var(--radius-sm)',
  boxShadow: '2px 2px 0px 0px var(--shadow-color)',
  padding: '0.4rem 0.5rem',
  cursor: isManager ? 'grab' : 'pointer',
  overflow: 'hidden',
  position: 'absolute',
  width: '100%',
  transition: 'box-shadow 0.1s ease, transform 0.1s ease',
};
```


## Drag-and-Drop Approach

**No external library.** Drag-and-drop is implemented using the Pointer Events API (`onPointerDown`, `onPointerMove`, `onPointerUp`) on `EntryCard`, with a keyboard fallback using `Shift+Arrow` keys.

### Pointer Events Flow

```
onPointerDown (on EntryCard)
  → start 150ms hold timer
  → if timer fires: setDragState({ entryId, originalStartAt, originalEndAt, isDragging: true })
  → capture pointer (element.setPointerCapture)

onPointerMove (on document, while isDragging)
  → compute hovered grid cell from clientX/clientY using getBoundingClientRect on each DayCell
  → show ghost card at cursor position (absolute-positioned clone)
  → highlight hovered drop target cell

onPointerUp (on document, while isDragging)
  → release pointer capture
  → if drop target is valid: compute newStartAt/newEndAt, call onEntryDrop
  → if drop target is invalid or outside grid: revert to original position
  → clear dragState
```

### Duration Preservation

```js
function computeNewTimes(originalStartAt, originalEndAt, targetDayDate, targetSlotIndex) {
  const durationMs = new Date(originalEndAt) - new Date(originalStartAt);
  // Build newStartAt from target day + slot time
  const newStart = new Date(targetDayDate);
  newStart.setHours(GRID_START_HOUR + Math.floor(targetSlotIndex / 2));
  newStart.setMinutes((targetSlotIndex % 2) * 30);
  newStart.setSeconds(0);
  newStart.setMilliseconds(0);
  const newEnd = new Date(newStart.getTime() + durationMs);
  return { newStartAt: newStart.toISOString(), newEndAt: newEnd.toISOString() };
}
```

This guarantees `newEndAt - newStartAt === originalEndAt - originalStartAt` exactly.

### Keyboard Fallback (Shift+Arrow)

When a Manager-role user focuses an `EntryCard` and presses `Shift+ArrowUp/Down/Left/Right`:
- `Shift+ArrowLeft` / `Shift+ArrowRight`: move entry by ±1 day (±86400000 ms)
- `Shift+ArrowUp` / `Shift+ArrowDown`: move entry by ±1 slot (±1800000 ms = 30 min)

The same `computeNewTimes` logic applies. If the resulting position is outside the grid bounds (before 08:00 or after 22:00 on any day in the displayed week), the move is rejected with an inline error toast.

### Optimistic UI

On drop, the entry is immediately moved to its new position in local state. If the PATCH fails, the entry is reverted to `dragState.originalStartAt`/`originalEndAt` and an error toast is shown.

### Read-Only Guard

`onPointerDown` and `onKeyDown` handlers check `isManager` before initiating any drag. For `Read_Only_Role` users, the handlers are not attached at all (not just suppressed), so no drag state is ever created.


## Modal Designs

All modals use the existing `Modal` component from `src/components/Modal/Modal.jsx`, which provides focus trapping, ESC close, body scroll lock, and focus return. Modal content components are passed as `children`.

### Custom_Entry_Modal

**File**: `src/components/WeeklySchedule/CustomEntryModal.jsx`

Handles both `create` and `edit` modes. In `edit` mode, fields are pre-filled from `initialData` and only changed fields are sent in the PATCH body.

**Form Fields:**
| Field | Type | Validation |
|---|---|---|
| title | text | 1–100 chars after trim, required |
| subject | text | 1–100 chars after trim, required |
| startAt | datetime-local | required, ISO 8601 |
| endAt | datetime-local | required, strictly after startAt |
| studentProfileId | select | required, non-empty |
| instructorId | select/text | required, non-empty |
| color | color/text | optional, validated as CSS color or hex |
| notes | textarea | optional, 0–1000 chars |

**Validation Logic:**
- All required-field checks run on submit (not on blur) to avoid premature errors.
- `endAt > startAt` is checked client-side; if violated, both time fields are highlighted in `var(--error)` red and the error message "End time must be after start time" is shown inline.
- The submit button is disabled while a request is in flight to prevent duplicate submissions.

**On Success (create):** calls `POST /api/v1/schedule/custom`, then `onSuccess()` which triggers `fetchWeek` and closes the modal.

**On Success (edit):** calls `PATCH /api/v1/schedule/:id` with only changed fields, then `onSuccess()`.

### Series_Modal

**File**: `src/components/WeeklySchedule/SeriesModal.jsx`

Three internal views managed by a `view` state: `'list'` → `'detail'` → `'form'`.

**List View:** Fetches `GET /api/v1/schedule/series` on open. Renders each series as a Neo-Brutalist card row with templateTitle, subject, frequency, and an edit/delete action pair. Empty state and error state follow the project pattern.

**Detail View:** Fetches `GET /api/v1/schedule/series/:id` when a series is selected. Shows all fields. Provides "Edit" and "Delete" buttons for Manager roles.

**Form View (create/edit):**
| Field | Type | Validation |
|---|---|---|
| templateTitle | text | 1–120 chars |
| subject | text | 1–120 chars |
| frequency | select | `weekly` or `biweekly` |
| daysOfWeek | multi-checkbox | at least 1 selected, values 0–6 |
| startTime | time | HH:MM 24-hour format |
| durationMin | number | 15–480 |
| startsOn | date | required |
| endsOn | date | optional, strictly after startsOn if provided |
| studentProfileId | select | required |
| instructorId | select/text | required |

A note is displayed: "This series will materialize entries up to 12 weeks ahead."

In edit mode, a warning note is shown: "Updating this series will remove future entries and re-create the next 12 weeks."

**Delete Confirmation:** An inline confirmation prompt (not a separate modal) shows the series `templateTitle`, a "Confirm Delete" button, and a "Cancel" button. Uses a 30-second timeout for the DELETE request.

### Entry_Detail_View

**File**: `src/components/WeeklySchedule/EntryDetailView.jsx`

Rendered inside `Modal` with `size="md"`. Fetches `GET /api/v1/schedule/:id` on open.

**Displayed Fields:**
- `title`, `subject`, `entryType` (with type icon), `status`
- `startAt` and `endAt` formatted as local-timezone datetime strings
- `notes` (only if non-empty)
- `color` swatch (only if non-empty)
- Link to session page (if `sessionId` is non-empty)
- Link to task page (if `taskId` is non-empty)

**Manager Controls (only for `custom` entries):**
- "Edit" button → opens `CustomEntryModal` in edit mode
- "Delete" button → shows inline confirmation prompt

**Loading state:** Spinner / "Loading..." text while fetch is in flight.

**Error states:**
- 404: "Entry not found." + "Back to schedule" button
- Other errors: error message + "Retry" button


## Conflict_Warning_Banner Design

**File**: `src/components/WeeklySchedule/ConflictWarningBanner.jsx`

Rendered at the top of `WeeklySchedulePage`, below `WeekNavBar`, when `conflicts.length > 0`. It is non-blocking — it does not prevent the underlying create/update from taking effect.

### Visual Design

```
┌──────────────────────────────────────────────────────────────┐
│ ⚠  Schedule Conflicts Detected                    [Dismiss ✕]│
│ The following entries overlap with your change:              │
│  • Math Session — Sat 10:00 AM – 11:00 AM                   │
│  • Physics Task Due — Sat 10:30 AM – 11:00 AM               │
│  (and 3 more conflicts)                                      │
└──────────────────────────────────────────────────────────────┘
```

Style: `background: 'rgba(245,158,11,0.12)'`, `border: '3px solid var(--accent-yellow)'`, `borderRadius: 'var(--radius-sm)'`, `boxShadow: 'var(--shadow-sm)'`.

### Truncation Logic

```js
const MAX_SHOWN = 10;
const shown = conflicts.slice(0, MAX_SHOWN);
const extra  = conflicts.length - MAX_SHOWN;
// Renders shown items, then if extra > 0: "and {extra} more conflict(s)"
```

### Dismiss

The "Dismiss" button calls `onDismiss()` which sets `conflicts: []` in `WeeklySchedulePage` state, removing the banner from the DOM. The banner is re-shown if a subsequent create/update response includes a new non-empty `conflicts` array.

### Accessibility

- `role="alert"` on the banner container so screen readers announce it immediately on render.
- Dismiss button has `aria-label="Dismiss conflicts banner"`.


## NotificationBell Extension

**File**: `src/components/NotificationBell/NotificationBell.jsx` (modified)

The existing `typeIcon` map is extended with three new schedule notification types. No structural changes to the component are needed — only the icon map and the navigation handler need updating.

### Extended typeIcon Map

```js
const typeIcon = (type) => {
  const icons = {
    // Existing types (unchanged)
    new_message:       '💬',
    new_task:          '📝',
    task_graded:       '✅',
    new_session:       '📅',
    session_review:    '⭐',
    exam_result:       '📊',
    system_alert:      '🔔',
    // New schedule types — each icon is distinct from all existing icons
    schedule_reminder: '🗓️',   // calendar with spiral — distinct from 📅
    schedule_updated:  '🔄',   // counterclockwise arrows — distinct from all above
    new_schedule_entry:'📌',   // pushpin — distinct from all above
  };
  return icons[type] || '🔔';
};
```

### Navigation for Schedule Notifications

The existing `handleClick` function already navigates to `notif.link` if present. Schedule notifications will have `link` values pointing to `/dashboard/schedule?entryId=<id>`. The `WeeklySchedulePage` reads the `entryId` query param on mount and opens the `EntryDetailView` for that entry.

If the linked entry returns 404 (inaccessible), the `EntryDetailView` shows its "not found" state and the notification is still marked as read (the `markAsRead` call happens before navigation, consistent with the existing pattern).

### No Polling Changes

The existing 30-second unread-count polling already covers the new notification types because the backend's unread-count endpoint counts all unread notifications regardless of type. No changes to the polling interval or endpoint are needed.


## Responsive / Agenda_View Design

**File**: `src/components/WeeklySchedule/AgendaView.jsx`

### Viewport Detection

```js
// In WeeklySchedulePage:
const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

useEffect(() => {
  const mq = window.matchMedia('(max-width: 767px)');
  const handler = (e) => setIsMobile(e.matches);
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}, []);
```

When `isMobile` is `true`, `AgendaView` is rendered instead of `CalendarGrid`. The switch happens within one React render cycle (< 500 ms) because it is driven by a synchronous state update from the `matchMedia` event.

### Agenda_View Structure

Entries are grouped by local-timezone calendar date, sorted ascending from Saturday to Friday. Within each date group, entries are sorted by `startAt` ascending.

```
Saturday, Jan 11
  ├── [EntryCard] 9:00 AM – 10:00 AM  Math Session
  └── [EntryCard] 2:00 PM – 2:30 PM   Physics Task Due

Sunday, Jan 12
  └── (no entries — date group is omitted)

Monday, Jan 13
  └── [EntryCard] 10:00 AM – 11:00 AM  Custom Study Block
```

Date groups with zero entries are omitted from the rendered list. If the entire week has zero entries, the empty-state message is shown.

### Agenda Entry Row

Each row uses the same `EntryCard` visual structure (subject header, type icon, instructor avatar + name, status/duration badge) but laid out horizontally in a list row rather than positioned absolutely in a grid cell.

Drag-and-drop is disabled in `AgendaView`. Reschedule is available only via the `EntryDetailView` edit form (opened by tapping/clicking a row).

### Empty State

```jsx
<div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
  <p style={{ fontSize: '1.5rem' }}><i className="fa-solid fa-calendar-days" /></p>
  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400 }}>No entries this week</h3>
  <p style={{ color: 'var(--text-muted)' }}>Nothing scheduled for this week.</p>
</div>
```


## Accessibility

### ARIA Grid Semantics

```jsx
<div role="grid" aria-label="Weekly schedule" aria-rowcount={TOTAL_SLOTS + 1}>
  {/* Header row */}
  <div role="row">
    <div role="columnheader">TIME</div>
    <div role="columnheader">SAT</div>
    {/* ... */}
  </div>
  {/* Time slot rows */}
  {slots.map((slot, rowIdx) => (
    <div role="row" key={slot.label} aria-rowindex={rowIdx + 2}>
      <div role="rowheader">{slot.label}</div>
      {DAY_ORDER.map(day => (
        <div
          role="gridcell"
          key={day}
          tabIndex={isFocused ? 0 : -1}
          aria-label={`${slot.label} ${dayLabel(day)}`}
        >
          {/* EntryCards for this cell */}
        </div>
      ))}
    </div>
  ))}
</div>
```

### Keyboard Navigation

Arrow key navigation is managed by a `useGridKeyboard` hook inside `CalendarGrid`:

- `ArrowRight` / `ArrowLeft`: move focus to next/previous day column in the same row
- `ArrowDown` / `ArrowUp`: move focus to next/previous time slot in the same day column
- Focus wraps at boundaries (stays on current cell, does not wrap to opposite edge)
- `Enter` / `Space` on a focused `EntryCard`: opens `EntryDetailView`
- `Shift+Arrow` on a focused `EntryCard` (Manager only): triggers keyboard reschedule

Focus is tracked via a `focusedCell: { row, col }` state. The `tabIndex` of each cell is set to `0` only for the focused cell; all others are `-1` (roving tabindex pattern).

### Focus Management for Modals

All modals use the existing `Modal` component which already:
- Traps Tab/Shift+Tab within the modal panel
- Returns focus to `previouslyFocused.current` on close

`WeeklySchedulePage` stores a `triggerRef` pointing to the button/card that opened each modal, and passes `onClose` callbacks that restore focus to that element.

### Screen Reader Announcements

- `ConflictWarningBanner` uses `role="alert"` for immediate announcement.
- Loading state uses `aria-live="polite"` on the skeleton container.
- Error states use `role="alert"` for immediate announcement.
- Drag state changes announce via an `aria-live="assertive"` visually-hidden status region: "Moving [entry title]. Use arrow keys to position, Enter to confirm, Escape to cancel."


## Error Handling

### HTTP Status Mapping

| Status | Context | Behavior |
|---|---|---|
| 401 | Any request | `useApiRequest` handles token refresh + retry; on failure redirects to `/login` |
| 403 | Any request | Inline error: "You are not authorized for this action." No retry. |
| 404 | `GET /schedule/:id` or `GET /series/:id` | "Entry not found." + "Back to schedule" control |
| 400 with message | Any mutation | Display server message inline in originating modal |
| 400 `endAt not after startAt` | Create/edit | Highlight both time fields + "End time must be after start time." |
| 400 `entryType not custom` | POST custom | "This endpoint accepts custom entries only." |
| 400 empty body | Any mutation | "The request was invalid." |
| 5xx | Any request | "A server error occurred." + Retry control |
| Network error / timeout | Any request | "Could not connect. Check your connection." + preserve unsaved input |

### Toast Notifications

Short-lived toasts (3-second auto-dismiss) are used for:
- Successful drag reschedule
- `task_due` drag: "The linked task's due date was updated."
- Failed drag reschedule: "Could not reschedule. Entry reverted."
- Keyboard reschedule rejection: "Cannot move entry outside the schedule grid."

Toasts are rendered in a fixed-position container at the bottom-right of the viewport, stacked vertically. They use `role="status"` for non-urgent announcements.

### Preserved Input on Error

When a modal request fails, all form field values are preserved in component state. The modal remains open. The error message is displayed in a `<p style={{ color: 'var(--error)' }}>` element above the submit button, consistent with the `SessionsPage` pattern.


## Route Registration in App.jsx

Add the following import and route to `src/App.jsx`:

```jsx
// Import (alongside other dashboard page imports)
import WeeklySchedulePage from './pages/Dashboard/WeeklySchedulePage';

// Route (inside the /dashboard nested routes, alongside sessions/tasks/etc.)
<Route path="schedule" element={
  <ProtectedRoute allowedRoles={['student', 'parent', 'instructor', 'admin']}>
    <WeeklySchedulePage />
  </ProtectedRoute>
} />
```

All four roles have read access. Mutation controls are gated inside the page by `user.role` checks, not by route-level role restriction.


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

The following properties are derived from the acceptance criteria. They are suitable for property-based testing using a library such as [fast-check](https://github.com/dubzzz/fast-check) (JavaScript).

**Property Reflection:** After reviewing all testable criteria, the following consolidations were made:
- Requirements 2.1, 2.2, 2.3, and 2.4 all describe invariants of `getWeekBounds` output — consolidated into Properties 1 and 2.
- Requirements 2.5 (purity/immutability) stands alone as Property 3.
- The idempotence and containment properties from the requirements document's own correctness section are captured in Properties 1 and 4.
- Entry card rendering properties (4.1–4.8) are consolidated into Property 6 (all required fields present) and Property 7 (color resolution).
- Role-scoped filtering (5.1–5.7) is consolidated into Property 8.
- Conflict display (8.1–8.5) is consolidated into Property 9.
- Drag duration invariance (9.2) stands alone as Property 10.

---

### Property 1: Week bounds always land on Saturday–Friday

*For any* valid JavaScript `Date` `d`, `getWeekBounds(d).start.getDay()` SHALL equal `6` (Saturday) with time components `00:00:00.000`, and `getWeekBounds(d).end.getDay()` SHALL equal `5` (Friday) with time components `23:59:59.999`, in the user's local timezone.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

---

### Property 2: Week bounds span exactly 6 calendar days

*For any* valid JavaScript `Date` `d`, the local-timezone calendar date of `getWeekBounds(d).end` SHALL equal the local-timezone calendar date of `getWeekBounds(d).start` plus exactly 6 days.

**Validates: Requirements 2.4**

---

### Property 3: Week_Boundary_Calculator does not mutate its input

*For any* valid JavaScript `Date` `d`, calling `getWeekBounds(d)` SHALL leave `d.getTime()` unchanged after the call returns.

**Validates: Requirements 2.5**

---

### Property 4: Week bounds are idempotent (containment + round-trip)

*For any* valid JavaScript `Date` `d`:
- `getWeekBounds(d).start <= d <= getWeekBounds(d).end` (containment)
- `getWeekBounds(getWeekBounds(d).start).start` equals `getWeekBounds(d).start` (idempotence on start)
- `getWeekBounds(getWeekBounds(d).end).end` equals `getWeekBounds(d).end` (idempotence on end)

**Validates: Requirements 2.1, 2.2**

---

### Property 5: Date formatting produces valid YYYY-MM-DD strings

*For any* valid JavaScript `Date` `d`, `formatLocalDate(d)` SHALL return a string matching the regex `YYYY-MM-DD` format that correctly represents `d`'s local-timezone year, month, and day.

**Validates: Requirements 3.1**

---

### Property 6: Entry card renders all required fields for any entry

*For any* `ScheduleEntry` object with valid `subject`, `entryType`, `startAt`, `endAt`, and `instructorId` fields, the rendered `EntryCard` SHALL contain: (a) the subject text in the header region, (b) a type indicator element whose text or icon maps 1:1 to the `entryType` value, (c) an instructor avatar or initials placeholder, (d) the instructor's display name, and (e) a status or duration badge.

**Validates: Requirements 4.1, 4.2, 4.3, 4.8**

---

### Property 7: Entry card color resolution is deterministic

*For any* `ScheduleEntry`, the accent color applied to the rendered card SHALL equal: (a) `entry.color` if it is a valid CSS named color or matches `/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/`; (b) the default type accent color for `entry.entryType` in all other cases (null, empty, invalid format).

**Validates: Requirements 4.4, 4.5, 4.6, 4.7**

---

### Property 8: Rendered entries are a subset of backend-returned entries filtered by role

*For any* user `u` with role `r` and any set of entries `E` returned by the backend for week `w`, the set of entries rendered by `WeeklySchedulePage` SHALL be a subset of `E` and SHALL exclude any entry in `E` that does not satisfy the role-scoping rule for `r` (student: own profile; instructor: own or assigned students; parent: children's profiles; admin: all).

**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.7**

---

### Property 9: Conflict banner displays exactly the conflicts returned (up to 10)

*For any* API response with `conflicts` array of length `n`:
- If `n === 0`: the `ConflictWarningBanner` SHALL NOT be rendered.
- If `1 <= n <= 10`: the banner SHALL render exactly `n` conflict items whose IDs match `conflicts[0..n-1]` in order.
- If `n > 10`: the banner SHALL render exactly 10 items (the first 10) and a summary indicator stating the total count of additional conflicts (`n - 10`).

**Validates: Requirements 8.1, 8.4, 8.5**

---

### Property 10: Drag reschedule preserves entry duration exactly

*For any* `ScheduleEntry` with `startAt` and `endAt`, and any valid drop target `(day, slotIndex)` within the Calendar_Grid bounds, the `Drag_Reschedule_Handler` SHALL compute `newStartAt` and `newEndAt` such that `new Date(newEndAt) - new Date(newStartAt)` equals `new Date(endAt) - new Date(startAt)` exactly (in milliseconds).

**Validates: Requirements 9.2**


## Testing Strategy

### Overview

The feature uses a dual testing approach: property-based tests for universal invariants and example-based unit/integration tests for specific behaviors.

### Property-Based Testing

**Library**: [fast-check](https://github.com/dubzzz/fast-check) (`npm install --save-dev fast-check@3.x`)

**Configuration**: Each property test runs a minimum of **100 iterations** (fast-check default is 100; set `numRuns: 100` explicitly).

**Tag format**: Each property test file includes a comment referencing the design property:
```js
// Feature: weekly-schedule, Property 1: Week bounds always land on Saturday–Friday
```

**Property test files:**

| File | Properties Covered |
|---|---|
| `src/utils/__tests__/weekBoundary.test.js` | Properties 1, 2, 3, 4, 5 |
| `src/components/WeeklySchedule/__tests__/EntryCard.pbt.test.jsx` | Properties 6, 7 |
| `src/components/WeeklySchedule/__tests__/roleFilter.pbt.test.js` | Property 8 |
| `src/components/WeeklySchedule/__tests__/ConflictWarningBanner.pbt.test.jsx` | Property 9 |
| `src/utils/__tests__/dragReschedule.pbt.test.js` | Property 10 |

**Example property test (Property 1):**
```js
import fc from 'fast-check';
import { getWeekBounds } from '../weekBoundary';

// Feature: weekly-schedule, Property 1: Week bounds always land on Saturday–Friday
test('getWeekBounds: start is always Saturday 00:00:00.000', () => {
  fc.assert(fc.property(
    fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') }),
    (d) => {
      const { start } = getWeekBounds(d);
      expect(start.getDay()).toBe(6);
      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
      expect(start.getSeconds()).toBe(0);
      expect(start.getMilliseconds()).toBe(0);
    }
  ), { numRuns: 100 });
});

// Feature: weekly-schedule, Property 1: Week bounds always land on Saturday–Friday
test('getWeekBounds: end is always Friday 23:59:59.999', () => {
  fc.assert(fc.property(
    fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') }),
    (d) => {
      const { end } = getWeekBounds(d);
      expect(end.getDay()).toBe(5);
      expect(end.getHours()).toBe(23);
      expect(end.getMinutes()).toBe(59);
      expect(end.getSeconds()).toBe(59);
      expect(end.getMilliseconds()).toBe(999);
    }
  ), { numRuns: 100 });
});
```

### Unit / Example Tests

**Test runner**: Vitest (already in the project via Vite)

**Example test files:**

| File | Coverage |
|---|---|
| `src/components/WeeklySchedule/__tests__/CalendarGrid.test.jsx` | Day header labels, time gutter markers, empty state, loading skeleton |
| `src/components/WeeklySchedule/__tests__/WeekNavBar.test.jsx` | Prev/next/today navigation, disabled state during loading |
| `src/components/WeeklySchedule/__tests__/CustomEntryModal.test.jsx` | Form validation (endAt ≤ startAt, empty fields), submit flow |
| `src/components/WeeklySchedule/__tests__/SeriesModal.test.jsx` | List/detail/form views, validation, delete confirmation |
| `src/components/WeeklySchedule/__tests__/EntryDetailView.test.jsx` | Field display, 404 state, manager controls visibility |
| `src/components/WeeklySchedule/__tests__/AgendaView.test.jsx` | Date grouping, sort order, empty state |
| `src/components/NotificationBell/__tests__/NotificationBell.schedule.test.jsx` | New type icons, navigation on click |

### Integration Tests

Integration tests use `msw` (Mock Service Worker) to intercept API calls:

| Scenario | Test |
|---|---|
| Fetch on mount with correct date params | `WeeklySchedulePage.integration.test.jsx` |
| AbortController cancels stale request on navigation | `useScheduleApi.test.js` |
| 401 triggers token refresh flow | `useScheduleApi.test.js` |
| 403 shows inline error, no retry | `WeeklySchedulePage.integration.test.jsx` |
| Drag PATCH failure reverts entry position | `dragReschedule.integration.test.jsx` |

### What Is NOT Property-Tested

- API integration (external service behavior) → integration tests with MSW mocks
- UI rendering layout (pixel positions, CSS) → snapshot tests
- Modal open/close behavior → example-based unit tests
- Keyboard navigation sequences → example-based unit tests with `userEvent`

