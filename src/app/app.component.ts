import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ListComponent } from './list/list.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  // standalone: true,
  imports: [RouterOutlet, ListComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'encorelab-demo';
}
