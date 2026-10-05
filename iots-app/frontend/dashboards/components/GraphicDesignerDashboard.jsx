import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Palette, 
  FileText, 
  FolderOpen,
  MessageSquare,
  Activity,
  AlertTriangle,
  Clock,
  BarChart2,
  Bell,
  Search,
  Upload,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const GraphicDesignerDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'My Tasks', icon: CheckSquare },
    { name: 'Creative Queue', icon: Palette },
    { name: 'Design Briefs', icon: FileText },
    { name: 'Files & Versions', icon: FolderOpen },
    { name: 'Reviews', icon: MessageSquare },
    { name: 'Work Activity', icon: Activity },
    { name: 'Issues', icon: AlertTriangle },
    { name: 'Attendance', icon: Clock },
    { name: 'Performance', icon: BarChart2 }
  ];

  const creativeQueue = [
    { priority: 'High', brief: 'Q4 Product Brochure', client: 'Marketing Dept', deadline: 'Today, 5:00 PM', status: 'Revision Requested', revisions: 2 },
    { priority: 'Medium', brief: 'Social Media Assets - Oct', client: 'Social Media Team', deadline: 'Tomorrow, 12:00 PM', status: 'In Progress', revisions: 0 },
    { priority: 'High', brief: 'Internal Ops Logo Refresh', client: 'Chairman Office', deadline: 'Oct 15, 2026', status: 'Awaiting Review', revisions: 1 }
  ];

  return (
    <div className="flex h-screen bg-[#F8F8F8] font-sans antialiased text-[#202830]">
      <aside className="w-64 bg-[#202830] text-[#F8F8F8] flex flex-col border-r border-[#4A4943]">
        <div className="p-6 flex items-center gap-3 border-b border-[#2D312B]">
          <div className="w-8 h-8 rounded bg-[#C09860] flex items-center justify-center font-bold text-[#202830]">IO</div>
          <span className="font-semibold tracking-wide text-sm">OPS TRACKING</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                activeTab === item.name 
                  ? 'bg-[#2D312B] text-[#C09860] font-medium' 
                  : 'text-[#C5C6CB] hover:bg-[#22272F] hover:text-[#F8F8F8]'
              }`}
            >
              <item.icon size={18} className={activeTab === item.name ? 'text-[#C09860]' : 'text-[#71757A]'} />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#2D312B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#4A4943] flex items-center justify-center border border-[#707070]">
              <span className="text-[#F8F8F8] font-medium">GD</span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#F8F8F8]">Graphic Designer</p>
              <p className="text-xs text-[#CAC1AB]">Creative Div</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-[#C5C6CB] px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-[#202830]">Creative Workbench</h1>
            <div className="h-4 w-px bg-[#C5C6CB]"></div>
            <span className="text-sm text-[#707070]">My Dashboard</span>
          </div>
          
          <div className="flex items-center gap-5">
            <button className="relative p-1 text-[#4A4943] hover:text-[#202830] transition-colors"><Bell size={20} /></button>
            <button className="bg-[#202830] hover:bg-[#2D312B] text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
              <Upload size={16} /> Upload Asset
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Top KPIs */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Active Designs', value: '4', trend: 'Due Today: 1', icon: Palette },
              { label: 'Awaiting Review', value: '2', trend: 'Client/Manager', icon: Eye },
              { label: 'Revisions Requested', value: '1', trend: 'High Priority', icon: AlertCircle },
              { label: 'Approved this Week', value: '7', trend: 'On Schedule', icon: CheckCircle2 }
            ].map((kpi, i) => (
              <div key={i} className="bg-white rounded-lg border border-[#C5C6CB] shadow-sm p-5 flex items-center justify-between hover:border-[#C09860] transition-all cursor-pointer">
                <div>
                  <div className="text-sm font-medium text-[#71757A]">{kpi.label}</div>
                  <div className="text-2xl font-semibold mt-1 text-[#202830]">{kpi.value}</div>
                  <div className="text-xs text-[#71757A] mt-1">{kpi.trend}</div>
                </div>
                <div className="p-2 rounded-full bg-[#F8F8F8] text-[#C09860]">
                  <kpi.icon size={20} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-6">
            <section className="col-span-12 xl:col-span-8 bg-white rounded-xl border border-[#C5C6CB] shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-[#C5C6CB] flex justify-between items-center bg-[#F8F8F8]/50">
                <h2 className="text-sm font-bold tracking-wide uppercase text-[#202830] flex items-center gap-2">
                  <Palette size={16} className="text-[#C09860]" />
                  Creative Queue
                </h2>
                <button className="text-xs font-medium text-[#C09860] hover:text-[#202830]">View All Tasks</button>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#F8F8F8] text-[#707070] text-xs uppercase tracking-wider border-b border-[#C5C6CB]">
                      <th className="px-6 py-3 font-medium">Brief / Project</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Deadline</th>
                      <th className="px-6 py-3 font-medium">Revisions</th>
                      <th className="px-6 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F8F8F8]">
                    {creativeQueue.map((row, i) => (
                      <tr key={i} className="hover:bg-[#F8F8F8]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-[#202830]">{row.brief}</div>
                          <div className="text-xs text-[#71757A]">{row.client} • {row.priority} Priority</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                            row.status === 'In Progress' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                            row.status === 'Revision Requested' ? 'border-orange-200 bg-orange-50 text-orange-700' :
                            'border-yellow-200 bg-yellow-50 text-yellow-700'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#4A4943]">{row.deadline}</td>
                        <td className="px-6 py-4 text-[#4A4943]">{row.revisions}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-xs font-medium text-[#C09860] hover:text-[#202830] transition-colors">Open Workspace</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="col-span-12 xl:col-span-4 bg-white rounded-xl border border-[#C5C6CB] shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-[#C5C6CB] flex justify-between items-center bg-[#F8F8F8]/50">
                <h2 className="text-sm font-bold tracking-wide uppercase text-[#202830] flex items-center gap-2">
                  <FolderOpen size={16} className="text-[#C09860]" />
                  Recent Files & Versions
                </h2>
              </div>
              <div className="p-6 flex-1 flex flex-col gap-4">
                {[
                  { name: 'brochure_v2_final.pdf', proj: 'Q4 Product Brochure', time: '2 hours ago', ver: 'v2' },
                  { name: 'logo_concepts_draft.ai', proj: 'Internal Ops Logo Refresh', time: 'Yesterday', ver: 'v1' },
                  { name: 'social_oct_week1.png', proj: 'Social Media Assets', time: 'Oct 3', ver: 'v1' }
                ].map((file, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-[#F8F8F8] hover:border-[#C5C6CB] transition-colors cursor-pointer group">
                    <div className="p-2 bg-[#F8F8F8] rounded text-[#71757A] group-hover:text-[#C09860]">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#202830] truncate">{file.name}</p>
                      <p className="text-xs text-[#71757A] truncate">{file.proj} • {file.time}</p>
                    </div>
                    <div className="text-xs font-semibold px-1.5 py-0.5 rounded bg-[#202830] text-[#F8F8F8]">
                      {file.ver}
                    </div>
                  </div>
                ))}
                <button className="mt-auto w-full py-2 text-sm font-medium text-[#71757A] border border-[#C5C6CB] rounded hover:bg-[#F8F8F8] hover:text-[#202830] transition-colors">
                  View All Files
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
export default GraphicDesignerDashboard;
