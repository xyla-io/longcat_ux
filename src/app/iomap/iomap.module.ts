import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntityDisplayNamePipe } from './pipes/entity-display-name.pipe';



@NgModule({
  declarations: [
    EntityDisplayNamePipe,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    EntityDisplayNamePipe,
  ]
})
export class IomapModule { }
