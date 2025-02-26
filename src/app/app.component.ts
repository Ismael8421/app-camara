import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CameraComponent } from './components/camera/camera.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CameraComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'app-camara';
}
