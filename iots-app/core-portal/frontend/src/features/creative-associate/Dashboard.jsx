import { useEffect, useMemo, useState } from 'react';
import ThemeToggle from '../../shared/components/ThemeToggle';
import { categories, workCatalogue } from './workCatalogue.js';
import { AttendanceView, RequestsView, InboxView, ProfileView } from './PersonalViews.jsx';

const today = new Date();
today.setHours(12, 0, 0, 0);

const dateAfter = (days) => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date;
};

const formatDate = (date, options = { day: 'numeric', month: 'short' }) =>
  new Intl.DateTimeFormat('en-IN', options).format(date);

const tasks = [
  {
    id: 'CR-2048', title: 'Hyderabad member deal creative', type: 'Deal creatives', vertical: 'Social media',
    owner: 'Ananya Rao', requestedBy: 'Priya Mehta', dueOffset: 0, status: 'In progress', priority: 'Today',
    context: 'Individual member deal · Hyderabad', brief: 'Create one square post and one story using the approved deal details and the current member-deal template.',
    nextStep: 'Finish the first design and attach it for review.', evidence: 'Design file and CRM deal reference',
  },
  {
    id: 'CR-2051', title: 'October listing website promotion', type: 'Monthly campaigns', vertical: 'Social media',
    owner: 'Ananya Rao', requestedBy: 'Kavya Nair', dueOffset: 2, status: 'Changes requested', priority: 'Action needed',
    context: 'Monthly listing promotion', brief: 'Update the listing website creative with the revised headline and supplied listing image.',
    nextStep: 'Apply the two comments from Kavya and submit a new version.', evidence: 'Versioned artwork and final publication link',
  },
  {
    id: 'CR-2054', title: 'New member welcome kit', type: 'New member kit', vertical: 'Internal communication',
    owner: 'Ananya Rao', requestedBy: 'Rohit Shah', dueOffset: 3, status: 'In progress', priority: 'This week',
    context: 'New member · Pune', brief: 'Prepare the introduction creative, email signature, envelopes, visiting card, letterhead and membership certificate.',
    nextStep: 'Complete the remaining visiting card and certificate files.', evidence: 'Six final files with approved member details',
  },
  {
    id: 'CR-2044', title: 'North zone market report cover', type: 'Zonal trends & reports', vertical: 'Social media',
    owner: 'Ananya Rao', requestedBy: 'Neha Kapoor', dueOffset: 4, status: 'Waiting for input', priority: 'Blocked',
    context: 'North zone · Market report', brief: 'Design the cover and internal layout using the market report supplied by CIRIL.',
    nextStep: 'Wait for the approved report figures from Neha.', evidence: 'Source report and approved design file',
  },
  {
    id: 'CR-2039', title: 'Diwali greeting artwork', type: 'Festive & seasonal', vertical: 'Social media',
    owner: 'Ananya Rao', requestedBy: 'Kavya Nair', dueOffset: 6, status: 'In progress', priority: 'Upcoming',
    context: 'Festival calendar', brief: 'Prepare the approved annual greeting format for social channels.',
    nextStep: 'Share the draft for copy and brand review.', evidence: 'Approved artwork and publication proof',
  },
  {
    id: 'CR-2056', title: 'Zonal conference presentation', type: 'Zonal conferences', vertical: 'Internal communication',
    owner: 'Ananya Rao', requestedBy: 'Priya Mehta', dueOffset: 8, status: 'In progress', priority: 'Upcoming',
    context: 'West zone conference', brief: 'Update the zonal slide deck and business statistics slides from the supplied figures.',
    nextStep: 'Complete the four zone sections and request review.', evidence: 'Slide deck and approved source figures',
  },
  {
    id: 'CR-2037', title: 'Monthly newsletter layout', type: 'Monthly campaigns', vertical: 'Social media',
    owner: 'Ananya Rao', requestedBy: 'Neha Kapoor', dueOffset: 1, status: 'Waiting for review', priority: 'Submitted',
    context: 'October newsletter', brief: 'Layout and design the newsletter with the month’s content provided by CIRIL.',
    nextStep: 'Await editorial review before final delivery.', evidence: 'Newsletter file and final delivery record',
  },
  {
    id: 'CR-2035', title: 'Employee ID card update', type: 'Stationery updates', vertical: 'Internal communication',
    owner: 'Ananya Rao', requestedBy: 'Rohit Shah', dueOffset: -1, status: 'Approved', priority: 'Done',
    context: 'Internal stationery', brief: 'Update the card design using approved employee details.',
    nextStep: 'Final file delivered to Admin.', evidence: 'Approved print file and delivery record',
  },
];

const statusClass = (status) => status.toLowerCase().replaceAll(' ', '-');

function WorkScope() {
  return (
    <details className="scope-disclosure">
      <summary><span><strong>Explore all work types</strong><small>See the full PDF scope, including work that has no assignment yet.</small></span><span className="scope-count">12 types <span aria-hidden="true">⌄</span></span></summary>
      <div className="scope-content">
        {['Social media', 'Internal communication'].map((vertical) => (
          <div className="scope-column" key={vertical}>
            <h3>{vertical}</h3>
            {workCatalogue.filter((item) => item.vertical === vertical).map((item) => (
              <details className="scope-item" key={item.title}>
                <summary><span><strong>{item.title}</strong><small>{item.summary}</small></span><span className="scope-item-plus" aria-hidden="true">+</span></summary>
                <div className="scope-item-body">
                  <span className="source-tag">PDF {item.source}</span>
                  <ul>{item.deliverables.map((deliverable) => <li key={deliverable}>{deliverable}</li>)}</ul>
                  <p>{item.planning}</p>
                </div>
              </details>
            ))}
          </div>
        ))}
      </div>
    </details>
  );
}

function Icon({ name, size = 20 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></>,
    check: <><path d="m5 12 4 4L19 6"/></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6"/></>,
    close: <><path d="M6 6l12 12M18 6 6 18"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    file: <><path d="M6 3h8l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v5h5M8 13h8M8 17h6"/></>,
    spark: <><path d="m12 2 1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2ZM19 17l.7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7L19 17Z"/></>,
    chevron: <path d="m7 10 5 5 5-5"/>,
    inbox: <><path d="M4 4h16v13H4z"/><path d="M4 13h4l2 3h4l2-3h4"/></>,
    clipboard: <><rect x="5" y="5" width="14" height="16" rx="2"/><path d="M9 5V3h6v2M9 11h6M9 15h6"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function TaskRow({ task, onOpen, compact = false }) {
  return (
    <button type="button" className={`task-row ${compact ? 'compact' : ''}`} onClick={() => onOpen(task)}>
      <span className="task-row-main">
        <span className="task-title">{task.title}</span>
        <span className="task-meta">{task.type} <span aria-hidden="true">·</span> {task.id}</span>
      </span>
      <span className={`status status-${statusClass(task.status)}`}>{task.status}</span>
      <span className="task-due">{task.dueOffset < 0 ? 'Delivered' : task.dueOffset === 0 ? 'Today' : formatDate(dateAfter(task.dueOffset))}</span>
      <Icon name="arrow" size={16} />
    </button>
  );
}

function Dashboard() {
  const [vertical, setVertical] = useState('Social media');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState(null);
  const [reviewTab, setReviewTab] = useState('Needs action');
  const [workSearch, setWorkSearch] = useState('');
  const [activeSection, setActiveSection] = useState(() => {
    const section = window.location.hash.slice(1);
    return ['today', 'my-work', 'schedule', 'review', 'attendance', 'requests', 'inbox', 'profile'].includes(section) ? section : 'today';
  });
  const [openGroups, setOpenGroups] = useState(() => ({ work: true, personal: ['attendance', 'requests', 'inbox'].includes(window.location.hash.slice(1)) }));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const myWork = useMemo(() => tasks.filter((task) => task.vertical === vertical && task.status !== 'Approved' && (category === 'All' || task.type === category) && `${task.title} ${task.id} ${task.context}`.toLowerCase().includes(workSearch.toLowerCase())), [vertical, category, workSearch]);
  const needsAction = tasks.filter((task) => task.status === 'Changes requested');
  const waiting = tasks.filter((task) => task.status === 'Waiting for review');
  const todayTasks = tasks.filter((task) => task.dueOffset === 0 || task.status === 'Changes requested');
  const scheduled = tasks.filter((task) => task.dueOffset >= 0 && task.status !== 'Approved').sort((a, b) => a.dueOffset - b.dueOffset).slice(0, 4);

  useEffect(() => {
    if (!selected && !mobileMenuOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setSelected(null);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selected, mobileMenuOpen]);

  useEffect(() => {
    const syncSection = () => {
      const section = window.location.hash.slice(1);
      const next = ['today', 'my-work', 'schedule', 'review', 'attendance', 'requests', 'inbox', 'profile'].includes(section) ? section : 'today';
      setActiveSection(next);
      if (['my-work', 'schedule', 'review'].includes(next)) setOpenGroups((value) => ({ ...value, work: true }));
      if (['attendance', 'requests', 'inbox'].includes(next)) setOpenGroups((value) => ({ ...value, personal: true }));
    };
    window.addEventListener('hashchange', syncSection);
    window.addEventListener('popstate', syncSection);
    return () => {
      window.removeEventListener('hashchange', syncSection);
      window.removeEventListener('popstate', syncSection);
    };
  }, []);

  const selectVertical = (nextVertical) => { setVertical(nextVertical); setCategory('All'); };
  const navigateTo = (id) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    if (['my-work', 'schedule', 'review'].includes(id)) setOpenGroups((value) => ({ ...value, work: true }));
    if (['attendance', 'requests', 'inbox'].includes(id)) setOpenGroups((value) => ({ ...value, personal: true }));
    if (window.location.hash !== `#${id}`) window.history.pushState(null, '', `#${id}`);
    window.scrollTo({ top: 0, behavior: 'auto' });
    window.requestAnimationFrame(() => document.getElementById('workspace-main')?.focus());
  };

  const viewLabels = {
    today: 'Today', 'my-work': 'My tasks', schedule: 'Schedule', review: 'Review',
    attendance: 'Attendance', requests: 'Requests', inbox: 'Inbox', profile: 'My profile',
  };

  const navLink = (id, icon, extra) => (
    <a href={`#${id}`} className={`menu-link ${activeSection === id ? 'active' : ''}`} aria-current={activeSection === id ? 'page' : undefined} onClick={(event) => { event.preventDefault(); navigateTo(id); }}>
      <span className="menu-icon"><Icon name={icon} size={18} /></span><span>{viewLabels[id]}</span>
      {extra ? <span className="menu-extra">{extra}</span> : null}
    </a>
  );

  return (
    <div className="ca-app">
      {mobileMenuOpen && <button type="button" className="mobile-menu-scrim" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)} />}
      <aside id="workspace-menu" className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`} aria-label="Dashboard navigation">
        <div className="sidebar-header">
          <a className="brand" href="#today" onClick={(event) => { event.preventDefault(); navigateTo('today'); }} aria-label="CIRIL dashboard home"><img src="/img/logo.png" alt="CIRIL" /><span>IOTS</span></a>
          <button type="button" className="mobile-menu-close" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu"><Icon name="close" size={18} /></button>
        </div>
        <nav className="side-nav" aria-label="Creative Associate sections">
          {navLink('today', 'grid')}
          <div className="menu-group">
            <button type="button" className="menu-group-button" aria-expanded={openGroups.work} aria-controls="work-links" onClick={() => setOpenGroups((value) => ({ ...value, work: !value.work }))}><span>Work</span><Icon name="chevron" size={16} /></button>
            <div className="menu-sublist" id="work-links" hidden={!openGroups.work}>{navLink('my-work', 'list', tasks.filter((task) => task.status !== 'Approved').length)}{navLink('schedule', 'calendar')}{navLink('review', 'check', needsAction.length)}</div>
          </div>
          <div className="menu-group">
            <button type="button" className="menu-group-button" aria-expanded={openGroups.personal} aria-controls="personal-links" onClick={() => setOpenGroups((value) => ({ ...value, personal: !value.personal }))}><span>Personal</span><Icon name="chevron" size={16} /></button>
            <div className="menu-sublist" id="personal-links" hidden={!openGroups.personal}>{navLink('attendance', 'clock')}{navLink('requests', 'clipboard')}{navLink('inbox', 'inbox')}</div>
          </div>
        </nav>
        <div className="sidebar-spacer" />
        <a href="#profile" className={`profile-link ${activeSection === 'profile' ? 'active' : ''}`} aria-current={activeSection === 'profile' ? 'page' : undefined} onClick={(event) => { event.preventDefault(); navigateTo('profile'); }}><span className="avatar">AR</span><span><strong>Ananya Rao</strong><small>My profile</small></span><Icon name="arrow" size={15} /></a>
      </aside>

      <main id="workspace-main" className="main-content" tabIndex={-1}>
        <header className="topbar"><button type="button" className="mobile-menu-button" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu" aria-controls="workspace-menu" aria-expanded={mobileMenuOpen}><Icon name="list" size={19} /></button><span>{viewLabels[activeSection]}</span><div className="ca-topbar-actions"><span className="demo-pill">Sample data</span><ThemeToggle inline/></div></header>
        <div className="content-wrap">
          {activeSection === 'today' && <section id="today" className="section today-section tab-view" aria-labelledby="today-title">
            <div className="welcome-line"><div><h1 id="today-title">Good to see you, Ananya.</h1><p>{formatDate(today, { weekday: 'long', day: 'numeric', month: 'long' })} · Here’s what needs your attention.</p></div><button className="text-button" onClick={() => navigateTo('my-work')}>See all work <Icon name="arrow" size={16}/></button></div>
            <div className="today-grid">
              <div className="focus-card"><div className="focus-top"><span className="focus-icon"><Icon name="spark" size={18}/></span><span>YOUR NEXT STEP</span></div><h2>{todayTasks[0].title}</h2><p>{todayTasks[0].nextStep}</p><div className="focus-bottom"><span>Due today · {todayTasks[0].id}</span><button onClick={() => setSelected(todayTasks[0])}>Open task <Icon name="arrow" size={15}/></button></div></div>
              <button className="count-card" onClick={() => navigateTo('my-work')}><span className="count-icon lavender"><Icon name="list" size={18}/></span><strong>{tasks.filter((task) => task.status === 'In progress').length}</strong><span>In progress</span><small>Across both work areas</small></button>
              <button className="count-card" onClick={() => { setReviewTab('Needs action'); navigateTo('review'); }}><span className="count-icon peach"><Icon name="file" size={18}/></span><strong>{needsAction.length}</strong><span>Needs changes</span><small>Feedback ready to read</small></button>
              <button className="count-card" onClick={() => { setReviewTab('Waiting'); navigateTo('review'); }}><span className="count-icon mint"><Icon name="clock" size={18}/></span><strong>{waiting.length}</strong><span>Waiting for review</span><small>Already submitted</small></button>
            </div>
            <div className="today-followup"><div className="section-heading"><div><h2>Upcoming work</h2></div><button className="text-button" onClick={() => navigateTo('schedule')}>Open schedule <Icon name="arrow" size={16}/></button></div><div className="panel">{scheduled.slice(0, 3).map((task) => <TaskRow key={task.id} task={task} onOpen={setSelected} compact />)}</div></div>
          </section>}

          {activeSection === 'my-work' && <section id="my-work" className="section tab-view" aria-labelledby="work-title">
            <div className="section-heading"><div><h2 id="work-title">My tasks</h2><p>Assigned creative and internal work.</p></div><span className="subtle-count">{tasks.filter((task) => task.status !== 'Approved').length} open</span></div>
            <div className="panel work-panel"><div className="work-toolbar"><div className="segmented" role="group" aria-label="Work area"><button className={vertical === 'Social media' ? 'active' : ''} onClick={() => selectVertical('Social media')}>Social media</button><button className={vertical === 'Internal communication' ? 'active' : ''} onClick={() => selectVertical('Internal communication')}>Internal communication</button></div><label className="search-wrap"><span className="sr-only">Search my work</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><input value={workSearch} onChange={(event) => setWorkSearch(event.target.value)} placeholder="Find a task" /></label></div>
              <div className="category-row"><label htmlFor="category-filter">Show</label><select id="category-filter" value={category} onChange={(event) => setCategory(event.target.value)}>{categories[vertical].map((item) => <option key={item} value={item}>{item === 'All' ? 'All categories' : item}</option>)}</select><span>{myWork.length} {myWork.length === 1 ? 'task' : 'tasks'}</span></div>
              <div className="task-list">{myWork.length ? myWork.map((task) => <TaskRow key={task.id} task={task} onOpen={setSelected} />) : <div className="empty-state">No tasks match this view. Try another category or search.</div>}</div>
            </div>
            <WorkScope />
          </section>}

          {activeSection === 'schedule' && <section id="schedule" className="section tab-view" aria-labelledby="schedule-title"><div className="section-heading"><div><h2 id="schedule-title">Schedule</h2><p>Upcoming assigned deadlines.</p></div></div><div className="schedule-view"><div className="panel schedule-panel"><div className="schedule-header"><Icon name="calendar" size={18}/><strong>Upcoming deadlines</strong></div>{scheduled.map((task) => <button key={task.id} className="schedule-item" onClick={() => setSelected(task)}><span className={`date-block ${task.dueOffset === 0 ? 'date-today' : ''}`}><strong>{formatDate(dateAfter(task.dueOffset), { day: '2-digit' })}</strong><small>{formatDate(dateAfter(task.dueOffset), { month: 'short' })}</small></span><span className="schedule-copy"><strong>{task.title}</strong><small>{task.type}</small></span><Icon name="arrow" size={16}/></button>)}<p className="panel-footnote">Event work appears here when it has an assigned deadline.</p></div><div className="schedule-aside"><div className="panel schedule-aside-card"><h3>Regular work</h3><div><strong>Monthly</strong><span>Promotions, listing posts, newsletter</span></div><div><strong>Quarterly</strong><span>Consolidated deal creative</span></div><div><strong>Annual or event-based</strong><span>Festival greetings, conference video, zonal meetings and AGM work</span></div></div><details className="panel panel-detail"><summary>How recurring work is planned</summary><p>The PDF’s expected volumes are planning references. A deadline appears here only when CIRIL assigns the work and date.</p></details></div></div></section>}

          {activeSection === 'review' && <section id="review" className="section tab-view" aria-labelledby="review-title"><div className="section-heading"><div><h2 id="review-title">Review & delivery</h2><p>Feedback and final files.</p></div></div><div className="review-view"><div className="panel review-panel"><div className="review-tabs" role="group" aria-label="Review status"><button aria-pressed={reviewTab === 'Needs action'} className={reviewTab === 'Needs action' ? 'active' : ''} onClick={() => setReviewTab('Needs action')}>Needs action <span>{needsAction.length}</span></button><button aria-pressed={reviewTab === 'Waiting'} className={reviewTab === 'Waiting' ? 'active' : ''} onClick={() => setReviewTab('Waiting')}>Waiting <span>{waiting.length}</span></button><button aria-pressed={reviewTab === 'Delivered'} className={reviewTab === 'Delivered' ? 'active' : ''} onClick={() => setReviewTab('Delivered')}>Delivered</button></div><div className="review-body">{(reviewTab === 'Needs action' ? needsAction : reviewTab === 'Waiting' ? waiting : tasks.filter((task) => task.status === 'Approved')).map((task) => <button key={task.id} className="review-item" onClick={() => setSelected(task)}><span className="review-mark"><Icon name={reviewTab === 'Delivered' ? 'check' : 'file'} size={17}/></span><span><strong>{task.title}</strong><small>{reviewTab === 'Needs action' ? 'Feedback from ' + task.requestedBy : reviewTab === 'Waiting' ? 'Submitted for review' : 'Final file delivered'}</small></span><Icon name="arrow" size={16}/></button>)}</div><p className="panel-footnote">Open an item to see its brief, required files and next step.</p></div><div className="review-aside"><div className="panel review-aside-card"><h3>For each submission</h3><ul><li>Current design file</li><li>Source material or reference</li><li>Final link or publication proof, when applicable</li></ul></div><details className="panel panel-detail"><summary>Submission history</summary><p>Design versions, reviewer feedback and final delivery stay linked to the same assignment.</p></details></div></div></section>}
          {activeSection === 'attendance' && <AttendanceView />}
          {activeSection === 'requests' && <RequestsView />}
          {activeSection === 'inbox' && <InboxView onOpenTask={(id) => setSelected(tasks.find((task) => task.id === id))} />}
          {activeSection === 'profile' && <ProfileView />}
          <footer className="page-footer">CIRIL IOTS · Creative Associate preview · Sample assignments only</footer>
        </div>
      </main>

      {selected && <div className="drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><aside className="task-drawer" role="dialog" aria-modal="true" aria-labelledby="task-drawer-title"><div className="drawer-top"><span>ASSIGNMENT · {selected.id}</span><button className="icon-button" onClick={() => setSelected(null)} aria-label="Close task details"><Icon name="close" size={19}/></button></div><span className={`status status-${statusClass(selected.status)}`}>{selected.status}</span><h2 id="task-drawer-title">{selected.title}</h2><p className="drawer-context">{selected.context}</p><div className="drawer-rule"/><dl className="detail-grid"><div><dt>Due</dt><dd>{selected.dueOffset < 0 ? 'Delivered' : formatDate(dateAfter(selected.dueOffset), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</dd></div><div><dt>Requested by</dt><dd>{selected.requestedBy}</dd></div><div><dt>Work area</dt><dd>{selected.vertical}</dd></div><div><dt>Category</dt><dd>{selected.type}</dd></div></dl><div className="drawer-rule"/><h3>Brief</h3><p>{selected.brief}</p><h3>Next step</h3><p>{selected.nextStep}</p><h3>Files or proof needed</h3><p>{selected.evidence}</p><div className="drawer-note">Preview data. Task actions and file uploads will be connected to the IOTS API during implementation.</div></aside></div>}
    </div>
  );
}

export default Dashboard;
