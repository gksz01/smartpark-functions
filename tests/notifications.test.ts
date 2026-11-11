import {it,expect} from 'vitest';
import {Notify} from '../src/application/features/notify';
import {notification} from '../src/domain/notification';
const event={eventId:'b060f8f8-ae33-4547-8831-4e5947f83739',userId:'c27fd384-5ea9-4fe6-b180-d1805b6ff772',reservationId:'b9f1a4d2-3eb4-433e-83cb-b3e7d2299099',version:1,type:'ReservaCriada',occurredAt:'2030-01-01T10:00:00.000Z',correlationId:'test'};
it('mantém chave de deduplicação e destinatário do evento',()=>{expect(notification(event)).toMatchObject({id:event.eventId,userId:event.userId});});
it('rejeita versões e eventos desconhecidos',()=>{expect(()=>notification({...event,version:2})).toThrow();expect(()=>notification({...event,type:'Unknown'})).toThrow();});
it('evento duplicado produz um único efeito no contrato createOnce',async()=>{const rows=new Map();const store={createOnce:async(v:any)=>{if(!rows.has(v.id))rows.set(v.id,v);},list:async()=>[]};const notify=new Notify(store);await notify.execute(event);await notify.execute(event);expect(rows.size).toBe(1);});
