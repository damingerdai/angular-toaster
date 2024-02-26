import { ModuleWithProviders, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IToasterConfig } from "./angular-toaster-config";
import { ToasterContainerComponent } from "./angular-toaster-container.component";
import { ToasterComponent } from "./angular-toaster.component";
import { ToasterService } from "./angular-toaster.service";
import { toasterConfigProvider } from "./angular-toaster.injectors";


@NgModule({
  imports: [
    CommonModule,
    ToasterComponent,
    ToasterContainerComponent,
  ],
  declarations: [],
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
