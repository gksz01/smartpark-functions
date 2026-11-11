import { app } from '@azure/functions';
import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { Notify } from '../application/features/notify';
import { TableNotifications } from '../infrastructure/table-store';
const store=new TableNotifications();const notify=new Notify(store);
app.http('notifications',{methods:['GET'],authLevel:'anonymous',route:'notifications',handler:async(req)=>{
 const actual=req.headers.get('x-service-key')||'',expected=process.env.INTERNAL_API_KEY||'';
 if(!expected||Buffer.byteLength(actual)!==Buffer.byteLength(expected)||!timingSafeEqual(Buffer.from(actual),Buffer.from(expected)))return {status:401,jsonBody:{error:'Acesso de serviço inválido.'}};
 const parsed=z.string().uuid().safeParse(req.query.get('userId'));if(!parsed.success)return {status:400,jsonBody:{error:'Usuário inválido.'}};
 try{return {jsonBody:{items:await store.list(parsed.data),source:'azure-functions',generatedAt:new Date().toISOString()}};}catch{return {status:503,jsonBody:{error:'Notificações temporariamente indisponíveis.'}};}
}});
app.storageQueue('onParkingEvent',{queueName:'smartpark-events',connection:'AzureWebJobsStorage',handler:async(message,context)=>{await notify.execute(message);context.log('Event handled');}});
app.timer('dispatchOutbox',{schedule:'0 */2 * * * *',handler:async(_timer,context)=>{const response=await fetch(process.env.OUTBOX_DISPATCH_URL!,{method:'POST',headers:{'x-service-key':process.env.INTERNAL_API_KEY!},signal:AbortSignal.timeout(55000)});if(!response.ok)throw new Error('Outbox dispatch failed: '+response.status);context.log('Outbox dispatched');}});
