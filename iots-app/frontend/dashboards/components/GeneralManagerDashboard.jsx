import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Target, 
  CheckSquare, 
  Activity, 
  FileCheck, 
  AlertTriangle, 
  BarChart3,
  FileText,
  MessageSquare,
  Search,
  Bell,
  TrendingUp,
  Clock,
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

const GeneralManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('Business Overview');

  const navItems = [
    { name: 'Business Overview', icon: LayoutDashboard },
    { name: 'Teams & Departments', icon: Briefcase },
    { name: 'Targets', icon: Target },
    { name: 'Operational Work', icon: CheckSquare },
    { name: 'Performance', icon: Activity },
    { name: 'Approvals', icon: FileCheck },
    { name: 'Escalations', icon: AlertTriangle },
    { name: 'Analytics', icon: BarChart3 },
    { name: 'Reports', icon: FileText },
    { name: 'Communication', icon: MessageSquare }
  ];

  const departmentPerformance = [
    { dept: 'Operations', target: 94, actual: 91, status: 'warning', activeTasks: 450, overdue: 12 },
    { dept: 'Sales', target: 90, actual: 95, status: 'success', activeTasks: 320, overdue: 5 },
    { dept: 'Customer Support', target: 95, actual: 88, status: 'critical', activeTasks: 890, overdue: 45 },
    { dept: 'Finance', target: 98, actual: 97, status: 'normal', activeTasks: 150, overdue: 2 }
  ];

  const operationalExceptions = [
    { issue: 'High Server Load', dept: 'IT', time: '10 mins ago', impact: 'High' },
    { issue: 'Missed SLA - Client XYZ', dept: 'Support', time: '1 hr ago', impact: 'Medium' },
    { issue: 'Vendor Delay', dept: 'Operations', time: '2 hrs ago', impact: 'High' }
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
              <span className="text-[#F8F8F8] font-medium">GM</span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#F8F8F8]">General Manager</p>
              <p className="text-xs text-[#CAC1AB]">North America</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Global Header */}
        <header className="h-16 bg-white border-b border-[#C5C6CB] px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-[#202830]">Business Overview</h1>
            <div className="h-4 w-px bg-[#C5C6CB]"></div>
            <span className="text-sm text-[#707070]">NA Branch Operations</span>
            <span className="flex items-center gap-1.5 text-sm text-[#4A4943] bg-[#CAC1AB]/20 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
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
          
          {/* Top KPI Row */}
          <div className="grid grid-cols-4 gap-6">
            {[
              { label: 'Overall Target', value: '92.4%', trend: '+0.8% MoM', icon: Target, status: 'good' },
              { label: 'Active Workload', value: '1,810', trend: 'Tasks in progress', icon: CheckSquare, status: 'neutral' },
              { label: 'Overdue Workload', value: '64', trend: 'Requires attention', icon: Clock, status: 'warning' },
              { label: 'Staff Availability', value: '94%', trend: 'Healthy', icon: Activity, status: 'good' }
            ].map((kpi, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#C5C6CB] p-6 shadow-sm flex flex-col justify-between hover:border-[#C09860] transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-medium text-[#71757A]">{kpi.label}</span>
                  <kpi.icon size={18} className={kpi.status === 'warning' ? 'text-red-500' : 'text-[#C09860]'} />
                </div>
                <div>
                  <div className="text-3xl font-light text-[#202830]">{kpi.value}</div>
                  <div className={`text-xs mt-1 ${kpi.status === 'warning' ? 'text-red-600 font-medium' : 'text-[#707070]'}`}>{kpi.trend}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-6">
            
            {/* Department Performance - 8 cols */}
            <section className="col-span-12 xl:col-span-8 bg-white rounded-xl border border-[#C5C6CB] shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-[#C5C6CB] flex justify-between items-center bg-[#F8F8F8]/50">
                <h2 className="text-sm font-bold tracking-wide uppercase text-[#202830] flex items-center gap-2">
                  <Briefcase size={16} className="text-[#C09860]" />
                  Department Performance
                </h2>
                <button className="text-xs font-medium text-[#71757A] hover:text-[#202830]">View Detailed Reports</button>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#F8F8F8] text-[#707070] text-xs uppercase tracking-wider border-b border-[#C5C6CB]">
                      <th className="px-6 py-3 font-medium">Department</th>
                      <th className="px-6 py-3 font-medium">Target vs Actual</th>
                      <th className="px-6 py-3 font-medium">Active Tasks</th>
                      <th className="px-6 py-3 font-medium">Overdue</th>
                      <th className="px-6 py-3 font-medium text-right">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F8F8F8]">
                    {departmentPerformance.map((row, i) => (
                      <tr key={i} className="hover:bg-[#F8F8F8]/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-[#202830]">{row.dept}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[#71757A] w-8">{row.target}%</span>
                            <div className="w-24 h-2 rounded-full bg-[#F8F8F8] border border-[#C5C6CB] overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  row.status === 'success' ? 'bg-green-500' :
                                  row.status === 'warning' ? 'bg-orange-400' :
                                  row.status === 'critical' ? 'bg-red-500' : 'bg-[#C09860]'
                                }`}
                                style={{ width: `${row.actual}%` }}
                              ></div>
                            </div>
                            <span className={`font-medium ${
                              row.status === 'critical' ? 'text-red-600' : 'text-[#202830]'
                            }`}>{row.actual}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#4A4943]">{row.activeTasks}</td>
                        <td className="px-6 py-4">
                          <span className={row.overdue > 20 ? 'text-red-600 font-medium' : 'text-[#4A4943]'}>
                            {row.overdue}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <TrendingUp size={16} className={row.status === 'critical' ? 'text-red-500 ml-auto' : 'text-green-500 ml-auto'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Operational Exceptions - 4 cols */}
            <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
              <section className="bg-white rounded-xl border border-[#C5C6CB] shadow-sm overflow-hidden flex-1">
                <div className="px-6 py-4 border-b border-[#C5C6CB] bg-[#F8F8F8]/50">
                  <h2 className="text-sm font-bold tracking-wide uppercase text-[#202830] flex items-center gap-2">
                    <AlertTriangle size={16} className="text-[#C09860]" />
                    Operational Exceptions
                  </h2>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  {operationalExceptions.map((exc, i) => (
                    <div key={i} className="flex items-start justify-between p-3 rounded-lg border border-[#C5C6CB] hover:border-red-400 bg-red-50/30 transition-colors cursor-pointer">
                      <div>
                        <div className="text-sm font-medium text-[#202830]">{exc.issue}</div>
                        <div className="text-xs text-[#71757A] mt-1">{exc.dept} • {exc.time}</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded border ${
                        exc.impact === 'High' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                        {exc.impact}
                      </span>
                    </div>
                  ))}
                  <button className="w-full text-center text-sm font-medium text-[#C09860] mt-2 hover:text-[#202830]">View All Exceptions</button>
                </div>
              </section>

              {/* Quick Actions */}
              <section className="bg-white rounded-xl border border-[#C5C6CB] shadow-sm overflow-hidden">
                 <div className="px-6 py-4 border-b border-[#C5C6CB] bg-[#F8F8F8]/50">
                  <h2 className="text-sm font-bold tracking-wide uppercase text-[#202830]">Quick Actions</h2>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  <button className="p-3 text-sm font-medium text-[#4A4943] border border-[#C5C6CB] rounded hover:border-[#C09860] hover:text-[#C09860] transition-colors flex flex-col items-center gap-2">
                    <MessageSquare size={18} />
                    Broadcast
                  </button>
                  <button className="p-3 text-sm font-medium text-[#4A4943] border border-[#C5C6CB] rounded hover:border-[#C09860] hover:text-[#C09860] transition-colors flex flex-col items-center gap-2">
                    <FileCheck size={18} />
                    Approvals (12)
                  </button>
                </div>
              </section>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default GeneralManagerDashboard;
