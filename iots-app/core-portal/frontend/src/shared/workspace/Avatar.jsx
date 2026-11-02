import { useState } from 'react';
import Icon from './Icon';
export default function Avatar({ name='', src, large=false }) {
 const [failed,setFailed]=useState(null);
 return <span className={`avatar${large?' large':''}`} aria-label={`${name || 'Employee'} profile`}>
 {src && failed!==src ? <img src={src} alt={`${name}'s avatar`} onError={()=>setFailed(src)}/> : <Icon name="user" size={large?36:20}/>}
 </span>;
}
