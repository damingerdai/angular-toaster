import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'trustHtml',
    pure: true
})
export class TrustHtmlPipe implements PipeTransform {

    private sanitizer: DomSanitizer = inject(DomSanitizer);

    constructor() {
    }

    transform(content: any): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(content);
    }
}
