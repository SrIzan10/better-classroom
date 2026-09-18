<script lang="ts">
	import { errorMessage, submissionFiles } from '#lib/api.ts';
	import { isOpen, type WorkSummary } from '#lib/work.ts';
	import { notify } from '#lib/toast.ts';
	import { withAuthUser } from '#lib/link-authuser.svelte.ts';
	import Attachments from '#lib/components/attachments.svelte';
	import type { Attachment, SubmissionFile } from '#lib/shared/types.ts';
	import LoaderIcon from '@lucide/svelte/icons/loader-circle';
	import PaperclipIcon from '@lucide/svelte/icons/paperclip';
	import XIcon from '@lucide/svelte/icons/x';

	let { work, fallback }: { work: WorkSummary; fallback: Attachment[] } = $props();

	const ref = $derived({ courseId: work.courseId, workId: work.id });

	let files = $state<SubmissionFile[] | null>(null);
	let filesError = $state<string | null>(null);
	let uploading = $state(false);
	let removingFile = $state<string | null>(null);

	async function loadFiles() {
		filesError = null;
		try {
			files = await submissionFiles.list(ref);
		} catch (err) {
			filesError = errorMessage(err);
			files = [];
		}
	}

	async function uploadFile(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		uploading = true;
		try {
			files = await submissionFiles.upload(ref, file);
			notify('emerald', 'File attached', { description: file.name });
		} catch (err) {
			notify('rose', 'Could not attach file', { description: errorMessage(err), duration: 10000 });
		} finally {
			uploading = false;
		}
	}

	async function removeFile(driveId: string) {
		removingFile = driveId;
		try {
			files = await submissionFiles.remove(ref, driveId);
		} catch (err) {
			notify('rose', 'Could not remove file', { description: errorMessage(err) });
		} finally {
			removingFile = null;
		}
	}

	$effect(() => {
		if (files === null) void loadFiles();
	});
</script>

{#if filesError}
	{#if fallback.length}
		<Attachments items={fallback} />
	{:else}
		<p class="text-sm text-muted-foreground">Nothing attached yet.</p>
	{/if}
{:else if files === null}
	<p class="text-sm text-muted-foreground">Loading files…</p>
{:else}
	{#if files.length === 0}
		<p class="text-sm text-muted-foreground">Nothing attached yet.</p>
	{:else}
		<ul role="list" class="space-y-1.5 text-sm">
			{#each files as f (f.driveId)}
				<li class="group flex items-center gap-2 rounded-lg border px-3 py-2">
					<PaperclipIcon class="size-3.5 shrink-0 text-muted-foreground" />
					<a
						href={withAuthUser(f.url ?? `https://drive.google.com/file/d/${f.driveId}/view`)}
						target="_blank"
						rel="noreferrer"
						class="min-w-0 flex-1 truncate underline-offset-2 hover:underline"
						>{f.title ?? f.driveId}</a
					>
					{#if isOpen(work)}
						<button
							type="button"
							class="rounded p-0.5 text-muted-foreground hover:text-destructive disabled:opacity-50"
							aria-label="Remove file"
							disabled={removingFile === f.driveId}
							onclick={() => removeFile(f.driveId)}
						>
							{#if removingFile === f.driveId}<LoaderIcon
									class="size-3.5 animate-spin"
								/>{:else}<XIcon class="size-3.5" />{/if}
						</button>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
	{#if isOpen(work)}
		<label
			class="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground underline-offset-2 hover:underline"
		>
			{#if uploading}<LoaderIcon class="size-3.5 animate-spin" />{:else}<PaperclipIcon
					class="size-3.5"
				/>{/if}
			{uploading ? 'Uploading…' : 'Add file'}
			<input type="file" class="sr-only" disabled={uploading} onchange={uploadFile} />
		</label>
	{/if}
{/if}
