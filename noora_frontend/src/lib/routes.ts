const routes = {
	get app() {
		return process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "");
	},
	internalApi: process.env.NEXT_PUBLIC_INTERNAL_API_URL,
	get externalApi() {
		if (typeof window === "undefined") return process.env.NEXT_PUBLIC_INTERNAL_API_URL || process.env.NEXT_PUBLIC_EXTERNAL_API_URL;
		return new URL(process.env.NEXT_PUBLIC_EXTERNAL_API_URL || "/backend", window.location.origin).toString();
	},
} as const;

export { routes };
