<script lang="ts">
	import { page } from '$app/state';
	import { useLiveQuery, eq } from '@tanstack/svelte-db';
	import { courses, courseWork, submissions } from '#lib/db/collections.ts';
	import { topicById } from '#lib/db/queries.ts';
	import { gradePercent, statusLabel, summarize } from '#lib/work.ts';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Progress } from '#lib/components/ui/progress/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import StatusBadge from '#lib/components/status-badge.svelte';
	import Attachments from '#lib/components/attachments.svelte';
	import RichText from '#lib/components/rich-text.svelte';
	import { formatDateLong, formatDateTime, formatDue, formatRelative } from '#lib/format.ts';
	import { displayName } from '#lib/course.ts';
	import CourseDot from '#lib/components/course-dot.svelte';
	import { withAuthUser } from '#lib/link-authuser.svelte.ts';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import FactsGrid from './facts-grid.svelte';
	import SubmissionFiles from './submission-files.svelte';
	import SubmissionActions from './submission-actions.svelte';
	import PrivateComments from './private-comments.svelte';

	const row = useLiveQuery({
		query: (q) =>
			q
				.from({ w: courseWork })
				.where(({ w }) => eq(w.id, page.params.workId))
				.innerJoin({ c: courses }, ({ w, c }) => eq(w.courseId, c.id))
				.leftJoin({ s: submissions }, ({ w, s }) => eq(w.id, s.courseWorkId))
				.findOne()
	});
	const topicQuery = useLiveQuery({ query: (q) => topicById(q, row.data?.w.topicId) });

	const w = $derived(
		row.data ? summarize(row.data.w, row.data.s ?? undefined, displayName(row.data.c)) : null
	);
	const sub = $derived(row.data?.s ?? null);
	const dueText = $derived(
		!w || w.dueAt === undefined
			? 'No due date'
			: w.hasDueTime
				? formatDateTime(w.dueAt)
				: formatDateLong(w.dueAt, true)
	);
	const facts = $derived(
		w
			? [
					{
						label: 'Due',
						value: dueText,
						hint: w.dueAt !== undefined ? formatDue(w.dueAt, w.hasDueTime) : undefined
					},
					{ label: 'Points', value: w.maxPoints ? String(w.maxPoints) : 'Ungraded' },
					{ label: 'Topic', value: topicQuery.data?.name ?? '–' },
					{ label: 'Posted', value: formatRelative(w.createdAt) }
				]
			: []
	);
</script>

{#if w}
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div class="min-w-0">
			<a
				href={`/courses/${w.courseId}`}
				class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
			>
				<CourseDot id={w.courseId} />{w.courseName}
			</a>
			<h1 class="mt-1 text-2xl font-semibold tracking-tight text-balance">{w.title}</h1>
			<div class="mt-2 flex items-center gap-2">
				<StatusBadge work={w} />
			</div>
		</div>
		{#if w.alternateLink}
			<Button href={withAuthUser(w.alternateLink)} target="_blank" rel="noreferrer"
				>Open in Classroom <ExternalLinkIcon data-icon="inline-end" /></Button
			>
		{/if}
	</div>

	<FactsGrid {facts} />

	<div class="mt-8 grid gap-10 lg:grid-cols-[3fr_2fr]">
		<div>
			{#if w.description}
				<h2 class="text-base font-semibold tracking-tight">Instructions</h2>
				<RichText
					text={w.description}
					html={w.html}
					class="mt-2 max-w-[70ch] text-sm text-pretty break-words"
				/>
			{:else}
				<p class="text-sm text-muted-foreground">No instructions were given.</p>
			{/if}
			{#if w.materials.length}
				<h2 class="mt-8 text-base font-semibold tracking-tight">Attachments</h2>
				<div class="mt-2 max-w-lg"><Attachments items={w.materials} /></div>
			{/if}
		</div>
		<aside>
			<h2 class="text-base font-semibold tracking-tight">Your work</h2>
			{#if sub}
				<p class="mt-1 text-sm text-muted-foreground">
					{statusLabel[w.status]}{#if sub.late}
						· late{/if} · updated {formatRelative(sub.updatedAt)}
				</p>
				{#if w.assignedGrade !== undefined && w.maxPoints}
					<div class="mt-4">
						<div class="flex items-baseline justify-between text-sm">
							<span class="text-muted-foreground">Grade</span>
							<span class="font-medium tabular-nums"
								>{w.assignedGrade}<span class="text-muted-foreground">/{w.maxPoints}</span></span
							>
						</div>
						<Progress value={gradePercent(w) ?? 0} class="mt-2" />
					</div>
				{/if}
				<Separator class="my-4" />
				<SubmissionFiles work={w} fallback={sub.attachments} />
				<SubmissionActions work={w} submission={sub} />
				<Separator class="my-6" />
				<PrivateComments work={w} />
			{:else}
				<p class="mt-1 text-sm text-muted-foreground">No submission record yet.</p>
			{/if}
		</aside>
	</div>
{/if}
