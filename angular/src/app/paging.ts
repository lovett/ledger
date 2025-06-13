export class Paging {
  currentlyShowing = 0;
  total = 0;
  offset = 0;

  constructor(currentlyShowing: number, total: number, offset: number) {
    this.currentlyShowing = currentlyShowing;
    this.total = total;
    this.offset = offset;
  }

  static blank() {
    return new Paging(0, 0, 0);
  }

  get displayStart(): number {
    return this.offset + 1;
  }

  get displayEnd(): number {
    return this.offset + this.currentlyShowing;
  }

  get isVisible(): boolean {
    return this.total > 0;
  }

  get firstOffset(): number {
    return 0;
  }

  get lastOffset(): number {
    return this.total - this.currentlyShowing;
  }

  get nextOffset(): number {
    return this.offset + this.currentlyShowing;
  }

  get previousOffset(): number {
    return this.offset - this.currentlyShowing;
  }

  get canNavigateToNextPage(): boolean {
    return this.displayEnd < this.total;
  }

  get canNavigateToPreviousPage(): boolean {
    return this.offset > 0;
  }

  get canNavigateToFirstPage(): boolean {
    return this.previousOffset > this.firstOffset;
  }

  get canNavigateToLastPage(): boolean {
    return this.nextOffset < this.lastOffset;
  }
}
