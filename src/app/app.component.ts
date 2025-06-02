import { Component } from '@angular/core';
import {DummyFormatterPipe} from './shared/pipes/dummy-formatter.pipe';
import {DummyType} from './core/enums/dummy-type';
import {HighlightDummyDirective} from './shared/directives/highlight-dummy.directive';
import {DummyComponent} from './features/dummy/dummy/dummy.component';

@Component({
  selector: 'app-root',
  imports: [DummyComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
}
