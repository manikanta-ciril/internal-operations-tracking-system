import { useState } from "react";
import { LayoutGrid, List, ArrowUpRight, UserRound, CalendarDays } from "lucide-react";
import { Button } from "../../../shared/work-ui/button";
import { Badge } from "../../../shared/work-ui/badge";
import { date } from "./management-presentation";
export default function TeamWorkQueue({tasks,person,onOpen}){
 const [layout,setLayout]=useState("grid");
 return <><div className="management-view-controls" aria-label="Team work layout"><span>{tasks.length} tasks</span><Button variant="outline" aria-pressed={layout==="grid"} onClick={()=>setLayout("grid")}><LayoutGrid size={17}/>Grid view</Button><Button variant="outline" aria-pressed={layout==="table"} onClick={()=>setLayout("table")}><List size={17}/>Table view</Button></div>
 {layout==="grid" ? <div className="management-task-grid">{tasks.map(task=><article className="management-task-card" key={task.id}>
  <div className="management-card-heading"><small>{task.id}</small><Badge variant="outline">{task.status}</Badge></div>
  <h2><button onClick={()=>onOpen(task)}>{task.title}</button></h2><p className="management-card-brief">{task.brief}</p>
  <dl><div><dt><UserRound size={14}/>Assigned to</dt><dd>{person(task.ownerId)}</dd></div><div><dt>Reviewer</dt><dd>{person(task.reviewerId)}</dd></div><div><dt><CalendarDays size={14}/>Deadline</dt><dd>{date(task.due)}</dd></div><div><dt>Assigned</dt><dd>{task.assignedAt ? date(task.assignedAt) : "Draft"}</dd></div><div><dt>Priority</dt><dd>{task.priority}</dd></div><div><dt>Category</dt><dd>{task.category||"General work"}</dd></div></dl>
  <div className="management-card-progress"><span>Work progress</span><strong>{task.progress||0}%</strong><progress value={task.progress||0} max={100} aria-label={`Progress for ${task.title}`}/></div>
  {task.blocker?.open && <p>Blocker needs attention</p>}{task.deadlineRequest?.status==="Pending" && <p>Deadline request waiting</p>}
  <footer><small>{task.rating ? `Rating ${task.rating.score}/5` : `${task.referenceFiles?.length||0} input files · ${task.versions?.length||0} versions`}</small><Button variant="outline" onClick={()=>onOpen(task)} aria-label={`Open ${task.title}`}>Open work<ArrowUpRight size={16}/></Button></footer>
 </article>)}</div> : <div className="management-table-scroll" tabIndex={0} role="region" aria-label="Shared task queue"><table className="management-table"><thead><tr>{["Task","Employee","Reviewer","Stage","Deadline","Rating",""].map((label,index)=><th key={index}>{label}</th>)}</tr></thead><tbody>{tasks.map(task=><tr key={task.id}><td><button onClick={()=>onOpen(task)}><small>{task.id}</small><strong>{task.title}</strong></button></td><td>{person(task.ownerId)}</td><td>{person(task.reviewerId)}</td><td><Badge variant="outline">{task.status}</Badge></td><td>{date(task.due)}</td><td>{task.rating ? `${task.rating.score}/5` : "Not rated"}</td><td><Button variant="outline" onClick={()=>onOpen(task)} aria-label={`Open ${task.title}`}>Open</Button></td></tr>)}</tbody></table></div>}
 {!tasks.length && <div className="management-empty">No work matches this queue.</div>}
 </>;
}
