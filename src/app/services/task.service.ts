import { Injectable, inject, signal, computed } from '@angular/core';
import { StorageService } from './storage.service';
import {
  Task,
  TaskFilter,
  TaskStats,
  TaskPriority,
} from '../models/task.model';

const TASKS_STORAGE_KEY = 'ionic_todo_tasks';

/**
 * Servicio para gestionar las tareas de la aplicación
 */
@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly storage = inject(StorageService);

  // Estado reactivo con signals
  private tasksSignal = signal<Task[]>([]);
  private loadingSignal = signal<boolean>(false);
  private filterSignal = signal<TaskFilter>({});

  // Selectores computados
  readonly tasks = computed(() =>
    this.applyFilter(this.tasksSignal(), this.filterSignal())
  );
  readonly allTasks = computed(() => this.tasksSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly currentFilter = computed(() => this.filterSignal());

  readonly stats = computed<TaskStats>(() => {
    const tasks = this.tasksSignal();

    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.completed).length,
      pending: tasks.filter((t) => !t.completed).length,
    };
  });

  readonly completedTasks = computed(() =>
    this.tasksSignal().filter((t) => t.completed)
  );

  readonly pendingTasks = computed(() =>
    this.tasksSignal().filter((t) => !t.completed)
  );

  constructor() {
    this.loadTasks();
  }

  /**
   * Carga las tareas desde el almacenamiento local
   */
  async loadTasks(): Promise<void> {
    this.loadingSignal.set(true);
    try {
      const tasks = await this.storage.get<Task[]>(TASKS_STORAGE_KEY);
      this.tasksSignal.set(tasks || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      this.tasksSignal.set([]);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Guarda las tareas en el almacenamiento local
   */
  private async saveTasks(): Promise<void> {
    try {
      await this.storage.set(TASKS_STORAGE_KEY, this.tasksSignal());
    } catch (error) {
      console.error('Error saving tasks:', error);
      throw error;
    }
  }

  /**
   * Genera un ID único para las tareas
   */
  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Agrega una nueva tarea
   */
  async addTask(
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Task> {
    const now = new Date();
    const newTask: Task = {
      ...taskData,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };

    this.tasksSignal.update((tasks) => [...tasks, newTask]);
    await this.saveTasks();
    return newTask;
  }

  /**
   * Actualiza una tarea existente
   */
  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    let updatedTask: Task | null = null;

    this.tasksSignal.update((tasks) =>
      tasks.map((task) => {
        if (task.id === id) {
          updatedTask = {
            ...task,
            ...updates,
            updatedAt: new Date(),
          };
          return updatedTask;
        }
        return task;
      })
    );

    if (updatedTask) {
      await this.saveTasks();
    }
    return updatedTask;
  }

  /**
   * Marca una tarea como completada o pendiente
   */
  async toggleTaskCompletion(id: string): Promise<Task | null> {
    const task = this.tasksSignal().find((t) => t.id === id);
    if (!task) return null;

    return this.updateTask(id, { completed: !task.completed });
  }

  /**
   * Elimina una tarea
   */
  async deleteTask(id: string): Promise<boolean> {
    const initialLength = this.tasksSignal().length;
    this.tasksSignal.update((tasks) => tasks.filter((task) => task.id !== id));

    if (this.tasksSignal().length < initialLength) {
      await this.saveTasks();
      return true;
    }
    return false;
  }

  /**
   * Elimina todas las tareas completadas
   */
  async clearCompletedTasks(): Promise<number> {
    const completedCount = this.tasksSignal().filter((t) => t.completed).length;
    this.tasksSignal.update((tasks) => tasks.filter((task) => !task.completed));
    await this.saveTasks();
    return completedCount;
  }

  /**
   * Obtiene una tarea por ID
   */
  getTaskById(id: string): Task | undefined {
    return this.tasksSignal().find((task) => task.id === id);
  }

  /**
   * Aplica un filtro a las tareas
   */
  setFilter(filter: TaskFilter): void {
    this.filterSignal.set(filter);
  }

  /**
   * Limpia el filtro actual
   */
  clearFilter(): void {
    this.filterSignal.set({});
  }

  /**
   * Aplica el filtro a una lista de tareas
   */
  private applyFilter(tasks: Task[], filter: TaskFilter): Task[] {
    return tasks.filter((task) => {
      // Filtro por estado completado
      if (
        filter.completed !== undefined &&
        task.completed !== filter.completed
      ) {
        return false;
      }

      // Filtro por prioridad
      if (filter.priority && task.priority !== filter.priority) {
        return false;
      }

      // Filtro por término de búsqueda
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(searchLower);
        const matchesDescription = task.description
          ?.toLowerCase()
          .includes(searchLower);
        if (!matchesTitle && !matchesDescription) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Ordena las tareas por diferentes criterios
   */
  sortTasks(criteria: 'date' | 'priority' | 'name'): Task[] {
    const tasks = [...this.tasks()];

    switch (criteria) {
      case 'date':
        return tasks.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'priority':
        const priorityOrder = {
          [TaskPriority.HIGH]: 0,
          [TaskPriority.MEDIUM]: 1,
          [TaskPriority.LOW]: 2,
        };
        return tasks.sort(
          (a, b) =>
            (priorityOrder[a.priority || TaskPriority.LOW] || 2) -
            (priorityOrder[b.priority || TaskPriority.LOW] || 2)
        );
      case 'name':
        return tasks.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return tasks;
    }
  }

  /**
   * Obtiene tareas por categoría
   */
  getTasksByCategory(categoryId: string): Task[] {
    return this.tasksSignal().filter((task) => task.categoryId === categoryId);
  }
}
