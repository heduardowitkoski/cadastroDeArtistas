
export interface ArtistMedia { id:string;kind:'photo'|'gallery'|'portfolio';name:string;mime:string;size:number;url:string;thumbnail_url:string|null;width?:number;height?:number }
export interface ArtistEvent { id:string;titulo:string;descricao?:string|null;starts_at:string;local:string;cidade:string;link?:string|null;is_public?:boolean }
export interface ArtistProfile { id:number;nome:string;nome_artistico?:string|null;area_atuacao:string;cidade?:string|null;bio?:string|null;foto_url?:string|null;instagram?:string|null;site?:string|null;contato?:string|null;tags?:string[]|null;disponibilidade?:string[]|null;member_since:string|null;views:number;media:ArtistMedia[];events:ArtistEvent[] }
export function httpUrl(value?:string|null):string|null { if(!value)return null;try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?u.href:null}catch{return null} }
export function instagramUrl(value?:string|null):string|null { if(!value)return null;const match=value.trim().match(/^(?:https?:\/\/(?:www\.)?instagram\.com\/|@)?([a-z\d._]{1,30})\/?$/i);return match?`https://www.instagram.com/${match[1]}/`:null }
export function assetUrl(value?:string|null, apiUrl=''):string|undefined { if(!value)return undefined;if(/^\/artistas\/\d+\/arquivos\/[a-f\d-]+(?:\?thumbnail=1)?$/i.test(value))return `${apiUrl}${value}`;if(/^data:image\/(?:jpeg|png|webp);base64,/i.test(value))return value;return httpUrl(value)||undefined }
export function phoneUrl(value?:string|null):string|null { const n=value?.replace(/[^\d+]/g,'');return n&&/^\+?\d{10,15}$/.test(n)?`tel:${n}`:null }
export const FAVORITES_KEY='cadastro-artistas:favorites:v1'
export function readFavorites(storage:Pick<Storage,'getItem'>):number[]{try{const values=JSON.parse(storage.getItem(FAVORITES_KEY)||'[]') as unknown;return Array.isArray(values)?[...new Set(values.filter((n):n is number=>Number.isSafeInteger(n)&&Number(n)>0))].slice(0,1000):[]}catch{return[]}}
export function writeFavorites(storage:Pick<Storage,'setItem'>,ids:number[]):boolean {try{storage.setItem(FAVORITES_KEY,JSON.stringify(ids));return true}catch{return false}}
export function nextFavorites(ids:number[],id:number):number[]{return ids.includes(id)?ids.filter(n=>n!==id):[...ids,id].slice(-1000)}
export function profileVisit(storage:Pick<Storage,'getItem'|'setItem'>,makeId:()=>string):string|null {try{const key='cadastro-artistas:visit-session:v1';let id=storage.getItem(key);if(!id){id=makeId();storage.setItem(key,id)}return id}catch{return null}}
