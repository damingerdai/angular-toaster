import { Component, ChangeDetectionStrategy } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: "app-navbar",
  imports: [RouterLink, RouterLinkActive],
  templateUrl: "./navbar.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: "./navbar.component.scss",
})
export class NavbarComponent {}
