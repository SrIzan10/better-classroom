<script lang="ts">
	import { errorMessage, submitWork, type SubmissionAction } from '#lib/api.ts';
	import { isOpen, type WorkSummary } from '#lib/work.ts';
	import { handInBlocker } from '#lib/shared/hand-in.ts';
	import { notify } from '#lib/toast.ts';
	import { celebrate } from '#lib/celebrate.ts';
	import { withAuthUser } from '#lib/link-authuser.svelte.ts';
	import { Button } from '#lib/components/ui/button/index.js';
	import type { Submission } from '#lib/shared/types.ts';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import LoaderIcon from '@lucide/svelte/icons/loader-circle';

	let { work, submission }: { work: WorkSummary; submission: Submission } = $props();
	const blocker = $derived(handInBlocker(work));

	let acting = $state<SubmissionAction | null>(null);
	async function submit(action: SubmissionAction) {
		acting = action;
		try {
			await submitWork(action, {
				courseId: work.courseId,
				workId: work.id,
				submissionId: submission.id
			});
			notify('emerald', action === 'turnIn' ? 'Handed in' : 'Unsubmitted', {
				description: work.title
			});
			if (action === 'turnIn') celebrate();
		} catch (err) {
			notify('rose', action === 'turnIn' ? 'Could not hand in' : 'Could not unsubmit', {
				description: errorMessage(err),
				duration: 10000
			});
		} finally {
			acting = null;
		}
	}
</script>

<div class="mt-4 flex flex-wrap gap-2">
	{#if isOpen(work) && blocker}
		<Button size="sm" href={withAuthUser(work.alternateLink)} target="_blank" rel="noreferrer">
			Complete in Classroom <ExternalLinkIcon data-icon="inline-end" />
		</Button>
		<p class="basis-full text-sm text-muted-foreground">{blocker}</p>
	{:else if isOpen(work)}
		<Button size="sm" onclick={() => submit('turnIn')} disabled={acting !== null}>
			{#if acting === 'turnIn'}<LoaderIcon data-icon="inline-start" class="animate-spin" />{/if}
			{submission.attachments.length ? 'Hand in' : 'Mark as done'}
		</Button>
	{:else if work.status === 'turnedIn'}
		<Button
			variant="outline"
			size="sm"
			onclick={() => submit('reclaim')}
			disabled={acting !== null}
		>
			{#if acting === 'reclaim'}<LoaderIcon data-icon="inline-start" class="animate-spin" />{/if}
			Unsubmit
		</Button>
	{/if}
	{#if submission.alternateLink}
		<Button
			variant="outline"
			size="sm"
			href={withAuthUser(submission.alternateLink)}
			target="_blank"
			rel="noreferrer"
		>
			Manage submission <ExternalLinkIcon data-icon="inline-end" />
		</Button>
	{/if}
</div>
