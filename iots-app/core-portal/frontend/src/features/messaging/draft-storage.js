export const consentKey = "ciril-chat-draft-consent-v1";
const draftPrefix = "ciril-chat-drafts-v1:";
export function draftConsent(storage = globalThis.localStorage) {
 try { const saved=JSON.parse(storage.getItem(consentKey)); return ["allowed","declined"].includes(saved?.choice) ? saved.choice : null; } catch { return null; }
}
export function setDraftConsent(choice, storage = globalThis.localStorage) {
 try {
  storage.setItem(consentKey,JSON.stringify({choice,at:new Date().toISOString()}));
  if(choice!=="allowed") for(const key of Object.keys(storage)) if(key.startsWith(draftPrefix))storage.removeItem(key);
  return true;
 } catch { return false; }
}
export function readChatDrafts(employeeId, storage = globalThis.localStorage) {
 if(draftConsent(storage)!=="allowed")return {};
 try { const saved=JSON.parse(storage.getItem(draftPrefix+employeeId));if(!saved || Date.now()-saved.at>30*86400000){storage.removeItem(draftPrefix+employeeId);return {};}
 return Object.fromEntries(Object.entries(saved.drafts||{}).filter(([id,text])=>id.length<=80 && typeof text==="string" && text.length<=4000));
 } catch {return {};}
}
export function saveChatDrafts(employeeId,drafts,storage = globalThis.localStorage) {
 if(draftConsent(storage)!=="allowed")return false;
 try {const trimmed=Object.fromEntries(Object.entries(drafts).filter(([,text])=>text?.trim()).slice(-100));if(Object.keys(trimmed).length)storage.setItem(draftPrefix+employeeId,JSON.stringify({at:Date.now(),drafts:trimmed}));else storage.removeItem(draftPrefix+employeeId);return true;}catch{return false;}
}
