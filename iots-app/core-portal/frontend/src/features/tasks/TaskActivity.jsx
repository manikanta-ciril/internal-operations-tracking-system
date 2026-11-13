import { useEffect, useRef, useState } from "react";
import { Clock3, ChevronDown } from "lucide-react";
import { format } from "./presentation";
import { orderedActivity, activityHistory } from "./activity-model";
const display = value => Array.isArray(value) ? value.join(", ") : value == null || value === "" ? "Not set" : String(value);
function ActivityRow({ event, current }) {
 return <article className={current ? "activity-current" : "activity-history-item"}>
   <div className="activity-record-heading"><h4>{event.action}</h4>{current && <Clock3 size={16} aria-hidden="true" />}</div>
   <p>{event.detail || event.note || "Work record updated."}</p>
   <div className="activity-person"><strong>{event.by || "System"}</strong><time dateTime={event.at}>{format(event.at)}</time></div>
   {event.changes?.length > 0 && <details><summary>View changes</summary><dl className="activity-changes">{event.changes.map(change=><div key={change.field}><dt>{change.field}</dt><dd>{display(change.before)} → {display(change.after)}</dd></div>)}</dl></details>}
 </article>;
}
export default function TaskActivity({task}) {
 const [actor,setActor]=useState("All people"),[type,setType]=useState("All activity"),[filterOpen,setFilterOpen]=useState(false);
 const filter=useRef(null),trigger=useRef(null);
 useEffect(()=>{
   if(!filterOpen)return;
   const outside=event=>{if(!filter.current?.contains(event.target))setFilterOpen(false);};
   const escape=event=>{if(event.key==="Escape"){setFilterOpen(false);trigger.current?.focus({preventScroll:true});}};
   document.addEventListener("pointerdown",outside);document.addEventListener("focusin",outside);document.addEventListener("keydown",escape);
   return()=>{document.removeEventListener("pointerdown",outside);document.removeEventListener("focusin",outside);document.removeEventListener("keydown",escape);};
 },[filterOpen]);
 const all=orderedActivity(task.events),current=all[0],history=activityHistory(task.events,actor,type);
 return <section className="task-activity-summary" aria-label="Work activity history">
  <div className="activity-summary-heading"><h3>Activity path</h3><span>{all.length} records</span></div>
  {current ? <div className="activity-split"><section aria-label="Latest activity"><small className="activity-section-label">Latest activity</small><ActivityRow event={current} current /></section>
  <div className="activity-previous"><div className="activity-history-heading"><h4>Earlier activity</h4><div className="activity-history-filter" ref={filter}>
   <button type="button" ref={trigger} aria-expanded={filterOpen} onClick={()=>setFilterOpen(value=>!value)}>Filter history<ChevronDown size={14}/></button>
   {filterOpen && <div><label>Person<select aria-label="Filter activity by person" value={actor} onChange={event=>setActor(event.target.value)}>{["All people",...new Set(all.slice(1).map(event=>event.by).filter(Boolean))].map(value=><option key={value}>{value}</option>)}</select></label><label>Activity<select aria-label="Filter activity type" value={type} onChange={event=>setType(event.target.value)}>{["All activity","Decisions","Work updates"].map(value=><option key={value}>{value}</option>)}</select></label><button type="button" onClick={()=>{setFilterOpen(false);trigger.current?.focus({preventScroll:true});}}>Done</button></div>}
  </div></div><div className="activity-stack" role="region" tabIndex={0} aria-label="Earlier activity">{history.length ? <ol>{history.map(event=><li key={event.id||`${event.at}-${event.order}`}><ActivityRow event={event}/></li>)}</ol> : <p className="activity-empty">No earlier activity.</p>}</div></div></div> : <p>No activity yet.</p>}
 </section>;
}
