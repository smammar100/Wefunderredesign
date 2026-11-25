/**
 * The pieces every screen is made of.
 *
 * Written once because the alternative is what was here before: ninety-nine
 * `text-xs`, four radii and six paddings chosen a component at a time. The
 * look of a product is mostly consistency, and consistency is mostly not
 * deciding the same thing twice.
 *
 * The reference point for density and restraint is a tool people keep open
 * all day — small type, tight rows, hairlines instead of boxes, colour only
 * where it means something. The tokens are ours; the discipline is borrowed.
 */

/*
 * One file per family under `kit/`; this one gathers them, so every screen
 * imports the kit from one place.
 */

export { Row, RowActions, holdUntilMoved, Over, Fluid } from './kit/rows.jsx'
export { quietLook, Button, Field, Kbd, Badge, Switch, Toggle } from './kit/controls.jsx'
export { notALogin, asTyped, urlField, linkField, findField, othersEmail, SecretInput } from './kit/fields.jsx'
export {
  LIST_MARKS,
  PROJECT_MARKS,
  MARK_SAID,
  LIST_TINTS,
  TINT_SAID,
  TINT_AT,
  Dot,
  AgentFaceMark,
  MarkRails,
  DocMark,
} from './kit/marks.jsx'
export { Avatar, agentLabel } from './kit/avatar.jsx'
export { AgentDoing, AgentDoingOf, doingSaid, howLong } from './kit/doing.jsx'
export type { Presence } from './kit/avatar.jsx'
export {
  Header,
  Empty,
  GroupLabel,
  Hairline,
  Panel,
  SectionHead,
  PageTitle,
  EmptyState,
  ProjectMarksContext,
  ProjectChip,
} from './kit/page.jsx'
export { useListKeys, useSideFade, Segments, ToolbarSlot, Toolbar, Find } from './kit/lists.jsx'
export { Popup, Select } from './kit/select.jsx'
export { useNaming, Composer } from './kit/composer.jsx'
export { WIDE, useWide, PHONE, usePhone, useWidth, SHUT, COLUMN_MS, useColumn, Resizer } from './kit/layout.jsx'
export { Scrim, Dialog } from './kit/dialog.jsx'
export type { Framed } from './kit/dialog.jsx'
export { inWindow, tintOf, LabelChip, LabelPick } from './kit/labels.jsx'
export type { Label } from './kit/labels.jsx'
export { whoOf, namesOf, WhoPick, ProjectPick } from './kit/pickers.jsx'
export { PRIORITIES, PriorityMark, PRIORITY_SAID, PriorityPick } from './kit/priority.jsx'
export type { Priority } from './kit/priority.jsx'
export { DuePick, DateButton, writtenDay, type RepeatField } from './kit/dates.jsx'
export { RepeatMark } from './kit/repeat.jsx'
export { CyclePick, Status } from './kit/status.jsx'
export type { Placed } from './kit/status.jsx'
export { SHOWING, SLIDING, useShown, Popover, Choice, HowLong } from './kit/popover.jsx'
export { useAttach } from './kit/attach.jsx'
