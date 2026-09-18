import { browser } from '$app/env';

const KEY = 'linkAuthUser';

export const linkAuthUser = $state<{ value: number | null }>({ value: null });

export function setLinkAuthUser(value: number | null) {
	linkAuthUser.value = value;
	if (!browser) return;
	try {
		if (value === null) localStorage.removeItem(KEY);
		else localStorage.setItem(KEY, String(value));
	} catch {}
}

// Google-owned hosts only, so a plain "link" attachment to some other site doesn't gain a stray param.
const GOOGLE_HOST = /(^|\.)google\.com$/;

export function withAuthUser<T extends string | undefined>(url: T): T {
	if (!url || linkAuthUser.value === null) return url;
	try {
		const u = new URL(url);
		if (!GOOGLE_HOST.test(u.hostname)) return url;
		u.searchParams.set('authuser', String(linkAuthUser.value));
		return u.toString() as T;
	} catch {
		return url;
	}
}

if (browser) {
	try {
		const stored = localStorage.getItem(KEY);
		if (stored !== null) {
			const n = Number(stored);
			if (Number.isInteger(n) && n >= 0) linkAuthUser.value = n;
		}
	} catch {}
}
