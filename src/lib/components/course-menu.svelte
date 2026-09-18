<script lang="ts">
	import * as ContextMenu from '#lib/components/ui/context-menu/index.js';
	import { setCoursePrefs } from '#lib/api.ts';
	import { setCourseHidden } from '#lib/course-actions.ts';
	import { notify } from '#lib/toast.ts';
	import { withAuthUser } from '#lib/link-authuser.svelte.ts';
	import type { CourseRef as Course } from '#lib/course.ts';
	import type { Snippet } from 'svelte';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import EyeOffIcon from '@lucide/svelte/icons/eye-off';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';

	let {
		course,
		onRename,
		children
	}: { course: Course; onRename: (course: Course) => void; children: Snippet } = $props();

	const hide = () =>
		setCourseHidden(course, true, 'Find it again under Settings → Hidden courses.');

	async function resetName() {
		const nickname = course.nickname;
		await setCoursePrefs(course.id, { nickname: null });
		notify('sky', `Back to “${course.name}”`, {
			action: { label: 'Undo', onClick: () => setCoursePrefs(course.id, { nickname }) }
		});
	}
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger>
		{@render children()}
	</ContextMenu.Trigger>
	<ContextMenu.Content class="w-52">
		<ContextMenu.Item onSelect={() => onRename(course)}
			><PencilIcon />Rename or recolor…</ContextMenu.Item
		>
		{#if course.nickname}
			<ContextMenu.Item onSelect={resetName}><RotateCcwIcon />Use original name</ContextMenu.Item>
		{/if}
		<ContextMenu.Item onSelect={hide}><EyeOffIcon />Hide course</ContextMenu.Item>
		{#if course.alternateLink}
			<ContextMenu.Separator />
			<ContextMenu.Item
				onSelect={() => window.open(withAuthUser(course.alternateLink), '_blank', 'noreferrer')}
				><ExternalLinkIcon />Open in Classroom</ContextMenu.Item
			>
		{/if}
	</ContextMenu.Content>
</ContextMenu.Root>
