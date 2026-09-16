import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
	const protocol = request.headers.get("x-forwarded-proto") || new URL(request.url).protocol.replace(":", "");
	const origin = process.env.NEXT_PUBLIC_APP_URL || (host ? `${protocol}://${host}` : new URL(request.url).origin);
	const response = NextResponse.redirect(new URL("/login", origin));
	response.cookies.delete("token");
	response.cookies.delete("refreshToken");

	return response;
}
