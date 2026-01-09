import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  add,
  trash,
  create,
  listOutline,
  close,
  checkmark,
  filterOutline,
  checkmarkCircleOutline,
  ellipseOutline,
  timeOutline as timeIcon,
  calendarOutline as calendarIcon,
  // Iconos de categorías
  personOutline,
  briefcaseOutline,
  cartOutline,
  homeOutline,
  heartOutline,
  starOutline,
  bookmarkOutline,
  flagOutline,
  folderOutline,
  documentOutline,
  calendarOutline,
  timeOutline,
  fitnessOutline,
  restaurantOutline,
  carOutline,
  airplaneOutline,
  schoolOutline,
  medkitOutline,
  cashOutline,
  giftOutline,
} from 'ionicons/icons';
import { Task } from 'src/app/models/task.model';
import { TaskService } from 'src/app/services/task.service';
import { CategoryService } from 'src/app/services/category.service';

@Component({
  selector: 'app-task-list',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
})
export class TasksComponent implements OnInit {
  readonly taskService = inject(TaskService);
  readonly categoryService = inject(CategoryService);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private fb = inject(FormBuilder);

  // Modal state
  isModalOpen = signal(false);
  isEditing = signal(false);
  selectedTask = signal<Task | null>(null);

  // Filter state
  selectedCategoryFilter = signal<string | null>(null);

  // Form
  taskForm!: FormGroup;

  // Filtered tasks
  filteredTasks = computed(() => {
    const categoryId = this.selectedCategoryFilter();
    const tasks = this.taskService.tasks();

    if (!categoryId) {
      return tasks;
    }
    return tasks.filter((task) => task.categoryId === categoryId);
  });

  // Tareas pendientes (filtradas)
  pendingTasks = computed(() => {
    return this.filteredTasks().filter((task) => !task.completed);
  });

  // Tareas completadas (filtradas)
  completedTasks = computed(() => {
    return this.filteredTasks().filter((task) => task.completed);
  });

  // Estadísticas
  stats = computed(() => {
    const all = this.taskService.tasks();
    const pending = all.filter((t) => !t.completed).length;
    const completed = all.filter((t) => t.completed).length;
    const total = all.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { pending, completed, total, percentage };
  });

  // Conteo de tareas por categoría
  getTaskCountByCategory(categoryId: string): number {
    return this.taskService.tasks().filter((t) => t.categoryId === categoryId).length;
  }

  constructor() {
    addIcons({
      add,
      trash,
      create,
      listOutline,
      close,
      checkmark,
      filterOutline,
      checkmarkCircleOutline,
      ellipseOutline,
      timeIcon,
      calendarIcon,
      // Iconos de categorías
      personOutline,
      briefcaseOutline,
      cartOutline,
      homeOutline,
      heartOutline,
      starOutline,
      bookmarkOutline,
      flagOutline,
      folderOutline,
      documentOutline,
      calendarOutline,
      timeOutline,
      fitnessOutline,
      restaurantOutline,
      carOutline,
      airplaneOutline,
      schoolOutline,
      medkitOutline,
      cashOutline,
      giftOutline,
    });
  }

  ngOnInit() {
    this.initForm();
  }

  async toggleTask(task: Task) {
    await this.taskService.toggleTaskCompletion(task.id);

    const message = task.completed
      ? 'Tarea marcada como pendiente'
      : 'Tarea completada';

    await this.showToast(message, 'success');
  }

  async deleteTask(task: Task) {
    const alert = await this.alertController.create({
      header: 'Eliminar tarea',
      message: `¿Estás seguro de que deseas eliminar "${task.title}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.taskService.deleteTask(task.id);
            await this.showToast('Tarea eliminada', 'success');
          },
        },
      ],
    });

    await alert.present();
  }

  // Form methods
  private initForm(task?: Task) {
    this.taskForm = this.fb.group({
      title: [task?.title || '', [Validators.required, Validators.minLength(1)]],
      description: [task?.description || ''],
      categoryId: [task?.categoryId || null],
    });
  }

  openCreateTask() {
    this.selectedTask.set(null);
    this.isEditing.set(false);
    this.initForm();
    this.isModalOpen.set(true);
  }

  editTask(task: Task) {
    this.selectedTask.set(task);
    this.isEditing.set(true);
    this.initForm(task);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedTask.set(null);
    this.isEditing.set(false);
  }

  async saveTask() {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      const taskData = {
        title: formValue.title.trim(),
        description: formValue.description?.trim() || undefined,
        categoryId: formValue.categoryId || undefined,
      };

      try {
        if (this.isEditing() && this.selectedTask()) {
          await this.taskService.updateTask(this.selectedTask()!.id, taskData);
          await this.showToast('Tarea actualizada', 'success');
        } else {
          await this.taskService.addTask({
            ...taskData,
            completed: false,
          });
          await this.showToast('Tarea creada', 'success');
        }
        this.closeModal();
      } catch (error) {
        await this.showToast('Error al guardar la tarea', 'danger');
      }
    }
  }

  // Filter methods
  filterByCategory(categoryId: string | null) {
    this.selectedCategoryFilter.set(categoryId);
  }

  getCategoryById(categoryId: string | undefined) {
    if (!categoryId) return null;
    return this.categoryService.getCategoryById(categoryId);
  }

  async handleRefresh(event: any) {
    await this.taskService.loadTasks();
    event.target.complete();
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
    });
    await toast.present();
  }
}
