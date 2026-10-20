const sampleDate = new Date();
sampleDate.setHours(12, 0, 0, 0);

const dayFromNow = (days) => {
  const value = new Date(sampleDate);
  value.setDate(value.getDate() + days);
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(value);
};

function ViewHeading({ id, title, subtitle }) {
  return <div className="section-heading personal-heading"><div><h1 id={id}>{title}</h1><p>{subtitle}</p></div></div>;
}

export function AttendanceView() {
  return (
    <section id="attendance" className="section tab-view personal-view" aria-labelledby="attendance-title">
      <ViewHeading id="attendance-title" title="Attendance" subtitle="Your check-ins and availability." />
      <div className="personal-surface attendance-surface">
        <div className="personal-primary"><span className="personal-label">TODAY</span><h2>Checked in</h2><p>09:32 AM <span className="inline-separator">·</span> Onsite at check-in</p><span className="small-status">Available</span></div>
        <div className="personal-detail"><h3>Recent days</h3><div className="plain-row"><span>{dayFromNow(-1)}</span><strong>Complete <small>9:28 AM – 6:10 PM</small></strong></div><div className="plain-row"><span>{dayFromNow(-2)}</span><strong>Complete <small>9:36 AM – 6:04 PM</small></strong></div><div className="plain-row"><span>{dayFromNow(-3)}</span><strong>Approved leave <small>Excluded from attendance rate</small></strong></div></div>
      </div>
      <p className="view-note">Check-in, checkout and approved leave are separate records. These are sample entries.</p>
    </section>
  );
}

export function RequestsView() {
  const requests = [
    { title: 'Leave request', detail: `For ${dayFromNow(5)}`, status: 'Pending', id: 'REQ-081' },
    { title: 'Attendance correction', detail: `For ${dayFromNow(-7)}`, status: 'Approved', id: 'REQ-074' },
    { title: 'Design asset request', detail: 'Updated brand files', status: 'In review', id: 'REQ-069' },
  ];
  return (
    <section id="requests" className="section tab-view personal-view" aria-labelledby="requests-title">
      <ViewHeading id="requests-title" title="Requests" subtitle="Follow your leave, attendance and work support requests." />
      <div className="personal-surface"><div className="list-heading"><strong>My requests</strong><span>Sample history</span></div>{requests.map((request) => <div className="request-row" key={request.id}><div><strong>{request.title}</strong><small>{request.detail} · {request.id}</small></div><span className={`request-state ${request.status.toLowerCase().replace(' ', '-')}`}>{request.status}</span></div>)}</div>
      <p className="view-note">The connected workspace will show each request’s decision and approval history here.</p>
    </section>
  );
}

export function InboxView({ onOpenTask }) {
  const messages = [
    { sender: 'Kavya Nair', title: 'Feedback on listing promotion', preview: 'Please use the revised headline and listing image.', taskId: 'CR-2051' },
    { sender: 'Neha Kapoor', title: 'Market report figures', preview: 'The approved North zone figures are being checked.', taskId: 'CR-2044' },
    { sender: 'CIRIL Operations', title: 'Monthly creative schedule', preview: 'The October newsletter is ready for editorial review.', taskId: 'CR-2037' },
  ];
  return (
    <section id="inbox" className="section tab-view personal-view" aria-labelledby="inbox-title">
      <ViewHeading id="inbox-title" title="Inbox" subtitle="Work messages and updates in one place." />
      <div className="personal-surface"><div className="list-heading"><strong>Recent updates</strong><span>Linked to assignments</span></div>{messages.map((message) => <button type="button" className="inbox-row" key={message.taskId} onClick={() => onOpenTask(message.taskId)}><span className="sender-avatar">{message.sender.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><span><strong>{message.title}</strong><small>{message.sender} · {message.taskId}</small><span>{message.preview}</span></span><span className="inbox-arrow" aria-hidden="true">→</span></button>)}</div>
    </section>
  );
}

export function ProfileView() {
  return (
    <section id="profile" className="section tab-view personal-view" aria-labelledby="profile-title">
      <ViewHeading id="profile-title" title="My profile" subtitle="Your work identity and account details." />
      <div className="personal-surface profile-surface"><div className="profile-identity"><span className="profile-avatar">AR</span><div><h2>Ananya Rao</h2><p>Creative Communication Associate</p></div></div><div className="profile-info"><h3>Work details</h3><dl><div><dt>Employee ID</dt><dd>EMP-014</dd></div><div><dt>Active role</dt><dd>Creative Communication Associate</dd></div><div><dt>Reporting contact</dt><dd>Priya Mehta</dd></div><div><dt>Work scope</dt><dd>Own assignments and personal records</dd></div></dl></div></div>
      <div className="personal-surface security-surface"><h3>Profile & security</h3><div className="plain-row"><span>Profile changes</span><strong>Request a controlled update</strong></div><div className="plain-row"><span>Password</span><strong>Change through account settings</strong></div><div className="plain-row"><span>Sessions</span><strong>Review and end active sessions</strong></div><p>This preview shows where these account options belong. No account changes are made here.</p></div>
    </section>
  );
}
