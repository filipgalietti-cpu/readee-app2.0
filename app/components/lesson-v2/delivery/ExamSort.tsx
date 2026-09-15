"use client";
import {useMemo,useState} from 'react';
import type {SortDef} from '@/lib/lesson-engine/types';
import type {InteractionProps} from '@/lib/lesson-engine/registry';
import {interleavedSortOrder} from '@/lib/lesson-engine/shuffle';
/** Neutral placement: all buckets accept cards. Only an explicit submission is graded. */
export default function ExamSort({data,support}:InteractionProps<SortDef>){
 const [selected,setSelected]=useState<number|null>(null),[placed,setPlaced]=useState<Record<number,string>>({});
 const order=useMemo(()=>interleavedSortOrder(data.items,support?.scene.id??'exam-sort'),[data.items,support?.scene.id]);
 function place(bucket:string,index=selected){if(index===null||!data.items[index])return;setPlaced(p=>({...p,[index]:bucket}));setSelected(null);}
 function card(index:number){const item=data.items[index];return <button key={index} type="button" className={`le-sort-card ${selected===index?'is-selected':''}`} aria-pressed={selected===index} draggable onDragStart={e=>{e.dataTransfer.setData('text/plain',String(index));setSelected(index)}} onClick={()=>{setSelected(index);support?.say(item.spoken??item.label)}}>{item.image&&<img className="le-sort-art" src={item.image} alt=""/>}<span>{item.label}</span></button>}
 return <div className={`le-activity le-sort-board le-exam-sort ${data.items.every(item=>/^[A-Za-z]$/.test(item.label))?'le-sort-letters':''} ${data.items.some(item=>item.image)||Object.keys(data.bucketImages??{}).length?'le-sort-illustrated':''}`} data-bucket-count={data.buckets.length}>
  <div className="le-card-bank" aria-label="Cards to sort">{order.filter(i=>placed[i]===undefined).map(card)}</div>
  <div className="le-sort-homes">{data.buckets.map(bucket=><div key={bucket} className="le-sort-home" role="group" aria-label={`${bucket} sorting area`} onClick={e=>{if(!(e.target as HTMLElement).closest('button'))place(bucket)}} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const id=e.dataTransfer.getData('text/plain');if(/^\d+$/.test(id))place(bucket,Number(id))}}>
   <button type="button" className="le-bucket" onClick={()=>selected===null?support?.say(bucket):place(bucket)}>{data.bucketImages?.[bucket]&&<img className="le-sort-art" src={data.bucketImages[bucket]} alt=""/>}{bucket}</button>
   <div className="le-sorted-cards">{order.filter(i=>placed[i]===bucket).map(card)}</div>
  </div>)}</div>
  <button className="le-primary" disabled={Object.keys(placed).length!==data.items.length} onClick={()=>data.items.forEach((item,i)=>support?.answer(String(i),placed[i]===item.bucket,{bucket:placed[i]}))}>Save my answers</button>
 </div>
}
