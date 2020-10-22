import { Router, ActivatedRoute, UrlSerializer } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { SessionService } from 'src/app/services/api/session.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent implements OnInit {

  private url = '';
  private queryParams: {[key: string]: string} = {};

  private static isRootUrl(url: string): boolean {
    return url === '/';
  }

  constructor(
    private router: Router,
    private serializer: UrlSerializer,
    private route: ActivatedRoute,
    private sessionService: SessionService,
  ) {
  }

  ngOnInit() {
    [this.url] = this.router.url.split('?');
    this.queryParams = Object.assign({}, this.route.snapshot.queryParams);
    const sessionRequirement = this.queryParams._session;
    delete this.queryParams._session;

    this.sessionService.syncSession()
      .then(session => {
        if (session && !this.sessionService.currentCompanyIdentifier) {
          this.router.navigate(['account-pending']);
          return;
        }
        if (LoadingComponent.isRootUrl(this.url)) {
          if (session) {
            this.router.navigate(['home']);
          } else {
            this.router.navigate(['signin']);
          }
        } else if (session) {
          this.sessionService.consumeRedirectUrl();
          const targetUrl = this.getTargetUrl(this.url, this.queryParams);
          if (targetUrl !== null) {
            this.router.navigateByUrl(targetUrl);
          } else {
            this.router.navigate(['home']);
          }
        } else {
          const targetUrl = this.getTargetUrl(this.url, this.queryParams);
          if (targetUrl !== null && sessionRequirement === 'disallowed') {
            this.router.navigateByUrl(targetUrl);
          } else {
            this.router.navigate(['signin']);
          }
        }
      });
  }

  private getTargetUrl(loadingUrl: string, queryParams: {[key: string]: string}) {
    const urlComponents: string[] = loadingUrl.split('/');
    if (urlComponents[1] !== 'loading') { return null; }
    const redirectComponents = [];
    redirectComponents.push(urlComponents[0], ...urlComponents.slice(2));
    const url = redirectComponents.join('/');
    const urlTree = this.router.createUrlTree([url], { queryParams: queryParams });
    const serializedUrl = this.serializer.serialize(urlTree);
    return serializedUrl;
  }
}
