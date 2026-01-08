import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  add,
  trash,
  create,
  listOutline,
} from 'ionicons/icons';
import { Task } from 'src/app/models/task.model';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-task-list',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class TasksComponent implements OnInit {
  readonly taskService = inject(TaskService);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  constructor() {
    addIcons({
      add,
      trash,
      create,
      listOutline,
    });
  }

  ngOnInit() {
    // La carga inicial se hace en los servicios
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

  async openCreateTask() {
    const alert = await this.alertController.create({
      header: 'Nueva tarea',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Título',
        },
        {
          name: 'description',
          type: 'textarea',
          placeholder: 'Descripción (opcional)',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: (data) => {
            const title = (data.title || '').trim();
            if (!title) {
              void this.showToast('El título es obligatorio', 'warning');
              return false;
            }
            void this.createTask(title, data.description);
            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  async editTask(task: Task) {
    const alert = await this.alertController.create({
      header: 'Editar tarea',
      inputs: [
        {
          name: 'title',
          type: 'text',
          value: task.title,
        },
        {
          name: 'description',
          type: 'textarea',
          value: task.description || '',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: (data) => {
            const title = (data.title || '').trim();
            if (!title) {
              void this.showToast('El título es obligatorio', 'warning');
              return false;
            }
            void this.updateTask(task, title, data.description);
            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  private async createTask(title: string, description?: string) {
    try {
      await this.taskService.addTask({
        title,
        description: (description || '').trim() || undefined,
        completed: false,
      });
      await this.showToast('Tarea creada', 'success');
    } catch (error) {
      await this.showToast('Error al crear la tarea', 'danger');
    }
  }

  private async updateTask(task: Task, title: string, description?: string) {
    try {
      await this.taskService.updateTask(task.id, {
        title,
        description: (description || '').trim() || undefined,
      });
      await this.showToast('Tarea actualizada', 'success');
    } catch (error) {
      await this.showToast('Error al actualizar la tarea', 'danger');
    }
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
