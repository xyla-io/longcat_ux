import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NotificationCount, NotificationService } from '../../services/notification.service';

interface NotificationBadgeBubble {
  class: string;
  label: string|((number) => string);
  count: (notificationCount: NotificationCount) => number;
  isLeftEnd?: boolean;
  isRightEnd?: boolean;
}

@Component({
  selector: 'app-badge-rule-notifications',
  templateUrl: './badge-rule-notifications.component.html',
  styleUrls: ['./badge-rule-notifications.component.scss']
})
export class BadgeRuleNotificationsComponent implements OnInit, OnChanges {

  @Input() notifications: NotificationCount;

  bubbles: NotificationBadgeBubble[] = [
    {
      class: 'light-purple',
      label: (n) => `${n}% active`,
      count: (notifications: NotificationCount) => {
        if (!this.notifications.counts.execute) { return 0; }
        return Number(((notifications.counts.action / notifications.counts.execute) * 100).toFixed(0))
      },
    },
    {
      class: 'green',
      label: 'action',
      count: (notifications: NotificationCount) => notifications.counts.action,
    },
    {
      class: 'slate',
      label: 'run',
      count: (notifications: NotificationCount) => notifications.counts.execute,
    },
    {
      class: 'red',
      label: 'error',
      count: (notifications: NotificationCount) => notifications.counts.failed + notifications.counts.error,
    },
  ];
  counts = {};
  allZeros = false;

  get trailingActivityDays() {
    return NotificationService.trailingActivityDays;
  }

  constructor() { }
  ngOnInit() {
  }

  ngOnChanges(c: SimpleChanges) {
    if (this.notifications) {
      this.bubbles.forEach(bubble => {
        this.counts[bubble.class] = bubble.count(this.notifications);
      });
      this.bubbles.forEach((bubble, i) => {
        bubble.isLeftEnd = this.isLeftEnd(i);
        bubble.isRightEnd = this.isRightEnd(i);
      })
      this.allZeros = this.bubbles.every(bubble => !this.counts[bubble.class]);
    }
  }

  makeLabel(bubble: NotificationBadgeBubble): string {
    const count = this.counts[bubble.class];
    if (typeof bubble.label === 'function') {
      return bubble.label(count);
    }
    return count ? `${count} ${bubble.label}${count === 1 ? '': 's'}` : '';
  }

  private isLeftEnd(i: number) {
    return this.bubbles.slice(0, i).every(bubble => !this.counts[bubble.class])
  }

  private isRightEnd(i: number) {
    return this.bubbles.slice(i + 1).every(bubble => !this.counts[bubble.class])
  }
}
