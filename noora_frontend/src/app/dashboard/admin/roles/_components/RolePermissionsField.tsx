"use client";

import { useEffect, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Permission } from "@/identity/permissions/models/Permission";
import { getPermissions } from "@/identity/permissions/services/getPermissions";
import { Loading } from "@/ui/Loader";

interface RolePermissionsFieldProps {
	value: string[];
	onChange: (permissions: string[]) => void;
}

export function RolePermissionsField({
	value,
	onChange,
}: RolePermissionsFieldProps) {
	const [permissions, setPermissions] = useState<Permission[]>();
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		(async () => {
			setLoading(true);
			const result = await getPermissions();
			setPermissions(
				[...result].sort((a, b) => a.description.localeCompare(b.description, "fa")),
			);
			setLoading(false);
		})();
	}, []);

	function toggle(id: string, checked: boolean) {
		if (checked) {
			onChange([...value, id]);
		} else {
			onChange(value.filter((x) => x !== id));
		}
	}

	if (loading) {
		return <Loading size="sm">در حال دریافت دسترسی‌ها...</Loading>;
	}

	return (
		<div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
			{permissions?.map((permission) => (
				<label
					key={permission.id}
					className="flex cursor-pointer items-center gap-2"
				>
					<Checkbox
						checked={value.includes(permission.id)}
						onCheckedChange={(checked) => toggle(permission.id, checked === true)}
					/>
					<span>{permission.description}</span>
				</label>
			))}
		</div>
	);
}
