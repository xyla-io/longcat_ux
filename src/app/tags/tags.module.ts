import { NgModule, Compiler } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';

// Vendor
import { AgGridModule } from 'ag-grid-angular';
import { NgxSmartModalModule } from 'ngx-smart-modal';

// Required for Enterprise edition of ag-grid
import 'ag-grid-enterprise'

// Modules
import { SharedModule } from '../shared/shared.module';

// Services
import { CompanyResolver } from '../services/resolvers/company.resolver';
import { SessionGuardService } from '../services/access/session-guard.service';
import { SuperGuardService } from '../services/access/super-guard.service';

// Utilities
import { environmentBasedRoutes } from '../util/environment-based-routes';

// Components
import { ListTagsComponent } from './components/list-tags/list-tags.component';
import { Routes, RouterModule, ROUTES } from '@angular/router';
import { NbSidebarModule, NbLayoutModule, NbTooltipModule, NbIconModule, NbButtonModule, NbSpinnerModule, NbPopoverModule } from '@nebular/theme';
import { SidebarModule } from '../sidebar/sidebar.module';
import { GridModule } from '../grid/grid.module';
import { CreateParserComponent } from './components/create-parser/create-parser.component';
import { EditTagParserComponent } from './sidebar/edit-tag-parser/edit-tag-parser.component';
import { IomapModule } from '../iomap/iomap.module';
import { NodeTaggableEntityComponent } from './components/node-taggable-entity/node-taggable-entity.component';
import { SequenceParserPatternPipe } from './pipes/sequence-parser-pattern.pipe';
import { GraphTestComponent } from './components/graph-test/graph-test.component';

export function EnvironmentBasedRouteFactory(compiler: Compiler): Routes {
  return environmentBasedRoutes([
    {
      path: 'manage/tags',
      component: ListTagsComponent,
      // FIXME: add in when adding the access requirements
      canActivate: [SessionGuardService, SuperGuardService, /* AccessGuardService */ ],
      resolve: { company: CompanyResolver, },
      data: {
        companyDependent: true,
        title: 'Manage Tags',
        // FIXME: add in the access requirement
        // access: [
        //   {
        //     targetPath: '_tags',
        //     prefixTargetPathWithCompany: true,
        //     action: 'list',
        //   }
        // ],
      }
    },
    {
      path: 'graph-test',
      component: GraphTestComponent,
      canActivate: [SessionGuardService, /* AccessGuardService */ ],
      resolve: { company: CompanyResolver, },
      data: {
        companyDependent: true,
      },
    },
  ]);
}

@NgModule({
  entryComponents: [
    EditTagParserComponent,
    ListTagsComponent,
    NodeTaggableEntityComponent,
    GraphTestComponent,
  ],
  declarations: [
    ListTagsComponent,
    CreateParserComponent,
    EditTagParserComponent,
    NodeTaggableEntityComponent,
    GraphTestComponent,
    SequenceParserPatternPipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([]),
    SharedModule,
    SidebarModule,
    GridModule,
    IomapModule,
    NbSidebarModule,
    NbTooltipModule,
    NbPopoverModule,
    NbLayoutModule,
    NbIconModule,
    NbButtonModule,
    NbSpinnerModule,
    NgxSmartModalModule,
    AgGridModule.withComponents([]),
    ScrollingModule,
  ],
  exports: [
    EditTagParserComponent,
  ],
  providers: [
    CompanyResolver,
    {
      provide: ROUTES,
      deps: [Compiler],
      multi: true,
      useFactory: EnvironmentBasedRouteFactory,
      useValue: [],
    },
  ],
})
export class TagsModule { }
