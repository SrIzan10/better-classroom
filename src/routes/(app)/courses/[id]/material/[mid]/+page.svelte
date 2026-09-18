<script lang="ts">
	import { page } from '$app/state';
	import { useLiveQuery, eq } from '@tanstack/svelte-db';
	import { courses, materials } from '#lib/db/collections.ts';
	import { topicById } from '#lib/db/queries.ts';
	import { Button } from '#lib/components/ui/button/index.js';
	import Attachments from '#lib/components/attachments.svelte';
	import RichText from '#lib/components/rich-text.svelte';
	import { formatRelative } from '#lib/format.ts';
	import { displayName } from '#lib/course.ts';
	import CourseDot from '#lib/components/course-dot.svelte';
	import { withAuthUser } from '#lib/link-authuser.svelte.ts';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';

	const row = useLiveQuery({
		query: (q) =>
			q
				.from({ m: materials })
				.where(({ m }) => eq(m.id, page.params.mid))
				.innerJoin({ c: courses }, ({ m, c }) => eq(m.courseId, c.id))
				.findOne()
	});
	const topicQuery = useLiveQuery({ query: (q) => topicById(q, row.data?.m.topicId) });
	const m = $derived(row.data?.m);
	const courseName = $derived(row.data ? displayName(row.data.c) : '');
</script>

{#if m}
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div class="min-w-0">
			<a
				href={`/courses/${m.courseId}`}
				class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
			>
				<CourseDot id={m.courseId} />{courseName}
			</a>
			<h1 class="mt-1 text-2xl font-semibold tracking-tight text-balance">{m.title}</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				Material{#if topicQuery.data}
					· {topicQuery.data.name}{/if} · posted {formatRelative(m.createdAt)}
			</p>
		</div>
		{#if m.alternateLink}
			<Button
				variant="outline"
				href={withAuthUser(m.alternateLink)}
				target="_blank"
				rel="noreferrer">Open in Classroom <ExternalLinkIcon data-icon="inline-end" /></Button
			>
		{/if}
	</div>
	{#if m.description}
		<RichText
			text={m.description}
			html={m.html}
			class="mt-6 max-w-[70ch] text-sm text-pretty break-words"
		/>
	{/if}
	{#if m.materials.length}
		<h2 class="mt-8 text-base font-semibold tracking-tight">Attachments</h2>
		<div class="mt-2 max-w-lg"><Attachments items={m.materials} /></div>
	{/if}
{/if}
