import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Category } from 'src/app/models/category.model';
import { CategoryService } from 'src/app/services/category.service';
import { TaskService } from 'src/app/services/task.service';

import { addIcons } from 'ionicons';
import {
  add,
  trash,
  create,
  close,
  checkmark,
  colorPaletteOutline,
  chevronDownOutline,

  // Iconos disponibles para categorías
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

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule, CommonModule],
})
export class CategoryComponent implements OnInit {
  readonly categoryService = inject(CategoryService);
  private readonly taskService = inject(TaskService);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private fb = inject(FormBuilder);

  isModalOpen = signal(false);
  isEditing = signal(false);
  selectedCategory = signal<Category | null>(null);

  categoryForm!: FormGroup;
  availableColors: string[] = [];
  availableIcons: string[] = [];

  private colorNames: { [key: string]: string } = {
    '#3880ff': 'Azul',
    '#3dc2ff': 'Celeste',
    '#5260ff': 'Índigo',
    '#2dd36f': 'Verde',
    '#ffc409': 'Amarillo',
    '#eb445a': 'Rojo',
    '#92949c': 'Gris',
    '#222428': 'Negro',
    '#8b5cf6': 'Violeta',
    '#f97316': 'Naranja',
    '#14b8a6': 'Teal',
    '#ec4899': 'Rosa',
  };

  private iconNames: { [key: string]: string } = {
    'person-outline': 'Persona',
    'briefcase-outline': 'Trabajo',
    'cart-outline': 'Compras',
    'home-outline': 'Casa',
    'heart-outline': 'Favoritos',
    'star-outline': 'Destacado',
    'bookmark-outline': 'Marcador',
    'flag-outline': 'Bandera',
    'folder-outline': 'Carpeta',
    'document-outline': 'Documento',
    'calendar-outline': 'Calendario',
    'time-outline': 'Tiempo',
    'fitness-outline': 'Fitness',
    'restaurant-outline': 'Restaurante',
    'car-outline': 'Auto',
    'airplane-outline': 'Viajes',
    'school-outline': 'Educación',
    'medkit-outline': 'Salud',
    'cash-outline': 'Dinero',
    'gift-outline': 'Regalos',
  };

  constructor() {
    addIcons({
      add,
      trash,
      create,
      close,
      checkmark,
      colorPaletteOutline,
      chevronDownOutline,

      // Iconos para categorías
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
    this.availableColors = this.categoryService.getAvailableColors();
    this.availableIcons = this.categoryService.getAvailableIcons();
    this.initForm();
  }

  private initForm(category?: Category) {
    this.categoryForm = this.fb.group({
      name: [
        category?.name || '',
        [Validators.required, Validators.minLength(1)],
      ],
      color: [category?.color || this.availableColors[0], Validators.required],
      icon: [category?.icon || this.availableIcons[0]],
    });
  }

  openCategoryModal() {
    this.selectedCategory.set(null);
    this.isEditing.set(false);
    this.initForm();
    this.isModalOpen.set(true);
  }

  editCategory(category: Category) {
    this.selectedCategory.set(category);
    this.isEditing.set(true);
    this.initForm(category);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedCategory.set(null);
    this.isEditing.set(false);
  }

  async saveCategory() {
    if (this.categoryForm.valid) {
      const formValue = this.categoryForm.value;
      const categoryData = {
        name: formValue.name.trim(),
        color: formValue.color,
        icon: formValue.icon,
      };

      try {
        // Verificar si ya existe una categoría con ese nombre
        const existingId = this.selectedCategory()?.id;
        if (
          this.categoryService.categoryExists(categoryData.name, existingId)
        ) {
          await this.showToast(
            'Ya existe una categoría con ese nombre',
            'warning'
          );
          return;
        }

        if (this.isEditing() && this.selectedCategory()) {
          await this.categoryService.updateCategory(
            this.selectedCategory()!.id,
            categoryData
          );
          await this.showToast('Categoría actualizada', 'success');
        } else {
          await this.categoryService.addCategory(categoryData);
          await this.showToast('Categoría creada', 'success');
        }

        this.closeModal();
      } catch (error) {
        await this.showToast('Error al guardar la categoría', 'danger');
      }
    }
  }

  async deleteCategory(category: Category) {
    const taskCount = this.getTaskCount(category.id);
    let message = `¿Estás seguro de que deseas eliminar "${category.name}"?`;

    if (taskCount > 0) {
      message += ` Esta categoría tiene ${taskCount} tarea(s) asociada(s).`;
    }

    const alert = await this.alertController.create({
      header: 'Eliminar categoría',
      message,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.categoryService.deleteCategory(category.id);
            await this.showToast('Categoría eliminada', 'success');
          },
        },
      ],
    });

    await alert.present();
  }

  getTaskCount(categoryId: string): number {
    return this.taskService.getTasksByCategory(categoryId).length;
  }

  getColorName(color: string): string {
    return this.colorNames[color] || color;
  }

  getIconName(icon: string): string {
    return this.iconNames[icon] || icon;
  }

  selectColor(color: string): void {
    this.categoryForm.patchValue({ color });
  }

  isColorSelected(color: string): boolean {
    return this.categoryForm.get('color')?.value === color;
  }

  selectIcon(icon: string): void {
    this.categoryForm.patchValue({ icon });
  }

  isIconSelected(icon: string): boolean {
    return this.categoryForm.get('icon')?.value === icon;
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
