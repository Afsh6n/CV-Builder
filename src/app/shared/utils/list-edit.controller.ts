export class ListEditController<T extends { id: string }> {
  private newlyAddedIds = new Set<string>();

  constructor(
    private readonly getItems: () => T[],
    private readonly setItems: (items: T[]) => void,
    private readonly getEditingId: () => string | null,
    private readonly setEditingId: (id: string | null) => void,
    private readonly createItem: () => T
  ) {}

  add(): T {
    return this.addItem(this.createItem());
  }

  addItem(item: T): T {
    this.setItems([...this.getItems(), item]);
    this.setEditingId(item.id);
    this.newlyAddedIds.add(item.id);
    return item;
  }

  remove(id: string): void {
    this.setItems(this.getItems().filter(item => item.id !== id));
    if (this.getEditingId() === id) {
      this.setEditingId(null);
    }
  }

  startEditing(id: string): void {
    this.setEditingId(id);
  }

  isEditing(id: string): boolean {
    return this.getEditingId() === id;
  }

  cancel(id: string): void {
    if (this.newlyAddedIds.has(id)) {
      this.newlyAddedIds.delete(id);
      this.setItems(this.getItems().filter(item => item.id !== id));
    }
    this.setEditingId(null);
  }

  completeSave(id: string): void {
    this.newlyAddedIds.delete(id);
    this.setEditingId(null);
  }
}
