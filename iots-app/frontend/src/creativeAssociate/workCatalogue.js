// PDF work scope, kept separate from the sample assignments shown in the queue.
// Frequencies below describe the source document; they are not employee targets.
export const workCatalogue = [
  {
    title: 'Deal creatives', vertical: 'Social media', source: 'A.1, A.2, A.6',
    summary: 'Posts for individual deals, member-to-member deals and quarterly deal roundups.',
    deliverables: ['Individual member deal posts', 'Member-to-member deal posts', 'Consolidated or concluded deal creatives'],
    planning: 'Individual deals: up to 4 posts/month. Member-to-member: as required. Roundup: quarterly.',
  },
  {
    title: 'Zonal trends & reports', vertical: 'Social media', source: 'A.3, A.4',
    summary: 'Zonal market trend posts and the design of market reports.',
    deliverables: ['Trend posts for four zones', 'Market report cover and internal layout'],
    planning: 'Trend posts: about 3/month per zone; 8 templates/year. Report design: as required, using CIRIL content.',
  },
  {
    title: 'Monthly campaigns', vertical: 'Social media', source: 'A.7, A.8, A.9',
    summary: 'The recurring CIRIL promotion, listing website promotion and newsletter.',
    deliverables: ['CIRIL promotion creative', 'Listing website promotion creative', 'Newsletter design and content layout'],
    planning: 'One of each per month. CIRIL supplies the newsletter content.',
  },
  {
    title: 'Festive & seasonal', vertical: 'Social media', source: 'A.5',
    summary: 'Festival greeting creatives from CIRIL’s supplied calendar.',
    deliverables: ['Festival greetings'],
    planning: 'Approximately 13–14 greetings/year; dates come from the CIRIL list.',
  },
  {
    title: 'Video & multimedia', vertical: 'Social media', source: 'A.10, A.11',
    summary: 'Conference video and zonal meeting carousels or videos.',
    deliverables: ['Annual conference video', 'Zonal meeting carousels or videos'],
    planning: 'Conference video: one 3–4 minute video/year. Zonal meetings: twice yearly.',
  },
  {
    title: 'Blogs & static marketing', vertical: 'Social media', source: 'A.12, A.13',
    summary: 'Blog designs and static marketing assets.',
    deliverables: ['Blog posts and related creatives', 'Non-video marketing creatives'],
    planning: 'Blogs: up to 12/year. Static marketing: 12/year.',
  },
  {
    title: 'Ad-hoc hours bank', vertical: 'Social media', source: 'A.14, A.15',
    summary: 'Extra creative requests and website content or design input.',
    deliverables: ['Additional creative files', 'Website content and design input'],
    planning: 'The PDF lists 30 and 60 working hours/year respectively. Show time used only when recorded against assigned tasks.',
  },
  {
    title: 'Internal documents & presentations', vertical: 'Internal communication', source: 'B.1',
    summary: 'Reusable presentations and CIRIL’s internal documents.',
    deliverables: ['Vertical presentation template', 'Business induction presentation', 'Brochures and reports', 'Brand guidelines', 'Document data updates'],
    planning: 'Core templates are annual; data changes are requested as needed.',
  },
  {
    title: 'New member kit', vertical: 'Internal communication', source: 'B.2',
    summary: 'The set of materials prepared for a newly joined member.',
    deliverables: ['Introduction creative', 'Email signature', 'Large and small envelopes', 'Visiting card', 'Letterhead', 'Membership certificate'],
    planning: 'Create a kit when a new member is confirmed and approved details are supplied.',
  },
  {
    title: 'Stationery updates', vertical: 'Internal communication', source: 'B.3',
    summary: 'Updates to existing member and employee materials.',
    deliverables: ['General stationery', 'Employee ID cards', 'Member certificate modifications'],
    planning: 'As requested; the PDF also lists an annual set of certificate modifications.',
  },
  {
    title: 'Zonal conferences', vertical: 'Internal communication', source: 'B.4',
    summary: 'Presentations and statistics for zonal conferences.',
    deliverables: ['Zonal presentation template', 'Zone-wise business statistics', 'Four zonal presentations', 'Chairman’s zonal presentation'],
    planning: 'Plan around each conference; the reusable zonal template is annual.',
  },
  {
    title: 'AGM', vertical: 'Internal communication', source: 'B.5',
    summary: 'Annual General Meeting branding, event materials and presentation decks.',
    deliverables: ['Internal creatives, backdrops, side wings and arch', 'Podium, photo booth, standees, table cards and TV screens', 'Certificates and WhatsApp itinerary', 'Event flow, activities, chairman and awards presentations', 'Zonal and vertical presentations'],
    planning: 'Annual event. Only assigned items appear in My Work and Schedule.',
  },
];

export const categories = {
  'Social media': ['All', ...workCatalogue.filter((item) => item.vertical === 'Social media').map((item) => item.title)],
  'Internal communication': ['All', ...workCatalogue.filter((item) => item.vertical === 'Internal communication').map((item) => item.title)],
};
