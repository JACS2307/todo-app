import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Preferences } from '@capacitor/preferences';
import { from, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

/**
 * Servicio de almacenamiento local que usa Capacitor Preferences
 * para persistencia de datos en dispositivos móviles y web
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /**
   * Guarda un valor en el almacenamiento local
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await Preferences.set({ key, value: jsonValue });
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene un valor del almacenamiento local
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const { value } = await Preferences.get({ key });
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  }

  /**
   * Elimina un valor del almacenamiento local
   */
  async remove(key: string): Promise<void> {
    try {
      await Preferences.remove({ key });
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw error;
    }
  }

  /**
   * Limpia todo el almacenamiento local
   */
  async clear(): Promise<void> {
    try {
      await Preferences.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  /**
   * Versiones Observable para uso reactivo
   */
  get$<T>(key: string): Observable<T | null> {
    return from(this.get<T>(key)).pipe(
      catchError((error) => {
        console.error(`Error in get$ for ${key}:`, error);
        return of(null);
      })
    );
  }

  set$<T>(key: string, value: T): Observable<void> {
    return from(this.set(key, value)).pipe(
      catchError((error) => {
        console.error(`Error in set$ for ${key}:`, error);
        throw error;
      })
    );
  }
}
