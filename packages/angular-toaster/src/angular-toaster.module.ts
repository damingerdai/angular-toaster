import { ModuleWithProviders, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IToasterConfig, ToasterConfigInjectionToken, defaultToasterConfig } from "./angular-toaster-config";;
import { TrustHtmlPipe } from "./trust-html.pipe";
import { ToasterContainerComponent } from "./angular-toaster-container.component";
import { ToasterComponent } from "./angular-toaster.component";
import { ToasterService } from "./angular-toaster.service";

const toasterConfigProvider = (config?: IToasterConfig) => {
  return {
    provide: ToasterConfigInjectionToken, useFactory: () => {
      const defaultConfig: IToasterConfig = config ? { ...defaultToasterConfig, ...config } : defaultToasterConfig;
      return defaultConfig;
    }
  }
}


@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    ToasterContainerComponent,
    ToasterComponent,
    TrustHtmlPipe
  ],
  exports: [
    ToasterContainerComponent,
    ToasterComponent
  ]
})
export class ToasterModule {

  static forRoot(config?: IToasterConfig): ModuleWithProviders<ToasterModule> {
    return {
      ngModule: ToasterModule,
      providers: [
        toasterConfigProvider(config),
        ToasterService,
        ToasterContainerComponent
      ]
    };
  }

  static forChild(config?: IToasterConfig): ModuleWithProviders<ToasterModule> {
    return {
      ngModule: ToasterModule,
      providers: [
        toasterConfigProvider(config),
        ToasterContainerComponent
      ]
    }
  }
}
