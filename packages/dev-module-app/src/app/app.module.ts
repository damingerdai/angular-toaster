import { NgModule } from "@angular/core";
import {
  BrowserModule,
  provideClientHydration,
  withNoIncrementalHydration,
} from "@angular/platform-browser";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { ToasterModule } from "angular-toaster";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, ToasterModule.forRoot()],
  providers: [
    provideClientHydration(withNoIncrementalHydration()),
    provideAnimationsAsync(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
