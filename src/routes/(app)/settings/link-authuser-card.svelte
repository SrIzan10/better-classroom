<script lang="ts">
	import { linkAuthUser, setLinkAuthUser } from '#lib/link-authuser.svelte.ts';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Checkbox } from '#lib/components/ui/checkbox/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import SettingsCard from './settings-card.svelte';

	let enabled = $state(linkAuthUser.value !== null);
	let account = $state(linkAuthUser.value ?? 0);

	function toggle(checked: boolean) {
		enabled = checked;
		setLinkAuthUser(checked ? Math.max(0, Math.trunc(account)) : null);
	}

	function updateAccount() {
		account = Math.max(0, Math.trunc(account) || 0);
		if (enabled) setLinkAuthUser(account);
	}
</script>

<SettingsCard class="mt-6">
	<div class="px-5 py-4">
		<h2 class="text-base font-semibold tracking-tight">Google account for links</h2>
		<p class="mt-1 max-w-prose text-sm text-pretty text-muted-foreground">
			If this browser is signed into more than one Google account, links to Classroom and Drive can
			open in the wrong one. Set the account's slot number — 0 is the first account you signed into
			— and it's added as <code class="rounded bg-muted px-1 py-0.5 text-xs">authuser</code> to every
			link. Saved for this browser only.
		</p>
	</div>
	<div class="flex flex-wrap items-center gap-4 border-t px-5 py-4">
		<div class="flex items-center gap-2">
			<Checkbox id="link-authuser-enabled" checked={enabled} onCheckedChange={toggle} />
			<Label for="link-authuser-enabled">Add account number to links</Label>
		</div>
		<div class="flex items-center gap-2">
			<Label for="link-authuser-account" class="text-muted-foreground">Account number</Label>
			<Input
				id="link-authuser-account"
				type="number"
				min="0"
				step="1"
				disabled={!enabled}
				bind:value={account}
				onchange={updateAccount}
				class="w-20"
			/>
		</div>
	</div>
</SettingsCard>
