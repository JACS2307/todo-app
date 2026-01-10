import { Component, inject, OnInit, PLATFORM_ID, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonSplitPane,
  IonMenu,
  IonHeader,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonBadge,
  IonMenuToggle,
  IonRouterOutlet,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  listOutline,
  colorPaletteOutline,
  checkmarkDoneOutline,
  settingsOutline,
  chevronForward,
  sparklesOutline,
} from 'ionicons/icons';

import { TaskService } from '../services/task.service';
import { CategoryService } from '../services/category.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    IonSplitPane,
    IonMenu,
    IonHeader,
    IonContent,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonBadge,
    IonMenuToggle,
    IonRouterOutlet,
  ],
})
export class HomePage implements OnInit {
  private platformId = inject(PLATFORM_ID);
  readonly taskService = inject(TaskService);
  readonly categoryService = inject(CategoryService);

  // Estadísticas para el menú
  pendingTasksCount = computed(() =>
    this.taskService.tasks().filter(t => !t.completed).length
  );

  completedTasksCount = computed(() =>
    this.taskService.tasks().filter(t => t.completed).length
  );

  categoriesCount = computed(() =>
    this.categoryService.categories().length
  );

  constructor() {
    addIcons({
      listOutline,
      colorPaletteOutline,
      checkmarkDoneOutline,
      settingsOutline,
      chevronForward,
      sparklesOutline,
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Inicialización específica del navegador
    }
  }
}
