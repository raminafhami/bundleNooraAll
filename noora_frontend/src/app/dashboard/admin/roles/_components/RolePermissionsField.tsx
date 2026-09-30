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

import { ROLE_PERMISSION_PAGES } from "./rolePermissionPages";

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

interface PageGroup {
	label: string;
	subjectGroups: SubjectGroup[];
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

	const subjectGroupsBySubject = useMemo(() => {
		const map = new Map<string, SubjectGroup>();
		for (const permission of permissions ?? []) {
			const existing = map.get(permission.subject);
			if (existing) {
				existing.permissions.push(permission);
			} else {
				map.set(permission.subject, {
					subject: permission.subject,
					label: subjectLabelOf(permission),
					permissions: [permission],
				});
			}
		}
		for (const group of map.values()) {
			group.permissions.sort(
				(a, b) =>
					ACTION_ORDER.indexOf(a.actions[0]) - ACTION_ORDER.indexOf(b.actions[0]),
			);
		}
		return map;
	}, [permissions]);

	const pageGroups = useMemo<PageGroup[]>(() => {
		if (!permissions) return [];

		const used = new Set<string>();
		const pages: PageGroup[] = ROLE_PERMISSION_PAGES.map((page) => {
			const subjectGroups: SubjectGroup[] = [];
			for (const subject of page.subjects) {
				const group = subjectGroupsBySubject.get(subject);
				if (group && !used.has(subject)) {
					subjectGroups.push(group);
					used.add(subject);
				}
			}
			return { label: page.label, subjectGroups };
		}).filter((page) => page.subjectGroups.length > 0);

		const leftovers: SubjectGroup[] = [];
		for (const group of subjectGroupsBySubject.values()) {
			if (!used.has(group.subject)) {
				leftovers.push(group);
			}
		}
		leftovers.sort((a, b) => a.label.localeCompare(b.label, "fa"));

		if (leftovers.length) {
			pages.push({ label: "سایر", subjectGroups: leftovers });
		}

		return pages;
	}, [permissions, subjectGroupsBySubject]);

	function toggle(id: string, checked: boolean) {
		if (checked) {
			onChange([...value, id]);
		} else {
			onChange(value.filter((x) => x !== id));
		}
	}

	function toggleAllInSubject(group: SubjectGroup, checked: boolean) {
		const ids = group.permissions.map((p) => p.id);
		if (checked) {
			onChange([...new Set([...value, ...ids])]);
		} else {
			onChange(value.filter((x) => !ids.includes(x)));
		}
	}

	function toggleAllInPage(page: PageGroup, checked: boolean) {
		const ids = page.subjectGroups.flatMap((g) => g.permissions.map((p) => p.id));
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
			{pageGroups.map((page) => {
				const pageIds = page.subjectGroups.flatMap((g) =>
					g.permissions.map((p) => p.id),
				);
				const pageSelectedCount = pageIds.filter((id) => value.includes(id)).length;
				const pageAllSelected = pageSelectedCount === pageIds.length;

				return (
					<AccordionItem key={page.label} value={page.label}>
						<AccordionTrigger className="rightIcon px-4">
							<span className="flex items-center gap-3">
								<Checkbox
									checked={pageAllSelected}
									onClick={(e) => e.stopPropagation()}
									onCheckedChange={(checked) =>
										toggleAllInPage(page, checked === true)
									}
								/>
								<span className="font-medium">{page.label}</span>
								{pageSelectedCount > 0 && (
									<span className="text-xs text-muted-foreground">
										({pageSelectedCount} از {pageIds.length})
									</span>
								)}
							</span>
						</AccordionTrigger>
						<AccordionContent className="space-y-4 px-4">
							{page.subjectGroups.map((group) => {
								const selectedCount = group.permissions.filter((p) =>
									value.includes(p.id),
								).length;
								const allSelected = selectedCount === group.permissions.length;

								return (
									<div
										key={group.subject}
										className="rounded-md bg-gray-50 p-3"
									>
										<label className="mb-2 flex cursor-pointer items-center gap-3">
											<Checkbox
												checked={allSelected}
												onCheckedChange={(checked) =>
													toggleAllInSubject(group, checked === true)
												}
											/>
											<span className="text-sm text-gray-700">
												{group.label}
											</span>
											{selectedCount > 0 && (
												<span className="text-xs text-muted-foreground">
													({selectedCount} از {group.permissions.length})
												</span>
											)}
										</label>
										<div className="grid grid-cols-2 gap-3 ps-8 sm:grid-cols-4">
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
										</div>
									</div>
								);
							})}
						</AccordionContent>
					</AccordionItem>
				);
			})}
		</Accordion>
	);
}
