import { routes } from "@/routes";

function getDynamicUrl(url: string): string {
	const appUrl = routes.app;
	const buildBase = "http://noora.invalid";
	const dynamicUrl = new URL(url, appUrl || buildBase);
	dynamicUrl.searchParams.set("t", Date.now().toString());
	if (!appUrl && dynamicUrl.origin === buildBase) {
		return `${dynamicUrl.pathname}${dynamicUrl.search}${dynamicUrl.hash}`;
	}
	return dynamicUrl.toString();
}

export { getDynamicUrl };
