import { makeEnvironmentProviders } from '@angular/core';
import { IToasterConfig } from './angular-toaster-config';
import { toasterConfigProvider } from './angular-toaster.injectors';
import { ToasterService } from './angular-toaster.service';
import { ToasterContainerComponent } from './angular-toaster-container.component';

export const provideAngularToaster = (config?: IToasterConfig) => {
    return makeEnvironmentProviders([
        toasterConfigProvider(config),
        ToasterService,
        ToasterContainerComponent
    ])
}

