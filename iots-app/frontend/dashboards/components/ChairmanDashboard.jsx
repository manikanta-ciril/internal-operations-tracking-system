import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Globe, 
  AlertTriangle, 
  Users, 
  BarChart3, 
  FileText, 
  Bell, 
  ShieldCheck, 
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  MoreHorizontal
} from 'lucide-react';

const colors = {
  black: '#202830',
  surface: '#F8F8F8',
  gold: '#C09860',
  dimgray: '#707070',
  dark1: '#22272F',
  silver1: '#CAC1AB',
  darkslategrey1: '#4A4943',
  silver2: '#C5C6CB',
  darkslategrey2: '#2D312B',
  gray: '#71757A'
};

const ChairmanDashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');

  const navItems = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'Operational Performance', icon: TrendingUp },
    { name: 'Global Work', icon: Globe },
    { name: 'Escalations', icon: AlertTriangle },
    { name: 'People Overview', icon: Users },
    { name: 'Analytics & Insights', icon: BarChart3 },
    { name: 'Reports', icon: FileText },
    { name: 'Announcements', icon: Bell },
    { name: 'Audit Summary', icon: ShieldCheck },
  ];

  const attentionItems = [
    { title: 'Overdue Work', count: 24, trend: '+3%', status: 'critical' },
    { title: 'Unresolved Blockers', count: 8, trend: '-2%', status: 'warning' },
    { title: 'Declining Performance', count: 2, trend: 'Depts', status: 'warning' },
    { title: 'High Workload', count: 15, trend: 'Users', status: 'critical' }
  ];

  const pulseMetrics = [
    { label: 'Task Completion', value: '94%', change: '+1.2%' },
    { label: 'SLA On-Time', value: '91%', change: '-0.5%' },
    { label: 'Attendance', value: '98%', change: 'Steady' },
  ];

  const workMonitorData = [
    { id: 'TSK-001', task: 'Q3 Financial Audit', owner: 'Sarah Jenkins', team: 'Finance', priority: 'High', due: 'Oct 10, 2026', status: 'Pending', risk: 'Medium', lastActivity: '2 hrs ago' },
    { id: 'TSK-002', task: 'Enterprise Security Patch', owner: 'Mike Ross', team: 'IT Ops', priority: 'Critical', due: 'Oct 05, 2026', status: 'Blocked', risk: 'High', lastActivity: '15 mins ago' },
    { id: 'TSK-003', task: 'Vendor Contract Renewal', owner: 'Elena Rostova', team: 'Procurement', priority: 'Medium', due: 'Oct 12, 2026', status: 'Normal', risk: 'Low', lastActivity: '1 day ago' },
    { id: 'TSK-004', task: 'Compliance Review', owner: 'David Chen', team: 'Legal', priority: 'High', due: 'Oct 01, 2026', status: 'Overdue', risk: 'High', lastActivity: '5 hrs ago' },
  ];

  return (
    <div className="flex h-screen bg-[#F8F8F8] font-sans antialiased text-[#202830]">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#202830] text-[#F8F8F8] flex flex-col border-r border-[#4A4943]">
        <div className="p-6 flex items-center gap-3 border-b border-[#2D312B]">
          <div className="w-8 h-8 rounded bg-[#C09860] flex items-center justify-center font-bold text-[#202830]">
            IO
          </div>
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
              <span className="text-[#F8F8F8] font-medium">CH</span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#F8F8F8]">Chairman User</p>
              <p className="text-xs text-[#CAC1AB]">Global HQ</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Global Header */}
        <header className="h-16 bg-white border-b border-[#C5C6CB] px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-[#202830]">Executive Overview</h1>
            <div className="h-4 w-px bg-[#C5C6CB]"></div>
            <span className="text-sm text-[#707070]">Global HQ Branch</span>
            <span className="flex items-center gap-1.5 text-sm text-[#4A4943] bg-[#CAC1AB]/20 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Available
            </span>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71757A]" size={16} />
              <input 
                type="text" 
                placeholder="Global Search..." 
                className="pl-9 pr-4 py-1.5 bg-[#F8F8F8] border border-[#C5C6CB] rounded-md text-sm focus:outline-none focus:border-[#C09860] focus:ring-1 focus:ring-[#C09860] w-64 transition-all"
              />
            </div>
            <button className="relative p-1 text-[#4A4943] hover:text-[#202830] transition-colors">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        {/* Dashboard Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Top Row: Insight & Pulse Grid (12 Columns) */}
          <div className="grid grid-cols-12 gap-6">
            
            {/* Executive Insight Panel (Requires Attention) - 7 cols */}
            <section className="col-span-12 xl:col-span-7 bg-white rounded-xl border border-[#C5C6CB] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#C5C6CB] flex justify-between items-center bg-[#F8F8F8]/50">
                <h2 className="text-sm font-bold tracking-wide uppercase text-[#202830] flex items-center gap-2">
                  <AlertTriangle size={16} className="text-[#C09860]" />
                  Requires Attention
                </h2>
                <button className="text-xs font-medium text-[#71757A] hover:text-[#202830]">View All Actionables</button>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                {attentionItems.map((item, i) => (
                  <div key={i} className="p-4 rounded-lg border border-[#C5C6CB] bg-[#F8F8F8]/30 flex flex-col justify-between hover:border-[#C09860] transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-sm font-medium text-[#4A4943] group-hover:text-[#202830]">{item.title}</span>
                      <span className={`w-2 h-2 rounded-full ${item.status === 'critical' ? 'bg-red-500' : 'bg-orange-400'}`}></span>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-3xl font-light text-[#202830]">{item.count}</span>
                      <span className="text-xs font-medium text-[#707070] bg-white px-2 py-1 rounded border border-[#C5C6CB]">{item.trend}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Organizational Pulse - 5 cols */}
            <section className="col-span-12 xl:col-span-5 bg-white rounded-xl border border-[#C5C6CB] shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-[#C5C6CB] bg-[#F8F8F8]/50">
                <h2 className="text-sm font-bold tracking-wide uppercase text-[#202830] flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#C09860]" />
                  Organizational Pulse
                </h2>
              </div>
              <div className="p-6 flex-1 flex flex-col gap-6">
                {pulseMetrics.map((metric, i) => (
                  <div key={i} className="flex items-center justify-between pb-4 border-b border-[#F8F8F8] last:border-0 last:pb-0">
                    <span className="text-sm font-medium text-[#4A4943]">{metric.label}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold text-[#202830]">{metric.value}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        metric.change.startsWith('+') ? 'text-green-700 bg-green-50' : 
                        metric.change.startsWith('-') ? 'text-red-700 bg-red-50' : 
                        'text-[#71757A] bg-[#F8F8F8]'
                      }`}>{metric.change}</span>
                    </div>
                  </div>
                ))}
                <div className="mt-auto pt-4">
                  <div className="h-16 w-full flex items-end gap-1">
                    {[40, 60, 45, 80, 55, 90, 75, 85, 70, 95].map((h, i) => (
                      <div key={i} className="flex-1 bg-[#CAC1AB]/30 rounded-t-sm" style={{ height: `${h}%` }}>
                        <div className="w-full bg-[#C09860] rounded-t-sm opacity-80" style={{ height: `${h * 0.7}%` }}></div>
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-2 text-xs text-[#71757A]">30-Day Workload Trend</div>
                </div>
              </div>
            </section>
          </div>

          {/* Global Work Monitor Table */}
          <section className="bg-white rounded-xl border border-[#C5C6CB] shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-[#C5C6CB] flex justify-between items-center bg-[#F8F8F8]/50">
                <div className="flex items-center gap-4">
                  <h2 className="text-sm font-bold tracking-wide uppercase text-[#202830] flex items-center gap-2">
                    <Globe size={16} className="text-[#C09860]" />
                    Global Work Monitor
                  </h2>
                  <div className="h-4 w-px bg-[#C5C6CB]"></div>
                  <span className="text-xs text-[#71757A]">High-Level Operational View</span>
                </div>
                <div className="flex gap-2">
                  <button className="text-xs font-medium text-[#4A4943] bg-white border border-[#C5C6CB] px-3 py-1.5 rounded hover:border-[#707070] transition-colors">Filter</button>
                  <button className="text-xs font-medium text-[#4A4943] bg-white border border-[#C5C6CB] px-3 py-1.5 rounded hover:border-[#707070] transition-colors">Export</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#F8F8F8] text-[#707070] text-xs uppercase tracking-wider border-b border-[#C5C6CB]">
                      <th className="px-6 py-3 font-medium">Task</th>
                      <th className="px-6 py-3 font-medium">Owner & Team</th>
                      <th className="px-6 py-3 font-medium">Priority</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Due Date</th>
                      <th className="px-6 py-3 font-medium">Last Activity</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F8F8F8]">
                    {workMonitorData.map((row) => (
                      <tr key={row.id} className="hover:bg-[#F8F8F8]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-[#202830]">{row.task}</div>
                          <div className="text-xs text-[#71757A]">{row.id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[#202830]">{row.owner}</div>
                          <div className="text-xs text-[#71757A]">{row.team}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                            row.priority === 'Critical' ? 'border-red-200 bg-red-50 text-red-700' :
                            row.priority === 'High' ? 'border-orange-200 bg-orange-50 text-orange-700' :
                            'border-[#C5C6CB] bg-white text-[#4A4943]'
                          }`}>
                            {row.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-[#4A4943]">
                            {row.status === 'Normal' && <CheckCircle2 size={14} className="text-green-600" />}
                            {row.status === 'Pending' && <Clock size={14} className="text-blue-600" />}
                            {row.status === 'Blocked' && <XCircle size={14} className="text-red-600" />}
                            {row.status === 'Overdue' && <AlertTriangle size={14} className="text-orange-600" />}
                            <span className="font-medium">{row.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#4A4943]">
                          {row.due}
                        </td>
                        <td className="px-6 py-4 text-[#71757A] text-xs">
                          {row.lastActivity}
                        </td>
                        <td className="px-6 py-4 text-right text-[#71757A]">
                          <button className="hover:text-[#202830] transition-colors p-1"><MoreHorizontal size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default ChairmanDashboard;
