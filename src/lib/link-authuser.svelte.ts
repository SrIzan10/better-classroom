import { browser } from '$app/env';

const KEY = 'linkAuthUser';

// Google-owned hosts only, so a plain "link" attachment to some other site doesn't gain a stray param.
const GOOGLE_HOST = /(^|\.)google\.com$/;

export const linkAuthUser = $state<{ value: number | null }>({ value: null });

/** A non-negative integer slot, or null for anything else (including empty). */
export function parseAuthUser(raw: string | null): number | null {
	if (raw === null || raw.trim() === '') return null;
	const n = Number(raw);
	return Number.isInteger(n) && n >= 0 ? n : null;
}

export function setLinkAuthUser(value: number | null) {
	linkAuthUser.value = value;
	try {
		if (value === null) localStorage.removeItem(KEY);
		else localStorage.setItem(KEY, String(value));
	} catch {}
}

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
		linkAuthUser.value = parseAuthUser(localStorage.getItem(KEY));
	} catch {}
}
