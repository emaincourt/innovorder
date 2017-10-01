import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { pick } from 'lodash';

import 'rxjs/add/operator/toPromise';

import { Restaurant, ScheduleSet, Schedule } from './app.component';

const baseURL = 'https://innovorder.herokuapp.com';

@Injectable()
export class RestaurantsService {

  constructor(private http: Http) { }
  
  async getRestaurants(): Promise<Restaurant[]> {
    const response = await this.http.get(`${baseURL}/restaurants`)
      .toPromise()
    return response.json();
  }

  async getScheduleSet(restaurantId, scheduleSetId): Promise<ScheduleSet> {
    const response = await this.http.get(`${baseURL}/restaurants/${restaurantId}/schedule-sets?id=${scheduleSetId}`)
      .toPromise();
    return response.json()[0];
  }

  async saveCurrentSchedule(restaurantId: string, scheduleSetId: string, schedule): Promise<ScheduleSet> {
    try {
      const response = await this.http.patch(`${baseURL}/restaurants/${restaurantId}/schedule-sets/${scheduleSetId}/schedules/${schedule.id}`,
        pick(schedule, 'start', 'end'),
      ).toPromise();
      return response.json();
    } catch (err) {
      console.log(err);
    }
  }

  async saveNewSchedule(restaurantId: string, scheduleSetId: string, schedule): Promise<ScheduleSet> {
    try {
      const response = await this.http.patch(`${baseURL}/restaurants/${restaurantId}/schedule-sets/${scheduleSetId}`, {
        schedules: [pick(schedule, 'start', 'end', 'day')],
      }).toPromise();
      return response.json();
    } catch (err) {
      console.log(err);
    }
  }

  async deleteCurrentSchedule(restaurantId: string, scheduleSetId: string, schedule): Promise<{}> {
    try {
      const response = await this.http.delete(`${baseURL}/restaurants/${restaurantId}/schedule-sets/${scheduleSetId}/schedules/${schedule.id}`)
      .toPromise();
      return response.json();
    } catch (err) {
      console.log(err);
    }
  }
}
