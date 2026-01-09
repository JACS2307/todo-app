import {
  Injectable,
  inject,
  signal,
  computed,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  RemoteConfig,
  fetchAndActivate,
  getBoolean,
} from '@angular/fire/remote-config';

/**
 * Configuración por defecto para Remote Config
 */
export interface RemoteConfigDefaults {
  feature_categories: boolean;
  feature_statistics: boolean;
}

const DEFAULT_CONFIG: RemoteConfigDefaults = {
  feature_categories: true,
  feature_statistics: true,
};

/**
 * Servicio para gestionar Firebase Remote Config
 */
@Injectable({
  providedIn: 'root',
})
export class RemoteConfigService {
  private remoteConfig = inject(RemoteConfig, { optional: true });
  private platformId = inject(PLATFORM_ID);

  // Estado reactivo
  private configLoadedSignal = signal<boolean>(false);
  private configErrorSignal = signal<string | null>(null);
  private featuresSignal = signal<RemoteConfigDefaults>(DEFAULT_CONFIG);

  // Selectores computados
  readonly configLoaded = computed(() => this.configLoadedSignal());
  readonly configError = computed(() => this.configErrorSignal());
  readonly features = computed(() => this.featuresSignal());

  // Feature flags individuales como signals
  readonly categoriesEnabled = computed(
    () => this.featuresSignal().feature_categories
  );
  readonly statisticsEnabled = computed(
    () => this.featuresSignal().feature_statistics
  );

  constructor() {
    this.initializeRemoteConfig();
  }

  /**
   * Inicializa Remote Config con valores por defecto
   */
  private async initializeRemoteConfig(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      console.log('Remote Config: Not running in browser, using defaults');
      return;
    }

    if (!this.remoteConfig) {
      console.log('Remote Config: Not configured, using defaults');
      return;
    }

    try {
      this.remoteConfig.settings.minimumFetchIntervalMillis = this.isDevMode()
        ? 0
        : 3600000;

      // Fetch y activar configuración remota
      await this.fetchAndActivateConfig();
    } catch (error) {
      console.error('Error initializing Remote Config:', error);
      this.configErrorSignal.set('Error initializing Remote Config');
    }
  }

  /**
   * Obtiene y activa la configuración remota
   */
  async fetchAndActivateConfig(): Promise<boolean> {
    if (!this.remoteConfig) {
      console.warn('Remote Config not available');
      return false;
    }

    try {
      const activated = await fetchAndActivate(this.remoteConfig);

      // Siempre actualizar features - activated=false solo significa que no hay cambios nuevos
      this.updateFeaturesFromRemote();

      this.configLoadedSignal.set(true);
      this.configErrorSignal.set(null);

      console.log('Remote Config fetched and activated:', activated);
      console.log('Remote Config values:', this.featuresSignal());
      return activated;
    } catch (error) {
      console.error('Error fetching Remote Config:', error);
      this.configErrorSignal.set('Error fetching configuration');
      return false;
    }
  }

  /**
   * Actualiza los features desde la configuración remota
   */
  private updateFeaturesFromRemote(): void {
    if (!this.remoteConfig) return;

    const updatedConfig: RemoteConfigDefaults = {
      feature_categories: this.getBooleanValue(
        'feature_categories',
        DEFAULT_CONFIG.feature_categories
      ),
      feature_statistics: this.getBooleanValue(
        'feature_statistics',
        DEFAULT_CONFIG.feature_statistics
      ),
    };

    this.featuresSignal.set(updatedConfig);
  }

  /**
   * Obtiene un valor booleano de Remote Config
   */
  private getBooleanValue(key: string, defaultValue: boolean = false): boolean {
    if (!this.remoteConfig) return defaultValue;
    try {
      return getBoolean(this.remoteConfig, key);
    } catch {
      return defaultValue;
    }
  }

  /**
   * Verifica si estamos en modo desarrollo
   */
  private isDevMode(): boolean {
    return true;
  }

  /**
   * Fuerza un refresh de la configuración
   */
  async refreshConfig(): Promise<boolean> {
    return this.fetchAndActivateConfig();
  }
}
