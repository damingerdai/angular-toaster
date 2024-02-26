import { IToasterConfig, ToasterConfigInjectionToken, defaultToasterConfig } from './angular-toaster-config';

export const toasterConfigProvider = (config?: IToasterConfig) => {
    return {
      provide: ToasterConfigInjectionToken, useFactory: () => {
        const defaultConfig: IToasterConfig = config ? { ...defaultToasterConfig, ...config } : defaultToasterConfig;
        return defaultConfig;
      }
    }
  }