import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-logo',
  templateUrl: './logo.html',
})
export class Logo {
  readonly size = input<'sm' | 'md' | 'lg'>('md');
}
