"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { LoginCredentialsForm } from "./LoginCredentialsForm";
import { LoginOTPForm } from "./LoginOTPForm";
import { LoginType } from "./LoginType";

function LoginWidget() {
	const [loginType, setLoginType] = useState<LoginType>("credentials");

	const btnActiveClasses =
		"bg-gradient-to-r from-[#ef9b20] to-[#ffbf62] text-[#0b273c]";
	const btnInactiveClasses = "bg-[#efefef] text-[#7b7c7c]";

	return (
		<div className="flex flex-col items-center justify-center gap-4">
			<div className="flex h-12 text-[15px] font-medium">
				<button
					className={cn(
						"h-full w-48 rounded-s-full py-2.5",
						loginType === "credentials" && btnActiveClasses,
						loginType !== "credentials" && btnInactiveClasses,
					)}
					onClick={() => setLoginType("credentials")}
				>
					ورود با رمز ثابت
				</button>

				<button
					className={cn(
						"h-full w-48 rounded-e-full py-2.5",
						loginType === "otp" && btnActiveClasses,
						loginType !== "otp" && btnInactiveClasses,
					)}
					onClick={() => setLoginType("otp")}
				>
					ورود با رمز یکبار مصرف
				</button>
			</div>

			{loginType === "credentials" && <LoginCredentialsForm />}

			{loginType === "otp" && <LoginOTPForm />}
		</div>
	);
}

export { LoginWidget };
