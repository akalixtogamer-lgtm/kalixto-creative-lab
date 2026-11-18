import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      // Parâmetros de rota (:id, ?lab=) chegam direto como input() nos componentes
      withComponentInputBinding(),
      // Ao trocar de página, volta ao topo; links com âncora (#ef-codigo) rolam até ela
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
    ),
  ],
};
