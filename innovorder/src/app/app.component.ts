import { ChangeDetectionStrategy, ViewChild, TemplateRef, Component } from '@angular/core';
import { addDays, isSameDay, startOfWeek, addMinutes, format, closestIndexTo, isBefore, getMinutes, getSeconds } from 'date-fns';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent } from 'angular-calendar';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/takeWhile'
import { flow, pullAt } from 'lodash';
import { RestaurantsService, } from './restaurants.service';

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

  roundToQuarter(date) {
    if (getMinutes(date) % 15 === 0) {
      return addMinutes(date, 15);
    }
    while(
      getMinutes(date) % 15 !== 0
    ) {
      date = addMinutes(date, 1);
    }
    return date;
  }

  getClosestInterval() {
    const minDelay = this.restaurant.rushDelay + this.restaurant.preparationDelay;
    const closestIndex = closestIndexTo(
      new Date(),
      this.events.map(event => event.start),
    );
    if (
      isSameDay(this.events[closestIndex].start, new Date())
      && isBefore(
        this.roundToQuarter(
          addMinutes(new Date(), minDelay)
        ),
        this.events[closestIndex].end,
      )
    ) {
        return this.events[closestIndex];
    }
    if (
      !isSameDay(this.events[closestIndex].start, new Date())
      && isBefore(
        this.roundToQuarter(
          addMinutes(this.events[closestIndex].start, minDelay),
        ),
        this.events[closestIndex].end,
      )
    ) {
        return this.events[closestIndex];
    }
    return this.events[
      closestIndexTo(
        new Date(),
        pullAt(this.events, closestIndex).map(event => event.start),
      )
    ];
  }

  getOrderingTime() {
    const minDelay = this.restaurant.rushDelay + this.restaurant.preparationDelay;
    const closestInterval = this.getClosestInterval();
    const startTime = 
      isSameDay(new Date(), closestInterval.start)
      && isBefore(closestInterval.start, new Date()) ? new Date() : closestInterval.start;
    return flow(
      date => addMinutes(date, minDelay),
      date => this.roundToQuarter(date),
      date => format(date, 'ddd HH:mm'),
      str => this.nextOrderingTime = str,
      () => Observable.interval(1000)
        .takeWhile(() => true)
        .subscribe(() => { 
          this.getOrderingTime()
        })
    )(startTime);
  }

  setCurrentSchedule(event: CalendarEvent): void {
    this.currentSchedule = this
      .restaurant
      .scheduleSet
      .schedules
      .find(schedule => schedule.id === event['id']);
  }

  createSchedule(): void {
    this.newSchedule = new Schedule({
      day: 'MON',
      start: 0,
      end: 15,
      id: null,
    });
  }

  async saveCurrentSchedule() {
    await this.restaurantsService.saveCurrentSchedule(
      this.restaurant.id,
      this.restaurant.scheduleSet.id,
      this.currentSchedule,
    );
    this.currentSchedule = null;
    return this.getEvents();
  }

  async saveNewSchedule() {
    await this.restaurantsService.saveNewSchedule(
      this.restaurant.id,
      this.restaurant.scheduleSet.id,
      this.newSchedule,
    );
    this.newSchedule = null;
    return this.getEvents();
  }

  async deleteCurrentSchedule(schedule) {
    await this.restaurantsService.deleteCurrentSchedule(
      this.restaurant.id,
      this.restaurant.scheduleSet.id,
      schedule,
    );
    return this.getEvents();
  }

  async getEvents() {
    this.restaurant.scheduleSet = await this.restaurantsService.getScheduleSet(
      this.restaurant.id,
      this.restaurant.scheduleSetId,
    );
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
        this.getEvents().then(
          () => this.getOrderingTime(),
        );
      }
    );
  }
}
