import { useState } from "react";
import NoticeDialog from "../../shared/components/NoticeDialog";
import { draftConsent, setDraftConsent } from "./draft-storage";
export default function DraftStorageConsent({children,force=false,onDone}) {
 const [choice,setChoice]=useState(()=>force ? null : draftConsent());
 const [warning,setWarning]=useState(false);
 function choose(next){setDraftConsent(next);setChoice(next);onDone?.(next);}
 if(choice)return children || null;
 return <NoticeDialog title={warning ? "Draft messages will not be saved" : "Cookie & draft storage consent"} dismissible={false} actions={warning ? <><button type="button" onClick={()=>choose("declined")}>Decline and return to sign-in</button><button type="button" onClick={()=>choose("allowed")}>Grant draft storage</button></> : <><button type="button" onClick={()=>setWarning(true)}>Decline</button><button type="button" autoFocus onClick={()=>choose("allowed")}>Allow draft storage</button></>}>
 {warning ? <><p>Unsent text messages may be lost when you reload, close this tab or sign out. Draft attachments are not saved.</p><p>You can grant storage now or continue to sign-in without saving drafts.</p></> : <><p>Allow this browser to remember unsent chat text for up to 30 days? Drafts are kept separately for each employee on this device.</p><p>We use browser local storage for drafts. The sign-in cookie remains necessary. No message text is stored in cookies or sent to analytics.</p><p>On shared devices, decline optional draft storage. You can change this choice from the chat panel.</p></>}
 </NoticeDialog>;
}
