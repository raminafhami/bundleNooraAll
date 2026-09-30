"use client";

import { useEffect, useMemo, useState } from "react";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Permission } from "@/identity/permissions/models/Permission";
import { getPermissions } from "@/identity/permissions/services/getPermissions";
import { Loading } from "@/ui/Loader";

interface RolePermissionsFieldProps {
	value: string[];
	onChange: (permissions: string[]) => void;
}

const ACTION_LABELS: Record<string, string> = {
	create: "افزودن",
	read: "مشاهده",
	update: "ویرایش",
	delete: "حذف",
	manage: "مدیریت کامل",
	read_own: "مشاهده موارد خود",
};

const ACTION_ORDER = ["create", "read", "update", "delete", "manage", "read_own"];

interface SubjectGroup {
	subject: string;
	label: string;
	permissions: Permission[];
}

function subjectLabelOf(permission: Permission): string {
	const [label] = permission.description.split(" - ");
	return label || permission.subject;
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
			setPermissions(await getPermissions());
			setLoading(false);
		})();
	}, []);

	const groups = useMemo<SubjectGroup[]>(() => {
		if (!permissions) return [];

		const bySubject = new Map<string, Permission[]>();
		for (const permission of permissions) {
			const list = bySubject.get(permission.subject) ?? [];
			list.push(permission);
			bySubject.set(permission.subject, list);
		}

		return Array.from(bySubject.entries())
			.map(([subject, list]) => ({
				subject,
				label: subjectLabelOf(list[0]),
				permissions: [...list].sort(
					(a, b) =>
						ACTION_ORDER.indexOf(a.actions[0]) -
						ACTION_ORDER.indexOf(b.actions[0]),
				),
			}))
			.sort((a, b) => a.label.localeCompare(b.label, "fa"));
	}, [permissions]);

	function toggle(id: string, checked: boolean) {
		if (checked) {
			onChange([...value, id]);
		} else {
			onChange(value.filter((x) => x !== id));
		}
	}

	function toggleAllInGroup(group: SubjectGroup, checked: boolean) {
		const ids = group.permissions.map((p) => p.id);
		if (checked) {
			onChange([...new Set([...value, ...ids])]);
		} else {
			onChange(value.filter((x) => !ids.includes(x)));
		}
	}

	if (loading) {
		return <Loading size="sm">در حال دریافت دسترسی‌ها...</Loading>;
	}

	return (
		<Accordion type="multiple" className="rounded-lg border">
			{groups.map((group) => {
				const selectedCount = group.permissions.filter((p) =>
					value.includes(p.id),
				).length;
				const allSelected = selectedCount === group.permissions.length;

				return (
					<AccordionItem key={group.subject} value={group.subject}>
						<AccordionTrigger className="rightIcon px-4">
							<span className="flex items-center gap-3">
								<Checkbox
									checked={allSelected}
									onClick={(e) => e.stopPropagation()}
									onCheckedChange={(checked) =>
										toggleAllInGroup(group, checked === true)
									}
								/>
								<span>{group.label}</span>
								{selectedCount > 0 && (
									<span className="text-xs text-muted-foreground">
										({selectedCount} از {group.permissions.length})
									</span>
								)}
							</span>
						</AccordionTrigger>
						<AccordionContent className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-4">
							{group.permissions.map((permission) => (
								<label
									key={permission.id}
									className="flex cursor-pointer items-center gap-2"
								>
									<Checkbox
										checked={value.includes(permission.id)}
										onCheckedChange={(checked) =>
											toggle(permission.id, checked === true)
										}
									/>
									<span>
										{ACTION_LABELS[permission.actions[0]] ??
											permission.actions[0]}
									</span>
								</label>
							))}
						</AccordionContent>
					</AccordionItem>
				);
			})}
		</Accordion>
	);
}
