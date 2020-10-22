import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { OptionConfig, Options } from '../../../iomap/util/options';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { Subject, fromEvent, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-option-single-select',
  templateUrl: './option-single-select.component.html',
  styleUrls: ['./option-single-select.component.scss']
})
export class OptionSingleSelectComponent implements OnInit, OnDestroy {
  Options = Options;
  readonly itemHeight = 20;

  @Input() options: Record<string, OptionConfig<any>>;
  @Input() selection: string;
  @Input() label?: string;
  @Input() search?: boolean = false;
  @Output() selectionChange = new EventEmitter<string>();

  destroyed$ = new Subject();
  searchOptions: OptionConfig<any>[];
  searchControl = new FormControl();
  searchDropdownOpen = false;
  dropdownOpenSubscriptions: Subscription;
  focusedIndex = 0;

  @ViewChild(CdkVirtualScrollViewport, { static : false }) viewPort: CdkVirtualScrollViewport;
  @ViewChild('searchInput', { static: false }) searchInput: ElementRef;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
  }

  setFocusedIndex(i: number) {
    this.focusedIndex = i;
    if (this.viewPort) {
      this.viewPort.scrollToIndex(i);
    }
  }

  setSearchOptions(options: OptionConfig<any>[]) {
    this.searchOptions = options;
    this.setViewportHeight();
  }

  setViewportHeight() {
    if (!this.viewPort) { return; }
    try {
      const items = this.searchOptions.length;
      if (!items) {
        this.viewPort.elementRef.nativeElement.style.setProperty('height', `${this.itemHeight}px`);
      } else if (items < 5) {
        this.viewPort.elementRef.nativeElement.style.setProperty('height', `${this.itemHeight * items}px`);
      } else {
        this.viewPort.elementRef.nativeElement.style.setProperty('height', `${this.itemHeight * 4}px`);
      }
    } catch {}
  
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
  
  filterSearchOptions(value: string) {
    this.setFocusedIndex(0);
    if (!value) {
      this.setSearchOptions(Options.values(this.options));
      return;
    }
    this.setSearchOptions(Options.values(this.options).filter(option => {
      return option.displayName.toLowerCase().includes(value.toLowerCase())
    }));

  }

  onChange(event) {
    const value = typeof event === 'string' ? event : event.target.value;
    if (value !== this.selection) {
      this.selectionChange.emit(value);
    } else {
      this.searchControl &&
        this.searchControl.setValue(this.options[this.selection].displayName);
    }
    this.searchInput &&
      this.searchInput.nativeElement.blur();
    this.searchDropdownOpen = false
  }

  onClickOpenDropdown(event: MouseEvent|FocusEvent) {
    this.searchInput.nativeElement.focus();
    this.searchInput.nativeElement.select();
    this.setSearchOptions(Options.values(this.options));
    this.setFocusedIndex(this.searchOptions.findIndex(option => option.key === this.selection));
    if (this.dropdownOpenSubscriptions) {
      this.dropdownOpenSubscriptions.unsubscribe();
    }
    this.searchDropdownOpen = true;
    let firstClick = true;
    this.dropdownOpenSubscriptions = fromEvent(window, 'click').pipe(
      takeUntil(this.destroyed$)
    ).subscribe(() => {
      if (!firstClick) {
        this.closeDropdownWithoutSelect();
      }
      firstClick = false;
    });
    this.dropdownOpenSubscriptions.add(this.searchControl.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroyed$),
    ).subscribe(value => {
      this.filterSearchOptions(value);
    }));
    // necessary for setting the viewport height when focused by tabbing
    setTimeout(() => this.setViewportHeight());
  } 
  onSearchKeyDown(event) {
    switch (event.key) {
      case 'Enter': 
        if (!this.searchOptions.length) {
          return;
        }
        this.onChange(this.searchOptions[this.focusedIndex].key);
        return;
      case 'ArrowDown':
        this.setFocusedIndex(this.focusedIndex >= this.searchOptions.length - 1 ? 0 : this.focusedIndex + 1);
        return;
      case 'ArrowUp':
        this.setFocusedIndex(this.focusedIndex > 0 ? this.focusedIndex - 1 : this.searchOptions.length - 1);
        return;
      case 'Tab':
        this.closeDropdownWithoutSelect();
        return;

    }
  }

  closeDropdownWithoutSelect() {
    this.searchDropdownOpen = false;
    this.dropdownOpenSubscriptions.unsubscribe();
    this.searchControl.setValue(this.options[this.selection].displayName);
  }

  onSelectOption(option) {
    this.onChange(option.key);
  }

  onHoverOption(option: OptionConfig<any>, i: number) {
    this.focusedIndex = i;
  }

}
