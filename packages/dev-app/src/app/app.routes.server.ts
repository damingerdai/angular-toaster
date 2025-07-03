import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
    {
        path: '',
        renderMode: RenderMode.Client,
    },
    {
        path: 'home',
        renderMode: RenderMode.Prerender,
    },
    {
        path: 'getting-started',
        renderMode: RenderMode.Prerender,
    }

];
