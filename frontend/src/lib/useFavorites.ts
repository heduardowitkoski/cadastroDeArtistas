import { useEffect, useState } from 'react'
import { nextFavorites, readFavorites, writeFavorites } from './artistProfile'
export function useFavorites(){
  const [ids,setIds]=useState<number[]>(()=>{try{return readFavorites(localStorage)}catch{return[]}})
  const [persistent,setPersistent]=useState(true)
  useEffect(()=>{const sync=()=>{try{setIds(readFavorites(localStorage))}catch{/* Mantém estado desta visita. */}};window.addEventListener('storage',sync);window.addEventListener('artist-favorites-updated',sync);return()=>{window.removeEventListener('storage',sync);window.removeEventListener('artist-favorites-updated',sync)}},[])
  const toggle=(id:number)=>{const next=nextFavorites(ids,id);setIds(next);let saved=false;try{saved=writeFavorites(localStorage,next)}catch{/* Storage desabilitado. */}setPersistent(saved);if(saved)window.dispatchEvent(new Event('artist-favorites-updated'))}
  return {ids,toggle,persistent}
}
