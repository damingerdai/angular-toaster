import { HttpClient } from '@angular/common/http';
import { afterNextRender, Component, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Marked } from 'marked';
import { markedHighlight } from "marked-highlight";
import { defer, map, race, Subscription, switchMap } from 'rxjs';

import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import bash from 'highlight.js/lib/languages/bash';

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('bash', bash);

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
  protected marked!: Marked;;
  private httpClient = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private sub = new Subscription();

  constructor() {
    this.initMarked();

    afterNextRender(() => {
      this.fetchData();
    })


    // You can inject HttpClient here if needed
  }

  private initMarked() {
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
  }

  fetchData() {
    const reqs = [
      this.httpClient.get(this.docs, { responseType: 'text' }),
      this.httpClient.get(this.chinaDocs, { responseType: 'text' })
    ];

    this.sub = race(...reqs).pipe(
      switchMap((data) => defer(() => this.marked.parse(data, { async: true }))),
      map(html => this.sanitizer.bypassSecurityTrustHtml(html))
    ).subscribe({
      next: (data) => {
        this.markdownContent = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching documentation:', err);
        this.loading = false;
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
