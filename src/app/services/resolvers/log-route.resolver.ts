import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class LogRouteResolver implements Resolve<any> {
  constructor(
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): void {
    console.log('--------------Log-Route-----------------');
    console.log(route.url);
    console.log('----------------------------------------');
  }
}
