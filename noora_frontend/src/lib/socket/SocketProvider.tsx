"use client";

import { useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";

import getUniversalSession from "@/auth/utils/getUniversalSession";

import { SocketContext, SocketContextType } from "./SocketContext";

function SocketProvider(props: React.PropsWithChildren) {
	const [notificationsSocket, setNotificationsSocket] = useState<Socket>();
	const [tasksSocket, setTasksSocket] = useState<Socket>();

	useEffect(() => {
		const { accessToken } = getUniversalSession();

		if (!accessToken) return;
		const apiUrl = process.env.NEXT_PUBLIC_EXTERNAL_API_URL || "/backend";
		const socketOrigin = new URL(apiUrl, window.location.origin).origin;

		let notificationsSocket: Socket | undefined;
		let tasksSocket: Socket | undefined;

		Promise.all([
			(() => {
				notificationsSocket = io(
					`${socketOrigin}/notifications`,
					{
						extraHeaders: {
							authorization: `${accessToken}`,
						},
					},
				);
			})(),

			(() => {
			tasksSocket = io(`${socketOrigin}/tasks`, {
					extraHeaders: {
						authorization: `${accessToken}`,
					},
				});
			})(),
		]);

		setNotificationsSocket(notificationsSocket);
		setTasksSocket(tasksSocket);

		return () => {
			notificationsSocket?.disconnect();
			setNotificationsSocket(undefined);

			tasksSocket?.disconnect();
			setTasksSocket(undefined);
		};
	}, []);

	const contextValue = useMemo<SocketContextType>(
		() => ({ notificationsSocket, tasksSocket }),
		[notificationsSocket, tasksSocket],
	);

	return <SocketContext.Provider value={contextValue} {...props} />;
}

export { SocketProvider };
