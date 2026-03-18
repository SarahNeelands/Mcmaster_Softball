type EditableRecord = {
  editing_status?: string;
};

export function isVisibleByEditingStatus(
  item: EditableRecord | undefined,
  isAdmin: boolean
) {
  if (!item) return false;
  if (item.editing_status === "deleted") return false;
  if (isAdmin) return true;
  return item.editing_status === "published";
}

export function filterVisibleByEditingStatus<T extends EditableRecord>(
  items: T[],
  isAdmin: boolean
) {
  return items.filter((item) => isVisibleByEditingStatus(item, isAdmin));
}
