<script lang="ts">
	import { linkAuthUser, parseAuthUser, setLinkAuthUser } from '#lib/link-authuser.svelte.ts';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import SettingsCard from './settings-card.svelte';
</script>

<SettingsCard class="mt-6">
	<div class="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
		<div>
			<h2 class="text-base font-semibold tracking-tight">Google account for links</h2>
			<p class="mt-1 max-w-prose text-sm text-pretty text-muted-foreground">
				If this browser is signed into more than one Google account, links to Classroom and Drive
				can open in the wrong one. Enter the account's slot number (0 is the first account you
				signed into) and it's added as
				<code class="rounded bg-muted px-1 py-0.5 text-xs">authuser</code> to every link. Leave it empty
				to turn this off. Saved for this browser only.
			</p>
		</div>
		<div class="flex shrink-0 items-center gap-2">
			<Label for="link-authuser" class="text-muted-foreground">Account number</Label>
			<Input
				id="link-authuser"
				type="number"
				min="0"
				step="1"
				placeholder="Off"
				value={linkAuthUser.value ?? ''}
				onchange={(e) => setLinkAuthUser(parseAuthUser(e.currentTarget.value))}
				class="w-20"
			/>
		</div>
	</div>
</SettingsCard>
