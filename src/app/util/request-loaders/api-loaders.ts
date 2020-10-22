import { Subject, Observable, of } from 'rxjs';
import { map, switchMap, share, catchError, mergeMap, distinctUntilChanged } from 'rxjs/operators';

export interface SessionProvider {
  session$: Observable<any>;
  currentCompany$?: Observable<string>
  currentCompanyIdentifier?: string;
}

export interface CompanyProvider {
  currentCompany$: Observable<string>
  currentCompanyIdentifier: string;
}

export interface CompanyLoaderArgs {
  isRefreshing: boolean;
  shouldLoad: boolean;
  companyIdentifier: string;
}

export interface ObservableResult<T> {
  isRefreshing?: boolean;
  result: T;
}

export type CompanyLoaders = {[x: string]: Subject<CompanyLoaderArgs>};

export interface SharedObservableParameters<T> {
  loaderKey: string,
  callFunction: (companyIdentifer: string) => Observable<Object>;
  responseHandler: (value: Object, index?: number) => ObservableResult<T>;
  errorHandler: (error) => void|ObservableResult<T>;
}

export class APILoaders {

  private companyIdentifier: string|null = null;
  protected loaders: CompanyLoaders = {};
  protected sharedObservables: Record<string, Observable<ObservableResult<any>>> = {};

  constructor(sessionProvider: SessionProvider, { companyProvider }: {
    companyProvider? : CompanyProvider
  }={}) {

    const effectiveCompanyProvider = companyProvider ? companyProvider : sessionProvider;

    sessionProvider.session$.subscribe(session => {
      if (session) {
        this.refreshAllLoaders(true);
      } else {
        this.clearAllLoaders();
      }
    });

    effectiveCompanyProvider.currentCompany$
      .pipe(distinctUntilChanged())
      .subscribe(companyIdentifier => {
        this.setCompanyIdentifier(companyIdentifier);
      });

    this.setCompanyIdentifier(effectiveCompanyProvider.currentCompanyIdentifier);
  }

  private setCompanyIdentifier(companyIdentifier: string) {
    this.companyIdentifier = companyIdentifier;
    this.refreshAllLoaders(true);
  }

  public removeLoader(loaderKey) {
    delete this.loaders[loaderKey];
  }

  public getLoader(loaderKey): Subject<CompanyLoaderArgs> {
    return this.loaders[loaderKey];
  }

  public get loaderKeys(): string[] {
    return Object.keys(this.loaders);
  }

  public refreshAllLoaders(sendRefreshEvent: boolean = false) {
    if (sendRefreshEvent) {
      this.clearAllLoaders(true);
    }
    Object.keys(this.loaders).forEach(loaderKey => {
      this.refreshLoader(loaderKey);
    });
  }

  public clearAllLoaders(isRefreshing: boolean = false) {
    Object.keys(this.loaders).forEach(loaderKey => {
      this.clearLoader(loaderKey, isRefreshing);
    });
  }

  public refreshLoader(loaderKey: string) {
    this.loaders[loaderKey].next({
      shouldLoad: true,
      companyIdentifier: this.companyIdentifier,
      isRefreshing: false,
    });
  }

  public clearLoader(loaderKey: string, isRefreshing: boolean = false) {
    this.loaders[loaderKey].next({
      shouldLoad: false,
      companyIdentifier: null,
      isRefreshing: isRefreshing,
    });
  }

  public createSharedObservable<T>({
    loaderKey,
    callFunction,
    responseHandler,
    errorHandler,
  }: SharedObservableParameters<T>): Observable<ObservableResult<T>> {
    this.loaders[loaderKey] = new Subject<CompanyLoaderArgs>();
    this.sharedObservables[loaderKey] = this.loaders[loaderKey].pipe(switchMap((args, index) => {
      if (args.isRefreshing) {
        return of({
          isRefreshing: true,
          result: null,
        });
      }
      if (!args.shouldLoad) { return of({ isRefreshing: false, result: null }); }
      if (!args.companyIdentifier) { return of({ isRefreshing: false, result: null }); }
      return callFunction(args.companyIdentifier)
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
