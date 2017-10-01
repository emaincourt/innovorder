import {
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
  Component,
} from '@angular/core';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
  startOfWeek,
  addMinutes,
  format,
  closestIndexTo,
  isBefore,
} from 'date-fns';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent
} from 'angular-calendar';
import {
  RestaurantsService,
} from './restaurants.service';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/takeWhile'
import { flow } from 'lodash';

const colors: any = {
  pink: {
    primary: '#F87D7F',
    secondary: '#F87D7F'
  }
};

const days = {
  'MON': 1,
  'TUE': 2,
  'WED': 3,
  'THU': 4,
  'FRI': 5,
  'SAT': 6,
  'SUN': 0,
};

export class Schedule {
  day: string;
  start: number;
  end: number;
  id: string;
  constructor({ day, start, end, id }) {
    this.day = day;
    this.start = start;
    this.end = end;
    this.id = id;
  }
}

export class ScheduleSet {
  id: string;
  schedules: Schedule[];
}

export class Restaurant {
  id: string;
  name: string;
  scheduleSetId: string;
  scheduleSet: ScheduleSet;
  preparationDelay: number;
  rushDelay: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.css',
  ],
  providers: [RestaurantsService],
})
export class AppComponent {
  restaurant: Restaurant = null;
  currentSchedule: Schedule = null;
  newSchedule: Schedule = null;
  nextOrderingTime: string = null;
  date: { year: number, month: number };
  title = 'Innovorder';
  viewDate: Date = new Date();
  events: CalendarEvent[] = null;
  days: string[] = Object.keys(days);
  refresh: Subject<any> = new Subject();
  actions: CalendarEventAction[] = [
    {
      label: '<i class="material-icons">&#xE872;</i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.deleteCurrentSchedule(
          this.restaurant.scheduleSet.schedules.find(schedule => schedule.id === event['id']),
        );
      }
    }
  ];

  setCurrentSchedule(event: CalendarEvent): void {
    this.currentSchedule = this.restaurant.scheduleSet.schedules.find(schedule => schedule.id === event['id']);
  }
  createSchedule(): void {
    this.newSchedule = new Schedule({
      day: 'MON',
      start: 0,
      end: 15,
      id: null,
    });
  }
  saveCurrentSchedule(): void {
    this.restaurantsService.saveCurrentSchedule(this.restaurant.id, this.restaurant.scheduleSet.id, this.currentSchedule)
    .then(() => this.currentSchedule = null)
    .then(() => this.restaurantsService.getScheduleSet(this.restaurant.id, this.restaurant.scheduleSetId))
    .then(scheduleSet => this.restaurant.scheduleSet = scheduleSet)
    .then(() => this.getEvents());
  }
  saveNewSchedule(): void {
    this.restaurantsService.saveNewSchedule(this.restaurant.id, this.restaurant.scheduleSet.id, this.newSchedule)
    .then(() => this.newSchedule = null)
    .then(() => this.restaurantsService.getScheduleSet(this.restaurant.id, this.restaurant.scheduleSetId))
    .then(scheduleSet => this.restaurant.scheduleSet = scheduleSet)
    .then(() => this.getEvents());
  }
  deleteCurrentSchedule(schedule): void {
    this.restaurantsService.deleteCurrentSchedule(this.restaurant.id, this.restaurant.scheduleSet.id, schedule)
    .then(() => this.restaurantsService.getScheduleSet(this.restaurant.id, this.restaurant.scheduleSetId))
    .then(scheduleSet => this.restaurant.scheduleSet = scheduleSet)
    .then(() => this.getEvents());
  }
  getEvents() {
    this.events = this.restaurant.scheduleSet.schedules.map(
      (schedule) => ({
        start: addMinutes(addDays(startOfWeek(new Date()), days[schedule.day]), schedule.start),
        end: addMinutes(addDays(startOfWeek(new Date()), days[schedule.day]), schedule.end),
        color: colors.pink,
        title: [
          format(addMinutes(addDays(startOfWeek(new Date()), days[schedule.day]), schedule.start), 'HH:mm'),
          format(addMinutes(addDays(startOfWeek(new Date()), days[schedule.day]), schedule.end), 'HH:mm'),
        ].join(' à '),
        actions: this.actions,
        id: schedule.id,
      }),
    );
    this.refresh.next();
  }

  constructor(private restaurantsService: RestaurantsService) {
    this.restaurantsService.getRestaurants().then(
      (restaurants) => {
        this.restaurant = restaurants[0];
        this.restaurantsService.getScheduleSet(this.restaurant.id, this.restaurant.scheduleSetId).then(
          scheduleSet => this.restaurant.scheduleSet = scheduleSet,
        )
        .then(() => this.getEvents());
      }
    );
  }
}
