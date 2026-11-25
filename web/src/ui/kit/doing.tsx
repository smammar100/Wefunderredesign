import type { AgentStatus, PersonInWorkspace } from '@tracker/shared-schema'
import { KIT as W } from '../../words/kit.js'
import { minutesAt, useWorkingOf, useWorkingOn } from '../../data/working.js'

/** How long, as the line says it: minutes, then hours and minutes. */
export function howLong(status: AgentStatus, now: number): string {
  const m = minutesAt(status, now)
  return m < 60 ? W.minutes(m) : W.hours(Math.floor(m / 60), m % 60)
}

/** The words of the line: Working · 14 min · reading … */
export function doingSaid(status: AgentStatus, now: number): string {
  return `${W.workingFor(howLong(status, now))} · ${status.doing}`
}

/**
 * What an agent says it is doing now, on one task: *Working · 14 min ·
 * reading server/src/http/tasks.ts*, cut short where it runs out of room
 * and whole on the pointer. No face of its
 * own: the agent's face is already on the card or the row, ringed while it
 * works, and a second one beside the words was the same face twice.
 *
 * Nothing at all when no agent says it is at the task. One line, the height
 * of the text beside it, so the card or row it sits in is the same height
 * with it and without it.
 */
export function AgentDoing({
  taskId,
  people,
  named = false,
  className = '',
  otherwise = null,
}: {
  taskId: string
  people: PersonInWorkspace[]
  /** Its name in front, where the line stands alone. */
  named?: boolean
  className?: string
  /** What the place says when no agent says anything. */
  otherwise?: React.ReactNode
}) {
  const { status, now } = useWorkingOn(taskId)
  if (!status) return <>{otherwise}</>
  return <DoingLine status={status} now={now} people={people} named={named} className={className} />
}

/** The same, for one agent wherever it is — its own page. */
export function AgentDoingOf({
  agentId,
  children,
}: {
  agentId: string
  children: (status: AgentStatus | null, said: string) => React.ReactNode
}) {
  const { status, now } = useWorkingOf(agentId)
  return <>{children(status, status ? doingSaid(status, now) : '')}</>
}

function DoingLine({
  status,
  now,
  people,
  named,
  className,
}: {
  status: AgentStatus
  now: number
  people: PersonInWorkspace[]
  named: boolean
  className: string
}) {
  const agent = people.find((p) => p.actor_id === status.agent_id)
  const said = doingSaid(status, now)
  const whole = agent && named ? `${agent.name} · ${said}` : said
  /* Named, it stands in for the line it replaces, in that line's type;
     otherwise it is a quiet fact beside a handle or a title. */
  const tone = named ? 'text-ink' : 'text-sm text-ink-3'
  return (
    <span
      data-agent-doing={status.agent_id}
      title={agent ? `${agent.name} · ${said}` : said}
      className={`flex min-w-0 items-center gap-1 ${tone} ${className}`}
    >
      <span className="truncate tabular-nums">{whole}</span>
    </span>
  )
}
