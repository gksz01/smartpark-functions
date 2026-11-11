import { TableClient,odata } from '@azure/data-tables';
import { Notifications } from '../application/features/notify';
import { Notification } from '../domain/notification';
export class TableNotifications implements Notifications{
 private table=TableClient.fromConnectionString(process.env.AzureWebJobsStorage!,'SmartParkNotifications',{allowInsecureConnection:process.env.AZURE_FUNCTIONS_ENVIRONMENT==='Development'});
 private ready?:Promise<void>;
 private async ensure(){if(!this.ready)this.ready=this.table.createTable().catch((e:any)=>{if(e.statusCode!==409){this.ready=undefined;throw e;}});await this.ready;}
 async createOnce(v:Notification){await this.ensure();try{await this.table.createEntity({partitionKey:v.userId,rowKey:v.id,...v});}catch(e:any){if(e.statusCode!==409)throw e;}}
 async list(userId:string){await this.ensure();const rows:Notification[]=[];for await(const row of this.table.listEntities<Notification>({queryOptions:{filter:odata`PartitionKey eq ${userId}`}})){rows.push({id:row.rowKey!,userId,reservationId:row.reservationId,message:row.message,createdAt:row.createdAt,type:row.type});}return rows.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,50);}
}
