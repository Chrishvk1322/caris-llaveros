import { Component, computed, input, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-paginador',
  templateUrl: './paginador.html',
})
export class Paginador {
  readonly page = input.required<number>();
  readonly limit = input.required<number>();
  readonly total = input.required<number>();
  readonly pageChange = output<number>();

  readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.total() / this.limit())));

  anterior(): void {
    if (this.page() > 1) {
      this.pageChange.emit(this.page() - 1);
    }
  }

  siguiente(): void {
    if (this.page() < this.totalPaginas()) {
      this.pageChange.emit(this.page() + 1);
    }
  }
}
