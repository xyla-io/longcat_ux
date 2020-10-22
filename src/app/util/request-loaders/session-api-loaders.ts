import { Subject, Observable, of, BehaviorSubject } from 'rxjs';
import { map, switchMap, share, catchError } from 'rxjs/operators';
import { APILoaders, ObservableResult, CompanyLoaderArgs, SharedObservableParameters, SessionProvider, CompanyProvider } from './api-loaders';

export class SessionAPILoaders extends APILoaders {

  constructor(sessionProvider: SessionProvider) {
    super(sessionProvider, {companyProvider: {
      currentCompany$: new Subject(),
      currentCompanyIdentifier: null,
    }});
  }

  public refreshLoader(loaderKey: string) {
    this.loaders[loaderKey].next({
      shouldLoad: true,
      companyIdentifier: null,
      isRefreshing: false,
    });
  }

  public createSharedObservable<T>({
    loaderKey,
    callFunction,
    responseHandler,
    errorHandler,
  }: SharedObservableParameters<T>): Observable<ObservableResult<T>> {
    this.loaders[loaderKey] = new BehaviorSubject<CompanyLoaderArgs>({ isRefreshing: false, shouldLoad: false, companyIdentifier: null });
    this.sharedObservables[loaderKey] = this.loaders[loaderKey].pipe(switchMap((args, index) => {
      if (args.isRefreshing) {
        return of({
          isRefreshing: true,
          result: null,
        });
      }
      if (!args.shouldLoad) { return of({ isRefreshing: false, result: null }); }
      return callFunction(null)
        .pipe(
          map(responseHandler),
          catchError(error => {
            let handlerResult = errorHandler(error);
            if (handlerResult) {
              return of(handlerResult);
            }
            return of({ isRefreshing: false, result: null });
          })
        );
    })).pipe(share());
    return this.sharedObservables[loaderKey];
  }

  public getSharedObservable<T>(loaderKey: string): Observable<ObservableResult<T>> {
    return this.sharedObservables[loaderKey];
  }
}
