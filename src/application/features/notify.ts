import { notification,Notification } from '../../domain/notification';
export interface Notifications{createOnce(value:Notification):Promise<void>;list(userId:string):Promise<Notification[]>;}
export class Notify{constructor(private store:Notifications){}async execute(event:unknown){await this.store.createOnce(notification(event));}}
