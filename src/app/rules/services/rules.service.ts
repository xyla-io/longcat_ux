import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Rule, RuleOps } from '../models/rule';
import { APIResponse } from 'src/app/services/api/api.service';
import { DragonAPIService } from './dragon-api.service';
import { Subject } from 'rxjs';
import { _ID } from '../../iomap/util/models';
import { IOMapService } from './iomap.service';
import { map } from 'rxjs/internal/operators/map';

export interface RulesAPIResponse extends APIResponse {
  rules: Rule[];
}

export interface RuleAPIResponse extends APIResponse {
  rule: Rule;
}

export interface RulePatch {
  id: string;
  shouldPerformAction?: boolean;
  shouldSendEmail?: boolean;
  isEnabled?: boolean;
  modified: Date;
}

@Injectable({
  providedIn: 'root'
})
export class RulesService {
  public static readonly baseURL: string = `${environment.rulesAPIBaseURL}/rules`;

  ruleMutation$ = new Subject<Rule>();
  ruleDeletion$ = new Subject<_ID<Rule>>();
  ruleCreation$ = new Subject<Rule>();

  constructor(
    private api: DragonAPIService,
    private iomapService: IOMapService,
  ) {
  }

  getRules() {
    return this.api.client.get(RulesService.baseURL)
      .pipe(map((response: RulesAPIResponse) => response.rules))
      .toPromise();
  }

  deleteByID(ruleID: string) {
    return this.api.client.delete(`${RulesService.baseURL}/${ruleID}`)
      .toPromise()
      .then(() => {
        this.ruleDeletion$.next(ruleID)
        return null;
      });
  }

  create(rule: Rule): Promise<Rule> {
    RuleOps.prepareForSave(rule, this.iomapService.entityReport);
    return this.api.client
      .post(RulesService.baseURL, rule)
      .toPromise()
      .then(response => {
        const { rule } = response as RuleAPIResponse;
        this.ruleCreation$.next(rule)
        return rule;
      });
  }

  save(rule: Rule): Promise<Rule> {
    RuleOps.prepareForSave(rule, this.iomapService.entityReport);
    return this.api.client
      .put(`${RulesService.baseURL}/${rule._id}`, rule)
      .toPromise()
      .then(response => {
        const { rule: updatedRule } = response as RuleAPIResponse;
        this.ruleMutation$.next(updatedRule)
        return updatedRule;
      })
      .catch(error => {
        this.handleConflict(error);
        throw error;
      });
  }

  patch(rulePatch: RulePatch): Promise<Rule> {
    return this.api.client
      .patch(`${RulesService.baseURL}/${rulePatch.id}`, rulePatch)
      .toPromise()
      .then(response => {
        const { rule: updatedRule } = response as RuleAPIResponse;
        this.ruleMutation$.next(updatedRule)
        return updatedRule;
      })
      .catch(error => {
        this.handleConflict(error);
        throw error;
      });
  }

  private handleConflict(error) {
    if (error.status === 409) {
      this.ruleMutation$.next(error.error.rule);
    }
  }
}

