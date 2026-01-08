import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { addIcons } from 'ionicons';
import { listOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class HomePage implements OnInit {
  private platformId = inject(PLATFORM_ID);

  constructor() {
    addIcons({
      listOutline,
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Inicialización específica del navegador
      console.log('Ionic Todo App initialized');
    }
  }
}
