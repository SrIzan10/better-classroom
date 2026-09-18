<script lang="ts">
	import * as Item from '#lib/components/ui/item/index.js';
	import { avatarUrl } from '#lib/api.ts';
	import { withAuthUser } from '#lib/link-authuser.svelte.ts';
	import type { Attachment } from '#lib/shared/types.ts';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import YoutubeIcon from '@lucide/svelte/icons/circle-play';
	import LinkIcon from '@lucide/svelte/icons/link';
	import ClipboardPenIcon from '@lucide/svelte/icons/clipboard-pen';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';

	let { items }: { items: Attachment[] } = $props();

	const icons = {
		drive: FileTextIcon,
		youtube: YoutubeIcon,
		link: LinkIcon,
		form: ClipboardPenIcon
	} as const;
	const labels = { drive: 'Drive file', youtube: 'YouTube', link: 'Link', form: 'Form' } as const;
	const iconFor = (t: string) => icons[t as keyof typeof icons] ?? LinkIcon;
	const labelFor = (t: string) => labels[t as keyof typeof labels] ?? 'Attachment';
	const proxied = (url: string | undefined) =>
		url && /^https:\/\/lh\d\.googleusercontent\.com\//.test(url) ? avatarUrl(url) : undefined;
	let failed = $state(new Set<string>());
</script>

<Item.Group class="gap-1">
	{#each items as a, i (a.url ?? i)}
		{@const Icon = iconFor(a.type)}
		{@const thumb = proxied(a.thumbnailUrl)}
		<Item.Root variant="outline" size="sm">
			{#snippet child({ props })}
				<a href={withAuthUser(a.url)} target="_blank" rel="noreferrer" {...props}>
					{#if thumb && !failed.has(thumb)}
						<Item.Media variant="image" class="bg-muted">
							<img
								src={thumb}
								alt=""
								loading="lazy"
								onerror={() => (failed = new Set([...failed, thumb]))}
							/>
						</Item.Media>
					{:else}
						<Item.Media variant="icon"><Icon /></Item.Media>
					{/if}
					<Item.Content>
						<Item.Title class="line-clamp-1">{a.title || a.url}</Item.Title>
						<Item.Description>{labelFor(a.type)}</Item.Description>
					</Item.Content>
					<Item.Actions class="text-muted-foreground"
						><ExternalLinkIcon class="size-4" /></Item.Actions
					>
				</a>
			{/snippet}
		</Item.Root>
	{/each}
</Item.Group>
