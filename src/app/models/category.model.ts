export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_CATEGORIES: Omit<
  Category,
  'id' | 'createdAt' | 'updatedAt'
>[] = [
  { name: 'Personal', color: '#3880ff', icon: 'person-outline' },
  { name: 'Trabajo', color: '#eb445a', icon: 'briefcase-outline' },
  { name: 'Compras', color: '#2dd36f', icon: 'cart-outline' },
  { name: 'Hogar', color: '#ffc409', icon: 'home-outline' },
];
