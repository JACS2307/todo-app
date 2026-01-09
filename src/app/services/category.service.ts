import { Injectable, inject, signal, computed } from '@angular/core';
import { StorageService } from './storage.service';
import { Category, DEFAULT_CATEGORIES } from '../models/category.model';

const CATEGORIES_STORAGE_KEY = 'ionic_todo_categories';

/**
 * Servicio para gestionar las categorías de tareas
 */
@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly storage = inject(StorageService);

  // Estado reactivo con signals
  private categoriesSignal = signal<Category[]>([]);
  private loadingSignal = signal<boolean>(false);

  // Selectores computados
  readonly categories = computed(() => this.categoriesSignal());
  readonly loading = computed(() => this.loadingSignal());

  readonly categoriesCount = computed(() => this.categoriesSignal().length);

  constructor() {
    this.loadCategories();
  }

  /**
   * Carga las categorías desde el almacenamiento local
   * Si no existen, inicializa con las categorías por defecto
   */
  async loadCategories(): Promise<void> {
    this.loadingSignal.set(true);
    try {
      const categories = await this.storage.get<Category[]>(
        CATEGORIES_STORAGE_KEY
      );

      if (categories && categories.length > 0) {
        this.categoriesSignal.set(categories);
      } else {
        // Inicializar con categorías por defecto
        await this.initializeDefaultCategories();
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      await this.initializeDefaultCategories();
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Inicializa las categorías por defecto
   */
  private async initializeDefaultCategories(): Promise<void> {
    const now = new Date();
    const defaultCats: Category[] = DEFAULT_CATEGORIES.map((cat, index) => ({
      ...cat,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    }));

    this.categoriesSignal.set(defaultCats);
    await this.saveCategories();
  }

  /**
   * Guarda las categorías en el almacenamiento local
   */
  private async saveCategories(): Promise<void> {
    try {
      await this.storage.set(CATEGORIES_STORAGE_KEY, this.categoriesSignal());
    } catch (error) {
      console.error('Error saving categories:', error);
      throw error;
    }
  }

  /**
   * Genera un ID único para las categorías
   */
  private generateId(): string {
    return `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Agrega una nueva categoría
   */
  async addCategory(
    categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Category> {
    const now = new Date();
    const newCategory: Category = {
      ...categoryData,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };

    this.categoriesSignal.update((categories) => [...categories, newCategory]);
    await this.saveCategories();
    return newCategory;
  }

  /**
   * Actualiza una categoría existente
   */
  async updateCategory(
    id: string,
    updates: Partial<Category>
  ): Promise<Category | null> {
    let updatedCategory: Category | null = null;

    this.categoriesSignal.update((categories) =>
      categories.map((category) => {
        if (category.id === id) {
          updatedCategory = {
            ...category,
            ...updates,
            updatedAt: new Date(),
          };
          return updatedCategory;
        }
        return category;
      })
    );

    if (updatedCategory) {
      await this.saveCategories();
    }
    return updatedCategory;
  }

  /**
   * Elimina una categoría
   */
  async deleteCategory(id: string): Promise<boolean> {
    const initialLength = this.categoriesSignal().length;
    this.categoriesSignal.update((categories) =>
      categories.filter((category) => category.id !== id)
    );

    if (this.categoriesSignal().length < initialLength) {
      await this.saveCategories();
      return true;
    }
    return false;
  }

  /**
   * Obtiene una categoría por ID
   */
  getCategoryById(id: string): Category | undefined {
    return this.categoriesSignal().find((category) => category.id === id);
  }

  /**
   * Obtiene una categoría por nombre
   */
  getCategoryByName(name: string): Category | undefined {
    return this.categoriesSignal().find(
      (category) => category.name.toLowerCase() === name.toLowerCase()
    );
  }

  /**
   * Verifica si existe una categoría con el nombre dado
   */
  categoryExists(name: string, excludeId?: string): boolean {
    return this.categoriesSignal().some(
      (category) =>
        category.name.toLowerCase() === name.toLowerCase() &&
        category.id !== excludeId
    );
  }

  /**
   * Obtiene los colores disponibles para categorías
   */
  getAvailableColors(): string[] {
    return [
      '#6366f1', // índigo (primary)
      '#06b6d4', // cyan (secondary)
      '#ec4899', // rosa (tertiary)
      '#10b981', // verde esmeralda (success)
      '#f59e0b', // ámbar (warning)
      '#ef4444', // rojo coral (danger)
      '#8b5cf6', // violeta
      '#f97316', // naranja
      '#14b8a6', // teal
      '#3b82f6', // azul
      '#84cc16', // lima
      '#64748b', // gris pizarra
    ];
  }

  /**
   * Obtiene los iconos disponibles para categorías
   */
  getAvailableIcons(): string[] {
    return [
      'person-outline',
      'briefcase-outline',
      'cart-outline',
      'home-outline',
      'heart-outline',
      'star-outline',
      'bookmark-outline',
      'flag-outline',
      'folder-outline',
      'document-outline',
      'calendar-outline',
      'time-outline',
      'fitness-outline',
      'restaurant-outline',
      'car-outline',
      'airplane-outline',
      'school-outline',
      'medkit-outline',
      'cash-outline',
      'gift-outline',
    ];
  }
}
