import { HttpClient } from '@angular/common/http';
import { afterNextRender, Component, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { defer, map, race, switchMap } from 'rxjs';

@Component({
  selector: 'app-getting-started',
  imports: [],
  templateUrl: './getting-started.component.html',
  styleUrl: './getting-started.component.scss'
})
export class GettingStartedComponent {

  private readonly docs = 'https://raw.githubusercontent.com/damingerdai/angular-toaster/refs/heads/develop/packages/angular-toaster/README.md';
  private readonly chinaDocs = 'https://gh-proxy.com/raw.githubusercontent.com/damingerdai/angular-toaster/refs/heads/develop/packages/angular-toaster/README.md';
  protected loading = true;
  protected markdownContent: SafeHtml | null = null;
  httpClient = inject(HttpClient);
  sanitizer = inject(DomSanitizer);

  constructor() {
    afterNextRender(() => {
      this.fetchData();
    })
    // You can inject HttpClient here if needed
  }

  fetchData() {
    const reqs = [
      this.httpClient.get(this.docs, { responseType: 'text' }),
      this.httpClient.get(this.chinaDocs, { responseType: 'text' })];
    race(...reqs).pipe(
      switchMap((data) => defer(() => marked.parse(data, { async: true }))),
      map(html => this.sanitizer.bypassSecurityTrustHtml(html))
    ).subscribe({
      next: (data) => {
        console.log(data);
        this.markdownContent = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching documentation:', err);
        this.loading = false;
      }
    });
  }
}
