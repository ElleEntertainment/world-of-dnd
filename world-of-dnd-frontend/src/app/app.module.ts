import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routing';
import { LayoutModule } from './layout/layout.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { AuthInterceptor } from './shared/interceptors/auth.interceptor';
import { InitializerService } from './shared/services/initializer/initializer.service';
@NgModule({
    declarations: [AppComponent],
    imports: [
        CommonModule,
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        RouterModule.forRoot(appRoutes, { enableTracing: false }),
        LayoutModule
    ],
    providers: [
        InitializerService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        {
            provide: APP_INITIALIZER,
            multi: true,
            deps: [InitializerService],
            useFactory: (initializerService: InitializerService): (() => any) => {
                return (): any => {
                    return initializerService.initApp();
                };
            }
        }
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
