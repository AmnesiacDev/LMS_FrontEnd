# Requirements Document

## Introduction

The Weekly Schedule feature adds a calendar-style scheduling experience to the LMS dashboard so Students, Parents, Instructors, and Admins can see all of their relevant time-based work in one place. The frontend integrates with the existing Schedule API (`/api/v1/schedule/*`), which already aggregates three kinds of entries:

- `session` entries (auto-created from sessions)
- `task_due` entries (auto-created from tasks, 30-minute window before the task's due time)
- `custom` entries (manually created by Instructors and Admins)

The frontend delivers a weekly Saturday–Friday grid with prev/next/today navigation, branded page header ("Weekly Schedule" title with a highlighted "Schedule" pill, plus a "Full Academic Timetable View" subtitle), a distinct accent-colored day-header band, a leftmost time gutter labelled "TIME" with hourly markers, color coding by entry type, role-scoped visibility, drag-and-drop rescheduling for Instructors and Admins, custom entry creation, recurring series management, an entry detail/edit view, error handling for the API's 400/401/403/404 responses, NotificationBell support for the new `schedule_*` notification types, accessibility (keyboard navigation, ARIA grid semantics), and a responsive mobile/agenda fallback. Backend-driven automatic sync (sessions or tasks created/updated/cancelled/completed/deleted, plus task `dueDate` cascades from drag-reschedule on `task_due` entries) is reflected on next refetch with no manual refresh required.

## Glossary

- **Schedule_Frontend**: the overall weekly schedule UI feature being added to the LMS frontend.
- **Schedule_API_Client**: the frontend module that issues HTTP calls to `/api/v1/schedule/*` using the existing `useApiRequest` / `useFetchData` hooks and JWT bearer auth.
- **Weekly_Calendar_View**: the page/component rendering a Saturday–Friday grid for one week.
- **Page_Header**: the branded header at the top of the Weekly_Calendar_View showing the title "WEEKLY" followed by a highlighted "SCHEDULE" pill, plus the subtitle "Full Academic Timetable View".
- **Calendar_Grid**: the seven-column, time-indexed grid inside the Weekly_Calendar_View, with a leftmost time gutter labelled "TIME".
- **Day_Header_Band**: the top row of the Calendar_Grid that displays the day labels SAT, SUN, MON, TUE, WED, THU, FRI in a distinct accent color (yellow in the reference design) spanning the full grid width.
- **Time_Gutter**: the leftmost column of the Calendar_Grid that displays hourly time markers (e.g., 8 AM, 9 AM, 10 AM …) aligned to the grid rows.
- **Agenda_View**: the vertical date-grouped list rendered as a fallback on small viewports.
- **Entry_Card**: the visual representation of a single schedule entry inside the Calendar_Grid or Agenda_View, structured with the subject at the top, optional descriptive content in the middle, and a footer row containing the assigned instructor's avatar, instructor name, and a status/duration badge.
- **Entry_Detail_View**: the modal/panel that shows full details of a single entry and offers edit/delete controls when permitted.
- **Custom_Entry_Modal**: the modal used by Instructor or Admin to create or edit a `custom` entry.
- **Series_Modal**: the modal used by Instructor or Admin to create, view, edit, or delete a recurring series.
- **Drag_Reschedule_Handler**: the frontend logic that converts a drop gesture on an Entry_Card into a `PATCH /api/v1/schedule/:id` call with new `startAt`/`endAt`.
- **Week_Boundary_Calculator**: the pure date utility that, given any date, returns the Saturday 00:00:00.000 local-timezone start and Friday 23:59:59.999 local-timezone end of that week.
- **Conflict_Warning_Banner**: the non-blocking banner shown when a create or update response includes a non-empty `conflicts` array.
- **NotificationBell**: the existing shared notification dropdown component (`src/components/NotificationBell/NotificationBell.jsx`) extended to render the new schedule notification types.
- **Role**: the authenticated user's role, one of `Student`, `Instructor`, `Parent`, `Admin`, sourced from `AuthContext`.
- **Read_Only_Role**: a Role with no mutation rights on the schedule, namely `Student` or `Parent`.
- **Manager_Role**: a Role with mutation rights on the schedule, namely `Instructor` or `Admin`.
- **Entry_Type**: the discriminator on an entry, one of `session`, `task_due`, `custom`.
- **Series**: a recurring schedule template stored at `/api/v1/schedule/series` that materializes entries up to 12 weeks ahead.

## Requirements

### Requirement 1: Weekly Calendar View and Week Navigation

**User Story:** As an authenticated LMS user, I want to see all my schedule entries laid out on a Saturday–Friday weekly grid with a branded header and prev/next/today controls, so that I can plan my academic week at a glance.

#### Acceptance Criteria

1. WHEN the Weekly_Calendar_View mounts, THE Schedule_Frontend SHALL invoke `GET /api/v1/schedule?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` via the Schedule_API_Client with a 10-second timeout for the current week's Saturday-to-Friday bounds, and SHALL render the returned entries on the Calendar_Grid within 1 second of receiving the response.
2. THE Page_Header SHALL display the title text "WEEKLY" followed by a visually highlighted "SCHEDULE" pill (distinct accent fill, contrasting text), and below the title SHALL display the subtitle text "FULL ACADEMIC TIMETABLE VIEW".
3. THE Calendar_Grid SHALL render seven day columns labelled "SAT", "SUN", "MON", "TUE", "WED", "THU", "FRI" in that exact left-to-right order inside the Day_Header_Band, with the Day_Header_Band rendered in a distinct accent color (yellow per the reference design) spanning the full grid width.
4. THE Calendar_Grid SHALL render the Time_Gutter as the leftmost column with the header label "TIME" inside the Day_Header_Band and hourly time markers (`8 AM`, `9 AM`, `10 AM`, `11 AM`, `12 PM`, `1 PM`, …) covering 08:00 through 22:00 in the user's local timezone, with each marker aligned to the row that begins that hour.
5. THE Calendar_Grid SHALL render time rows in 30-minute increments covering 08:00 through 22:00 in the user's local timezone, with the hour boundary rows (00 and 30 minutes) visually distinguishable from each other (e.g., solid vs. dashed horizontal separator).
6. WHEN the user activates the "Next week" control, THE Schedule_Frontend SHALL advance the displayed week by exactly seven days and refetch entries via `GET /api/v1/schedule?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` for the new week's Saturday-to-Friday bounds.
7. WHEN the user activates the "Previous week" control, THE Schedule_Frontend SHALL move the displayed week back by exactly seven days and refetch entries for the new week's Saturday-to-Friday bounds.
8. WHEN the user activates the "Today" control, THE Schedule_Frontend SHALL set the displayed week to the week containing the current date in the user's local timezone (Saturday-to-Friday) and refetch entries for that week's bounds.
9. THE Calendar_Grid SHALL position each Entry_Card in the day column matching its `startAt` (in the user's local timezone) at the row corresponding to its `startAt` rounded down to the nearest 30-minute slot, span vertically until its `endAt` rounded up to the nearest 30-minute slot, and use a minimum visible card height equivalent to one 30-minute row.
10. WHERE an entry's `startAt` and `endAt` cross midnight within the displayed week, THE Calendar_Grid SHALL render the entry as separate visual segments in each affected day column, each labeled with the same title and linked to the same underlying entry.
11. WHILE entries for the displayed week are loading, THE Weekly_Calendar_View SHALL render a skeleton placeholder for the Calendar_Grid and SHALL disable the "Previous week", "Next week", and "Today" controls until the response is received or the request fails.
12. IF the schedule fetch fails or times out, THEN THE Weekly_Calendar_View SHALL display an inline error indication, SHALL re-enable the navigation controls, and SHALL expose a retry control that re-issues the request when activated.
13. WHEN the schedule fetch returns zero entries for the displayed week, THE Calendar_Grid SHALL render with all day columns and the Time_Gutter visible and SHALL display an empty-state message indicating that no entries exist for the displayed week.

### Requirement 2: Week Boundary Calculation

**User Story:** As a developer integrating with the Schedule API, I want a deterministic utility that computes the Saturday-to-Friday bounds for any date in the user's local timezone, so that range queries match the displayed week exactly.

#### Acceptance Criteria

1. WHEN given any valid JavaScript Date input representing a real instant in time, THE Week_Boundary_Calculator SHALL return an object with a `start` Date equal to Saturday 00:00:00.000 in the user's local timezone of that input's containing Saturday-to-Friday week.
2. WHEN given any valid JavaScript Date input representing a real instant in time, THE Week_Boundary_Calculator SHALL return an object with an `end` Date equal to Friday 23:59:59.999 in the user's local timezone of that input's containing Saturday-to-Friday week.
3. THE Week_Boundary_Calculator SHALL produce a `start` value whose local-timezone weekday index is `6` (Saturday).
4. THE Week_Boundary_Calculator SHALL produce an `end` value whose local-timezone weekday index is `5` (Friday) and whose local-timezone calendar date equals `start`'s local-timezone calendar date plus six days.
5. THE Week_Boundary_Calculator SHALL be a pure function that does not mutate its input Date and does not read from or write to any external state.
6. IF the Week_Boundary_Calculator is given an input that is not a valid Date instance (null, undefined, NaN-valued Date, non-Date value), THEN it SHALL throw a TypeError without producing partial output.

#### Correctness Properties (for property-based testing)

- **Idempotence**: For all dates `d`, `weekBounds(weekBounds(d).start).start` equals `weekBounds(d).start` and `weekBounds(weekBounds(d).end).end` equals `weekBounds(d).end`.
- **Containment**: For all dates `d`, `weekBounds(d).start <= d <= weekBounds(d).end`.
- **Length invariant (DST-aware)**: For all dates `d` not crossing a DST boundary, `weekBounds(d).end - weekBounds(d).start` equals exactly `7 * 24 * 60 * 60 * 1000 - 1` milliseconds; for dates crossing a DST boundary, the elapsed-millisecond length deviates from this value by at most one hour while the local-timezone calendar invariants in criteria 3 and 4 still hold.
- **Monotonic shift**: For all dates `d` and integers `n`, advancing the displayed week `n` times then `n` times back yields the original `weekBounds(d)`.
- **DST safety**: For all dates `d` falling on or near a daylight-saving boundary in the user's local timezone, `weekBounds(d).start` and `weekBounds(d).end` SHALL still satisfy the local-timezone weekday and calendar-date invariants in criteria 3 and 4.

### Requirement 3: Date Range Queries

**User Story:** As an LMS user navigating away from the current week, I want the schedule to load entries for the displayed week, so that the grid shows the correct data after every navigation.

#### Acceptance Criteria

1. WHEN issuing a date-range fetch, THE Schedule_API_Client SHALL call `GET /api/v1/schedule` with `startDate` and `endDate` query parameters formatted as `YYYY-MM-DD` in the user's local timezone, with a 10-second request timeout.
2. THE Schedule_API_Client SHALL derive `startDate` from the Week_Boundary_Calculator's `start` (Saturday 00:00:00 local) and `endDate` from its `end` (Friday 23:59:59 local) for the displayed week.
3. WHEN a date-range fetch returns entries, THE Weekly_Calendar_View SHALL render only entries whose `startAt` falls within the requested local-timezone Saturday-to-Friday window, including entries whose `endAt` extends up to 24 hours past the window end (to accommodate entries that cross midnight on Friday).
4. WHILE a date-range fetch is in flight, IF the user navigates again, THEN THE Schedule_API_Client SHALL discard responses for ALL prior in-flight fetches and SHALL apply only the latest navigation's response to the Calendar_Grid.
5. IF a date-range fetch fails, returns a non-success response, or does not respond within 10 seconds, THEN THE Weekly_Calendar_View SHALL preserve the previously rendered entries, SHALL display an error indication that the schedule could not be refreshed, and SHALL NOT apply a partial update to the Calendar_Grid.

#### Correctness Properties (for property-based testing)

- **Range subset**: For any week `w`, every entry rendered for `w` satisfies `entry.startAt >= w.start && entry.startAt <= w.end`.
- **Round-trip with backend semantics**: For any week `w`, calling `/api/v1/schedule?startDate=w.start&endDate=w.end` followed by re-rendering and re-querying with the same bounds SHALL yield the same set of entry IDs (assuming no concurrent backend writes).

### Requirement 4: Entry Card Visual Structure and Color Coding

**User Story:** As an LMS user, I want each Entry_Card to show its subject prominently with the assigned instructor, status, and a type-distinct color, so that I can scan my week and recognize each block at a glance.

#### Acceptance Criteria

1. THE Entry_Card SHALL render a header region at the top displaying the entry's `subject` value (or `title` when `subject` is empty) in uppercase or title-case styling that is visually dominant within the card.
2. THE Entry_Card SHALL render a footer region at the bottom of the card containing the assigned instructor's avatar (left), the instructor's display name (center), and a status/duration badge (right) showing either the entry's `status` value (e.g., `scheduled`) or its formatted duration (e.g., `1h`, `30m`), in that left-to-right order.
3. WHERE the entry's instructor record exposes an avatar image URL, THE Entry_Card SHALL render that image; otherwise THE Entry_Card SHALL render an avatar placeholder containing the instructor's initials.
4. THE Entry_Card SHALL render with a mutually distinct color theme for each value of `Entry_Type` (`session`, `task_due`, `custom`), applied to a persistently visible accent region of the card (left border, top stripe, or background fill) plus a contrasting card body fill so each type is identifiable from the card alone.
5. WHERE the entry has a non-empty and valid `color` field (a CSS named color or a hex value in the form `#RGB`, `#RRGGBB`, or `#RRGGBBAA`), THE Entry_Card SHALL use that color as the card's accent region color, overriding the default theme accent for its `Entry_Type`.
6. WHERE the entry has no `color` field, an empty `color` value, or a missing value, THE Entry_Card SHALL fall back to the default theme color for its `Entry_Type`.
7. IF the entry's `color` field is present but does not match the valid format defined in criterion 5, THEN THE Entry_Card SHALL fall back to the default theme color for its `Entry_Type` and SHALL NOT apply any partial styling derived from the invalid value.
8. THE Entry_Card SHALL display a non-color indicator of `Entry_Type` (a visible textual label or icon mapped 1:1 to `session`, `task_due`, or `custom`) so the type distinction is conveyed by more than color alone.

### Requirement 5: Role-Aware Visibility (Read Access)

**User Story:** As an LMS user with a specific role, I want the schedule to show only entries I am authorized to see, so that the UI matches what the backend will return.

#### Acceptance Criteria

1. WHEN a Student authenticated via `AuthContext` fetches entries, THE Schedule_Frontend SHALL render only entries whose `studentProfileId` matches the authenticated Student's profile ID from `AuthContext`.
2. WHEN an Instructor authenticated via `AuthContext` fetches entries, THE Schedule_Frontend SHALL render only entries whose `instructorId` matches the authenticated Instructor's ID from `AuthContext` or whose `studentProfileId` belongs to a student assigned to that Instructor.
3. WHEN a Parent authenticated via `AuthContext` fetches entries, THE Schedule_Frontend SHALL render only entries whose `studentProfileId` belongs to one of the Parent's children as listed in `AuthContext`.
4. WHEN an Admin authenticated via `AuthContext` fetches entries, THE Schedule_Frontend SHALL render every entry returned by the backend without additional filtering.
5. THE Schedule_Frontend SHALL rely on the backend's role-scoping for authorization and SHALL NOT include `studentProfileId`, `instructorId`, or any role-override query parameter in its schedule fetch requests beyond the documented `startDate` and `endDate` parameters.
6. IF the authenticated user has no recognized Role (role is missing, null, or not one of `Student`, `Instructor`, `Parent`, `Admin`), THEN THE Schedule_Frontend SHALL NOT issue any schedule fetch request and SHALL display an error indication that the user's role could not be determined.
7. IF the backend returns one or more entries that do not match the authenticated user's role-scoped visibility rules from criteria 1–4, THEN THE Schedule_Frontend SHALL exclude those entries from rendering and SHALL log the discrepancy via the existing logger utility.

#### Correctness Properties (for property-based testing)

- **Read containment by role**: For any user `u` with role `r` and any week `w`, the rendered entry set is a subset of the entry set returned by the backend for `(u, r, w)`.
- **Manager ⊇ Read_Only on shared scope**: For any Instructor `i` and any of `i`'s students `s`, the entry set rendered to `i` for week `w` includes every entry whose `studentProfileId` equals `s.id` and `instructorId` equals `i.id`.

### Requirement 6: Role-Aware Action Visibility

**User Story:** As a Student or Parent, I want mutation controls hidden from my view, so that I am not offered actions I am not allowed to perform.

#### Acceptance Criteria

1. WHILE the authenticated Role is a Read_Only_Role, THE Weekly_Calendar_View SHALL NOT render visible and activatable instances of the "Create custom entry" control, the "Manage series" control, the per-Entry_Card edit control, or the per-Entry_Card delete control.
2. WHILE the authenticated Role is a Read_Only_Role, THE Entry_Card SHALL NOT respond to pointer-down, touch, or keyboard reorder input (Shift+Arrow keys) with drag/move behavior.
3. WHILE the authenticated Role is a Manager_Role, THE Weekly_Calendar_View SHALL render visible and activatable "Create custom entry" and "Manage series" controls.
4. WHILE the authenticated Role is a Manager_Role, THE Entry_Card SHALL respond to pointer-down, touch, and Shift+Arrow keyboard input with drag/move behavior, AND THE Entry_Detail_View for that card SHALL expose visible and activatable edit and delete controls.
5. WHILE the authenticated Role has not yet been resolved (auth state is loading, unknown, or failed), THE Weekly_Calendar_View SHALL hide all mutation controls and SHALL NOT respond to drag/move input until the Role is successfully resolved.
6. IF a Read_Only_Role session issues a mutation request to the Schedule API and the backend returns a 403 response, THEN THE Schedule_Frontend SHALL surface the standard 403 error indication defined in Requirement 18 and SHALL NOT retry the request.

### Requirement 7: Custom Entry Creation

**User Story:** As an Instructor or Admin, I want to create custom schedule entries with a title, subject, time range, student/instructor assignment, color, and notes, so that I can put non-session, non-task time blocks on the calendar.

#### Acceptance Criteria

1. WHEN a Manager_Role activates the "Create custom entry" control, THE Custom_Entry_Modal SHALL open with empty fields for title, subject, startAt, endAt, studentProfileId, instructorId, and notes, and with the color field set to a default color value.
2. THE Custom_Entry_Modal SHALL require title (1–100 characters after trim), subject (1–100 characters after trim), startAt (ISO 8601 datetime), endAt (ISO 8601 datetime), studentProfileId (non-empty), and instructorId (non-empty) before its submit control is enabled; color and notes (0–1000 characters) are optional.
3. IF the user submits the Custom_Entry_Modal with `endAt` not strictly after `startAt`, THEN THE Custom_Entry_Modal SHALL display an inline validation error indicating that endAt must be after startAt and SHALL NOT issue the API request.
4. WHEN the user submits a valid Custom_Entry_Modal, THE Schedule_API_Client SHALL call `POST /api/v1/schedule/custom` with a request body containing `entryType: "custom"`, title, subject, startAt, endAt, studentProfileId, instructorId, color, and notes.
5. WHEN `POST /api/v1/schedule/custom` returns a 2xx response, THE Weekly_Calendar_View SHALL refetch the displayed week and close the Custom_Entry_Modal.
6. IF the response body contains a non-empty `conflicts` array, THEN THE Schedule_Frontend SHALL render the Conflict_Warning_Banner listing the title and time range of each conflicting entry without preventing the entry from being created.
7. IF `POST /api/v1/schedule/custom` returns a non-2xx response, THEN THE Custom_Entry_Modal SHALL remain open with all entered field values preserved and SHALL display the server-provided error message inline.

### Requirement 8: Conflict Warning Display

**User Story:** As a Manager_Role creating or editing entries, I want to see overlapping entries called out as warnings, so that I can decide whether to keep the new schedule.

#### Acceptance Criteria

1. WHEN a create or update response contains a `conflicts` array with one or more items, THE Conflict_Warning_Banner SHALL render within 500 milliseconds, listing each conflicting entry's title and start/end times formatted in the user's local timezone.
2. THE Conflict_Warning_Banner SHALL display a dismiss control (button or icon with accessible label "Dismiss conflicts banner") that, when activated, removes the banner from view.
3. THE Conflict_Warning_Banner SHALL NOT block, cancel, or roll back the underlying create or update operation.
4. WHEN a create or update response contains an empty `conflicts` array or omits the `conflicts` field, THE Conflict_Warning_Banner SHALL NOT be rendered.
5. WHILE the `conflicts` array contains more than 10 items, THE Conflict_Warning_Banner SHALL display the first 10 items and a summary indicator stating the total count of additional conflicts.

#### Correctness Properties (for property-based testing)

- **Display fidelity**: For any response with `conflicts = [c1, c2, ..., cn]` where `n <= 10`, the rendered banner SHALL contain exactly `n` listed conflict items whose IDs match `[c1.id, ..., cn.id]`.
- **No silent drop**: For any response with `conflicts.length > 0`, the banner SHALL be rendered (not suppressed) regardless of `Entry_Type` or color.

### Requirement 9: Drag-and-Drop Reschedule

**User Story:** As an Instructor or Admin, I want to drag an Entry_Card to a new day or time on the grid, so that I can reschedule entries without opening a form.

#### Acceptance Criteria

1. WHILE the authenticated Role is a Manager_Role, THE Drag_Reschedule_Handler SHALL allow Entry_Cards to be picked up via pointer-down (≥150 ms hold) or Shift+Arrow keyboard input and dropped onto another grid cell within the visible Calendar_Grid.
2. WHEN an Entry_Card is dropped on a new cell, THE Drag_Reschedule_Handler SHALL compute new `startAt` and `endAt` values such that `newEndAt − newStartAt` equals the original `endAt − startAt` (duration preserved exactly).
3. WHEN an Entry_Card is dropped, THE Schedule_API_Client SHALL call `PATCH /api/v1/schedule/:id` with the new `startAt` and `endAt` within 500 milliseconds of the drop.
4. WHEN `PATCH /api/v1/schedule/:id` returns a 2xx response within 10 seconds, THE Weekly_Calendar_View SHALL update the moved Entry_Card to its new position.
5. IF `PATCH /api/v1/schedule/:id` returns a non-2xx response, fails, or does not respond within 10 seconds, THEN THE Weekly_Calendar_View SHALL revert the Entry_Card to its previous position and surface an error toast describing the failure.
6. IF the patched entry has `entryType: "task_due"` and the PATCH returns 2xx, THEN THE Weekly_Calendar_View SHALL display a brief toast informing the user that the linked task's `dueDate` was updated by the backend.
7. WHEN a `PATCH` response includes a non-empty `conflicts` array, THE Schedule_Frontend SHALL render the Conflict_Warning_Banner without reverting the move.
8. IF a drop target falls outside the Calendar_Grid bounds or onto an invalid (e.g., past a non-droppable region), THEN THE Drag_Reschedule_Handler SHALL leave the entry in its original position and SHALL NOT issue a PATCH request.

#### Correctness Properties (for property-based testing)

- **Duration invariance**: For any drag from `(startAt, endAt)` to drop offset `Δ`, the new entry SHALL satisfy `newEndAt - newStartAt == endAt - startAt`.
- **Drop-target consistency**: For any drop on grid cell `(day, hour)`, the new `startAt`'s UTC day equals `day` and its UTC hour equals `hour` (within the grid's row resolution).
- **Round-trip move**: For any drag of `Δ` followed immediately by a drag of `−Δ` on the same Entry_Card, the resulting `startAt`/`endAt` SHALL equal the original values.
- **Revert on failure**: For any failed `PATCH`, the rendered position of the Entry_Card SHALL equal its position before the drag began.

### Requirement 10: Recurring Series Creation

**User Story:** As an Instructor or Admin, I want to create a recurring series of schedule entries from a single form, so that I do not have to add each weekly slot manually.

#### Acceptance Criteria

1. WHEN a Manager_Role activates the "Create series" control inside the Series_Modal, THE Series_Modal SHALL show fields for studentProfileId, instructorId, templateTitle (1–120 chars), subject (1–120 chars), frequency (`weekly` or `biweekly`), daysOfWeek (multi-select from 0–6 with 0 = Sunday), startTime (`HH:MM` UTC), durationMin (15–480 minutes), startsOn, and endsOn.
2. THE Series_Modal SHALL require all fields listed in criterion 1 to be filled and SHALL require `daysOfWeek` to contain at least one selection before the submit control is enabled.
3. IF the user submits the Series_Modal with `endsOn` not strictly after `startsOn`, with `startTime` not matching `HH:MM` 24-hour format, with `durationMin` outside the 15–480 range, or with `templateTitle`/`subject` outside their character bounds, THEN THE Series_Modal SHALL display inline validation errors next to the offending fields and SHALL NOT issue the API request.
4. WHEN the user submits a valid Series_Modal, THE Schedule_API_Client SHALL call `POST /api/v1/schedule/series` with the form values, and THE Series_Modal SHALL disable its submit control until the response is received to prevent duplicate submissions.
5. WHEN `POST /api/v1/schedule/series` returns a 2xx response, THE Weekly_Calendar_View SHALL refetch the displayed week so that newly materialized entries appear, AND THE Series_Modal SHALL close.
6. IF `POST /api/v1/schedule/series` returns a non-2xx response, THEN THE Series_Modal SHALL remain open with all entered field values preserved, SHALL re-enable the submit control, and SHALL display the server-provided error message inline.
7. THE Series_Modal SHALL display an explanatory note stating that the series materializes entries up to 12 weeks ahead.

### Requirement 11: Recurring Series Listing

**User Story:** As an Instructor or Admin, I want to see all recurring series I manage in one list, so that I can pick one to view, edit, or delete.

#### Acceptance Criteria

1. WHEN the Series_Modal opens in list mode, THE Schedule_API_Client SHALL call `GET /api/v1/schedule/series` (Instructor receives only series they created; Admin receives all series) and SHALL render the returned list within 5 seconds of the modal opening.
2. WHILE the series list response contains one or more series, THE Series_Modal SHALL display each series row with templateTitle, subject, frequency, daysOfWeek, startTime, durationMin, and startsOn, AND SHALL display endsOn when present or an "Ongoing" indicator when endsOn is null or absent.
3. WHEN the user selects a single series from the rendered list, THE Schedule_API_Client SHALL call `GET /api/v1/schedule/series/:id` using the selected series identifier and SHALL render the full series detail consisting of all fields listed in criterion 2 plus any additional fields returned by the endpoint.
4. IF the series list response contains zero series, THEN THE Series_Modal SHALL display an empty-state message indicating that no recurring series are available to the authenticated user.
5. IF the `GET /api/v1/schedule/series` call fails, returns a non-success response, or does not respond within 5 seconds, THEN THE Series_Modal SHALL remain open, SHALL display an error indication that the series list could not be loaded, and SHALL expose a retry control that re-issues the request when activated.
6. IF the `GET /api/v1/schedule/series/:id` call fails, returns a not-found response, or does not respond within 5 seconds, THEN THE Series_Modal SHALL preserve the previously rendered list, SHALL display an error indication that the selected series detail could not be loaded, and SHALL allow the user to select another series without closing the modal.

### Requirement 12: Recurring Series Update

**User Story:** As an Instructor or Admin, I want to edit a series and have the schedule reflect the change for upcoming weeks, so that I can adjust ongoing arrangements without rebuilding them.

#### Acceptance Criteria

1. WHEN a Manager_Role submits an edit on a series with all field validations passing, THE Schedule_API_Client SHALL call `PATCH /api/v1/schedule/series/:id` within 2 seconds, including only fields whose values differ from the currently loaded series state, with a 10-second request timeout.
2. WHILE the Series_Modal is in edit mode, THE Series_Modal SHALL display a confirmation note stating that updating the series soft-deletes future entries (those with startAt on or after the current date) and re-materializes the next 12 weeks.
3. WHEN `PATCH /api/v1/schedule/series/:id` returns a 2xx response, THE Weekly_Calendar_View SHALL refetch the displayed week within 2 seconds, AND THE Series_Modal SHALL close.
4. IF `PATCH /api/v1/schedule/series/:id` returns a non-2xx response, fails, or does not respond within 10 seconds, THEN THE Series_Modal SHALL remain open with all entered field values preserved and SHALL display the server-provided error message inline.
5. IF the user submits an edit with required fields empty or with field values violating their length/format/range bounds defined in Requirement 10 criterion 1, THEN THE Series_Modal SHALL display inline validation errors next to the offending fields and SHALL NOT issue the PATCH request.

### Requirement 13: Recurring Series Deletion

**User Story:** As an Instructor or Admin, I want to delete a recurring series and have its future entries removed, so that I can stop a recurring arrangement cleanly.

#### Acceptance Criteria

1. WHEN a Manager_Role activates the delete control on a series, THE Series_Modal SHALL show a confirmation prompt that includes the series templateTitle, a confirm action, and a cancel action.
2. WHEN the Manager_Role activates the cancel action on the confirmation prompt, THE Series_Modal SHALL dismiss the confirmation prompt and retain the series unchanged.
3. WHEN the Manager_Role confirms deletion, THE Schedule_API_Client SHALL call `DELETE /api/v1/schedule/series/:id` with a 30-second request timeout.
4. WHEN `DELETE /api/v1/schedule/series/:id` returns a 2xx response, THE Weekly_Calendar_View SHALL refetch the displayed week within 5 seconds so that soft-deleted future entries disappear.
5. IF `DELETE /api/v1/schedule/series/:id` returns a non-2xx response, fails, or does not respond within 30 seconds, THEN THE Series_Modal SHALL retain the series in the list and SHALL display an error indication that the deletion failed.

### Requirement 14: Single-Entry Detail View

**User Story:** As an LMS user, I want to click an Entry_Card and see its full details, so that I can read the title, subject, time range, status, notes, and any linked session or task.

#### Acceptance Criteria

1. WHEN the user activates an Entry_Card, THE Schedule_API_Client SHALL call `GET /api/v1/schedule/:id` with a 10-second request timeout and THE Entry_Detail_View SHALL render the response within 1 second of receipt.
2. WHILE the `GET /api/v1/schedule/:id` request is in flight, THE Entry_Detail_View SHALL display a loading indicator.
3. THE Entry_Detail_View SHALL display `title`, `subject`, `entryType`, `status`, and `startAt` and `endAt` formatted as ISO 8601 datetimes in the user's local timezone.
4. IF the entry has a non-empty `notes` field, THEN THE Entry_Detail_View SHALL display the notes; otherwise THE Entry_Detail_View SHALL omit the notes section.
5. IF the entry has a non-empty `color` field, THEN THE Entry_Detail_View SHALL display the color value; otherwise THE Entry_Detail_View SHALL omit the color display.
6. IF the entry has a non-empty `sessionId`, THEN THE Entry_Detail_View SHALL display a navigable link to the session page corresponding to that session ID.
7. IF the entry has a non-empty `taskId`, THEN THE Entry_Detail_View SHALL display a navigable link to the task page corresponding to that task ID.
8. WHILE the authenticated Role is a Manager_Role and `entryType` equals `custom`, THE Entry_Detail_View SHALL render visible and activatable edit and delete controls; otherwise THE Entry_Detail_View SHALL NOT render those controls.
9. IF `GET /api/v1/schedule/:id` returns a 404 response, THEN THE Entry_Detail_View SHALL display a "not found" message and SHALL offer a control that closes the view and returns to the Weekly_Calendar_View.
10. IF `GET /api/v1/schedule/:id` fails for any other reason or does not respond within 10 seconds, THEN THE Entry_Detail_View SHALL display an error indication and SHALL expose a retry control that re-issues the request when activated.

### Requirement 15: Custom Entry Edit

**User Story:** As an Instructor or Admin, I want to edit an existing custom entry's fields from its detail view, so that I can correct mistakes without recreating the entry.

#### Acceptance Criteria

1. WHEN a Manager_Role activates the edit control on a `custom` entry, THE Custom_Entry_Modal SHALL open within 500 milliseconds pre-filled with the entry's title, subject, startAt, endAt, studentProfileId, instructorId, color, and notes values from the stored entry record.
2. WHEN a Manager_Role submits the Custom_Entry_Modal in edit mode with all field validations passing, THE Schedule_API_Client SHALL issue a PATCH request to `/api/v1/schedule/:id` containing only the fields whose values differ from the originally loaded entry.
3. IF the user submits with `endAt` not strictly after `startAt`, THEN THE Custom_Entry_Modal SHALL display an inline validation error indicating the end time must be after the start time, SHALL preserve all entered field values, and SHALL NOT issue the PATCH request.
4. IF the user submits with the title field empty or exceeding 100 characters after trim, or subject empty or exceeding 100 characters after trim, THEN THE Custom_Entry_Modal SHALL display an inline validation error indicating the field is invalid, SHALL preserve all entered field values, and SHALL NOT issue the PATCH request.
5. WHEN `PATCH /api/v1/schedule/:id` returns a 2xx response, THE Weekly_Calendar_View SHALL refetch the entries for the currently displayed week and THE Custom_Entry_Modal SHALL close.
6. IF `PATCH /api/v1/schedule/:id` returns a non-2xx response or does not complete within 10 seconds, THEN THE Custom_Entry_Modal SHALL display an error indication describing the failure, SHALL remain open with all entered field values preserved, and THE Weekly_Calendar_View SHALL NOT refetch.
7. WHILE a PATCH request initiated by the Custom_Entry_Modal is in flight, THE Custom_Entry_Modal SHALL disable its submit control to prevent duplicate submissions.

### Requirement 16: Custom Entry Delete

**User Story:** As an Instructor or Admin, I want to delete a custom entry I created, so that I can remove time blocks that are no longer needed.

#### Acceptance Criteria

1. WHEN a Manager_Role activates the delete control on an Entry_Card, THE Entry_Detail_View SHALL display a confirmation prompt that includes the entry title, a confirm action, and a cancel action.
2. WHEN the Manager_Role activates the cancel action on the confirmation prompt, THE Entry_Detail_View SHALL dismiss the confirmation prompt and retain the Entry_Card unchanged.
3. WHEN the Manager_Role confirms deletion, THE Schedule_API_Client SHALL call `DELETE /api/v1/schedule/:id` for the selected entry within 1 second.
4. WHEN `DELETE /api/v1/schedule/:id` returns a 2xx response, THE Weekly_Calendar_View SHALL remove the Entry_Card from the grid and refetch the displayed week within 2 seconds.
5. IF `DELETE /api/v1/schedule/:id` returns a non-2xx response, THEN THE Weekly_Calendar_View SHALL retain the Entry_Card and display an error message indicating the deletion failed.

### Requirement 17: NotificationBell Support for Schedule Notifications

**User Story:** As an LMS user, I want schedule reminder, schedule update, and new schedule entry notifications to appear in the existing notification bell, so that all my notifications live in one place.

#### Acceptance Criteria

1. THE NotificationBell SHALL render notifications whose `type` equals `schedule_reminder`, `schedule_updated`, or `new_schedule_entry` interleaved with existing notification types, ordered by their existing notification timestamp ordering rules.
2. THE NotificationBell SHALL display a distinct visible icon for each of `schedule_reminder`, `schedule_updated`, and `new_schedule_entry`, where each icon is mutually distinct from the other two and from the icons of all pre-existing notification types.
3. WHEN a user activates a schedule notification (via click, tap, or Enter/Space keyboard) that has a `link` pointing to a schedule entry, THE NotificationBell SHALL navigate the user to the corresponding Entry_Detail_View within 500 milliseconds and SHALL mark the notification as read.
4. IF the activated schedule notification has a missing, empty, or invalid `link` (the linked entry returns 404 or is otherwise inaccessible), THEN THE NotificationBell SHALL mark the notification as read, SHALL NOT navigate, and SHALL display an error indication that the linked entry is unavailable.
5. THE NotificationBell SHALL count unread `schedule_reminder`, `schedule_updated`, and `new_schedule_entry` notifications in the same unread-count badge it already maintains for other types, and the badge count SHALL update within 1 second of any change to the unread state.

### Requirement 18: Error Handling for Schedule API Responses

**User Story:** As an LMS user, I want clear, role-appropriate messages when a schedule operation fails, so that I understand what happened and what to do next.

#### Acceptance Criteria

1. IF the Schedule_API_Client receives a 401 response, THEN THE Schedule_Frontend SHALL trigger the existing `useApiRequest` token-refresh flow and, if refresh fails, redirect the user to `/login`.
2. IF the Schedule_API_Client receives a 403 response, THEN THE Schedule_Frontend SHALL display an inline error message stating that the user is not authorized for that action and SHALL NOT retry the request automatically.
3. IF the Schedule_API_Client receives a 404 response on `GET /api/v1/schedule/:id` or `GET /api/v1/schedule/series/:id`, THEN THE Entry_Detail_View or Series_Modal SHALL display a "not found" message and SHALL render a control that returns the user to the Weekly_Calendar_View when activated.
4. IF the Schedule_API_Client receives a 400 response with a non-empty error message body, THEN THE originating modal SHALL display the server-provided error message inline.
5. IF the Schedule_API_Client receives a 400 response on `POST /api/v1/schedule/custom` indicating `entryType` is not `custom`, THEN THE Custom_Entry_Modal SHALL display an error stating that this endpoint accepts custom entries only.
6. IF the Schedule_API_Client receives a 400 response indicating `endAt` is not after `startAt`, THEN the originating modal SHALL highlight both time fields and display the message "End time must be after start time."
7. IF the Schedule_API_Client receives a 400 response with an empty or missing error message body, THEN THE originating modal SHALL display a generic "The request was invalid" inline error message.
8. IF the Schedule_API_Client receives a 5xx response, THEN THE Schedule_Frontend SHALL display an inline error message indicating a server error occurred and SHALL expose a retry control that re-issues the request when activated.
9. IF the Schedule_API_Client request fails due to a network error or does not respond within its configured timeout, THEN THE Schedule_Frontend SHALL display an inline error message indicating a connectivity issue and SHALL preserve any unsaved user input in the originating modal.

### Requirement 19: Automatic Sync from Sessions and Tasks

**User Story:** As an LMS user, I want changes I make in the Sessions or Tasks pages to be reflected on the schedule the next time I open it, so that the calendar stays consistent without manual refresh.

#### Acceptance Criteria

1. WHEN the Weekly_Calendar_View becomes visible after navigation from another page, THE Schedule_Frontend SHALL refetch entries for the displayed week's Monday-to-Sunday UTC bounds via the Schedule_API_Client.
2. WHEN the user activates a manual "Refresh" control on the Weekly_Calendar_View, THE Schedule_API_Client SHALL refetch entries for the displayed week, AND the Refresh control SHALL be disabled until the response is received to prevent rapid duplicate fetches.
3. THE Schedule_Frontend SHALL NOT call any session endpoint (`/api/v1/sessions/*`) or task endpoint (`/api/v1/tasks/*`) for the purpose of synchronizing the schedule, because the backend automatically maintains schedule entries when sessions or tasks change.
4. WHILE a refetch initiated by criterion 1 or criterion 2 is in flight, THE Weekly_Calendar_View SHALL display a non-blocking loading indicator and SHALL continue to display the previously rendered entries until the response is applied.

#### Correctness Properties (for property-based testing)

- **Eventual consistency on revisit**: For any sequence of session or task mutations performed on other pages followed by navigation back to the Weekly_Calendar_View, the rendered entries for the displayed week SHALL equal the backend's response to `GET /api/v1/schedule` for that week's bounds.

### Requirement 20: Accessibility

**User Story:** As a keyboard or assistive-technology user, I want to navigate and operate the weekly schedule without a mouse, so that I can use the feature on equal footing.

#### Acceptance Criteria

1. THE Calendar_Grid SHALL expose `role="grid"` on the grid container, `role="row"` on each day row, and `role="gridcell"` on each Entry_Card host cell.
2. WHEN the user presses the Right Arrow or Left Arrow key while focus is inside the Calendar_Grid, THE Calendar_Grid SHALL move focus to the next or previous day cell in the same row respectively, AND SHALL keep focus on the current cell when focus is already on the last or first cell of that row.
3. WHEN the user presses the Down Arrow or Up Arrow key while focus is inside the Calendar_Grid, THE Calendar_Grid SHALL move focus to the next or previous time slot in the same day column respectively, AND SHALL keep focus on the current cell when focus is already on the last or first time slot of that column.
4. WHEN the user presses Enter or Space on a focused Entry_Card, THE Schedule_Frontend SHALL open the Entry_Detail_View for that entry within 500 milliseconds.
5. WHEN a user with Manager_Role presses Shift+ArrowUp, Shift+ArrowDown, Shift+ArrowLeft, or Shift+ArrowRight on a focused Entry_Card, THE Drag_Reschedule_Handler SHALL move the entry by one grid cell in the corresponding direction using the same PATCH request semantics as a drag reschedule.
6. IF a Shift+Arrow reschedule would move an Entry_Card outside the Calendar_Grid bounds or onto a slot that is not a valid drop target, THEN THE Drag_Reschedule_Handler SHALL leave the entry unchanged and SHALL display an error indication explaining that the move was rejected.
7. WHILE the Custom_Entry_Modal, Series_Modal, or Entry_Detail_View is open, THE Schedule_Frontend SHALL constrain Tab and Shift+Tab navigation so that focus cycles only through the modal's interactive controls and does not reach controls outside the modal.
8. WHEN the Custom_Entry_Modal, Series_Modal, or Entry_Detail_View closes, THE Schedule_Frontend SHALL move keyboard focus back to the control that triggered its opening.

### Requirement 21: Responsive Layout

**User Story:** As a mobile LMS user, I want a usable agenda fallback when the screen is too narrow for a seven-column grid, so that I can still read and interact with my schedule on a phone.

#### Acceptance Criteria

1. WHILE the viewport width is less than 768 CSS pixels (exclusive), THE Weekly_Calendar_View SHALL render the Agenda_View instead of the Calendar_Grid.
2. THE Agenda_View SHALL list entries belonging to the currently displayed Saturday-to-Friday week, grouped by date in ascending date order starting from Saturday, with entries within the same date sorted by `startAt` ascending, and using the same color coding and card structure (subject header, instructor avatar, name, status/duration badge) as the Calendar_Grid.
3. WHILE the Agenda_View is rendered, THE Drag_Reschedule_Handler SHALL be disabled and reschedule SHALL be performed only via the Entry_Detail_View edit form.
4. WHEN the user activates the prev/next/today controls on the Agenda_View, THE Weekly_Calendar_View SHALL update the Agenda_View within 1 second to show the newly selected week.
5. WHEN the viewport width crosses the 768-pixel boundary during a session, THE Weekly_Calendar_View SHALL switch between Calendar_Grid and Agenda_View within 500 milliseconds and SHALL preserve the currently displayed week.
6. WHEN the user activates (taps, clicks, or presses Enter/Space on) an entry row in the Agenda_View, THE Schedule_Frontend SHALL open the Entry_Detail_View for that entry.
7. WHEN the Agenda_View has zero entries for the displayed week, THE Agenda_View SHALL display an empty-state message indicating that no entries exist for the displayed week.
