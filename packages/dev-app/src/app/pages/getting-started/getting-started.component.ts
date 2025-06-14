import { HttpClient } from '@angular/common/http';
import { afterNextRender, Component, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Marked } from 'marked';
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';
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
  protected marked: Marked;;
  httpClient = inject(HttpClient);
  sanitizer = inject(DomSanitizer);

  constructor() {
    this.marked = new Marked(
      markedHighlight({
        emptyLangClass: 'hljs',
        langPrefix: 'hljs language-',
        highlight(code, lang) {
          const language = hljs.getLanguage(lang) ? lang : 'plaintext';
          return hljs.highlight(code, { language }).value;
        }
      })
    );

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
      switchMap((data) => defer(() => this.marked.parse(data, { async: true }))),
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
