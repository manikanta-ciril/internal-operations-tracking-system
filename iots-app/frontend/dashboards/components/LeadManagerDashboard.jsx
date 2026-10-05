import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Calendar, 
  Target, 
  AlertTriangle, 
  FileCheck, 
  Activity, 
  FileText, 
  MessageSquare,
  Search,
  Bell,
  Clock,
  CheckCircle2,
  XCircle,
  UserCheck,
  UserX,
  Coffee,
  MoreHorizontal
} from 'lucide-react';

const LeadManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Task Management', icon: CheckSquare },
    { name: 'Team', icon: Users },
    { name: 'Workload', icon: Activity },
    { name: 'Live Targets', icon: Target },
    { name: 'Attendance & Leave', icon: Calendar },
    { name: 'Blockers & Escalations', icon: AlertTriangle },
    { name: 'Approvals / QA', icon: FileCheck },
    { name: 'Performance', icon: Activity },
    { name: 'Reports', icon: FileText },
    { name: 'Communication', icon: MessageSquare }
  ];

  const teamStatus = [
    { name: 'Alex M.', role: 'Executive', status: 'Available', task: 'Q3 Review', priority: 'High', due: '14:00', load: 60, icon: UserCheck, color: 'text-green-500' },
    { name: 'Sarah J.', role: 'Executive', status: 'In Meeting', task: 'Client Call', priority: 'Medium', due: '15:30', load: 85, icon: Users, color: 'text-orange-500' },
    { name: 'David C.', role: 'Analyst', status: 'On Break', task: 'Data Sync', priority: 'Low', due: 'EOD', load: 40, icon: Coffee, color: 'text-blue-500' },
    { name: 'Elena R.', role: 'Executive', status: 'Offline', task: 'None', priority: '-', due: '-', load: 0, icon: UserX, color: 'text-[#71757A]' },
  ];

  const actionCenter = [
    { type: 'Review Required', item: 'Task TSK-402 Completed', user: 'Alex M.', time: '10 mins ago', icon: FileCheck },
    { type: 'Overdue Task', item: 'Monthly Reconciliation', user: 'Sarah J.', time: '2 hrs overdue', icon: Clock },
    { type: 'Blocker', item: 'API Access Denied', user: 'David C.', time: '30 mins ago', icon: AlertTriangle },
    { type: 'Leave Request', item: 'PTO Request (2 days)', user: 'Elena R.', time: '1 hr ago', icon: Calendar }
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
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
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
              <span className="text-[#F8F8F8] font-medium">LM</span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#F8F8F8]">Lead Manager</p>
              <p className="text-xs text-[#CAC1AB]">Alpha Team</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Global Header */}
        <header className="h-16 bg-white border-b border-[#C5C6CB] px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-[#202830]">Team Operations</h1>
            <div className="h-4 w-px bg-[#C5C6CB]"></div>
            <span className="text-sm text-[#707070]">Alpha Team Dashboard</span>
            <span className="flex items-center gap-1.5 text-sm text-[#4A4943] bg-[#CAC1AB]/20 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Available
            </span>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71757A]" size={16} />
              <input 
                type="text" 
                placeholder="Find task or team member..." 
                className="pl-9 pr-4 py-1.5 bg-[#F8F8F8] border border-[#C5C6CB] rounded-md text-sm focus:outline-none focus:border-[#C09860] focus:ring-1 focus:ring-[#C09860] w-64 transition-all"
              />
            </div>
            <button className="relative p-1 text-[#4A4943] hover:text-[#202830] transition-colors">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <button className="bg-[#202830] hover:bg-[#2D312B] text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors">
              + Assign Task
            </button>
          </div>
        </header>

        {/* Dashboard Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#F8F8F8]">
          
          {/* Top KPI Row */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Pending Reviews', value: '7', trend: '3 high priority', icon: FileCheck, alert: false },
              { label: 'Overdue Tasks', value: '4', trend: 'Requires intervention', icon: Clock, alert: true },
              { label: 'Blocked Tasks', value: '2', trend: 'Awaiting your action', icon: AlertTriangle, alert: true },
              { label: 'Today\'s Targets', value: '85%', trend: 'On track to meet SLA', icon: Target, alert: false }
            ].map((kpi, i) => (
              <div key={i} className={`bg-white rounded-lg border ${kpi.alert ? 'border-red-200 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]' : 'border-[#C5C6CB] shadow-sm'} p-5 flex flex-col justify-between hover:border-[#C09860] transition-all cursor-pointer group`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-[#71757A] group-hover:text-[#202830] transition-colors">{kpi.label}</span>
                  <div className={`p-1.5 rounded-md ${kpi.alert ? 'bg-red-50 text-red-500' : 'bg-[#F8F8F8] text-[#C09860]'}`}>
                    <kpi.icon size={16} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-[#202830]">{kpi.value}</div>
                  <div className={`text-xs mt-1 ${kpi.alert ? 'text-red-600 font-medium' : 'text-[#707070]'}`}>{kpi.trend}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-6">
            
            {/* Live Team Status - 7 cols */}
            <section className="col-span-12 xl:col-span-7 bg-white rounded-xl border border-[#C5C6CB] shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-[#C5C6CB] flex justify-between items-center bg-[#F8F8F8]/50">
                <h2 className="text-sm font-bold tracking-wide uppercase text-[#202830] flex items-center gap-2">
                  <Users size={16} className="text-[#C09860]" />
                  Live Team Status
                </h2>
                <button className="text-xs font-medium text-[#71757A] hover:text-[#202830]">Manage Roster</button>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#F8F8F8] text-[#707070] text-xs uppercase tracking-wider border-b border-[#C5C6CB]">
                      <th className="px-6 py-3 font-medium">Employee</th>
                      <th className="px-6 py-3 font-medium">Availability</th>
                      <th className="px-6 py-3 font-medium">Current Task</th>
                      <th className="px-6 py-3 font-medium">Due</th>
                      <th className="px-6 py-3 font-medium">Workload</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F8F8F8]">
                    {teamStatus.map((row, i) => (
                      <tr key={i} className="hover:bg-[#F8F8F8]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-[#202830]">{row.name}</div>
                          <div className="text-xs text-[#71757A]">{row.role}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <row.icon size={14} className={row.color} />
                            <span className="text-[#4A4943]">{row.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[#202830]">{row.task}</div>
                          {row.priority !== '-' && (
                            <div className="text-[10px] uppercase text-[#71757A] mt-0.5">{row.priority} Priority</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[#4A4943]">{row.due}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-[#F8F8F8] border border-[#C5C6CB] overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  row.load > 80 ? 'bg-orange-400' : 'bg-green-500'
                                }`}
                                style={{ width: `${row.load}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-[#71757A]">{row.load}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Manager Action Center - 5 cols */}
            <section className="col-span-12 xl:col-span-5 flex flex-col bg-white rounded-xl border border-[#C5C6CB] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#C5C6CB] bg-[#F8F8F8]/50 flex justify-between items-center">
                <h2 className="text-sm font-bold tracking-wide uppercase text-[#202830] flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#C09860]" />
                  Action Center
                </h2>
                <span className="bg-[#202830] text-white text-xs font-bold px-2 py-0.5 rounded-full">4</span>
              </div>
              <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto">
                {actionCenter.map((action, i) => (
                  <div key={i} className="flex gap-4 p-3 rounded-lg border border-[#C5C6CB] hover:border-[#C09860] hover:shadow-sm transition-all group cursor-pointer bg-white">
                    <div className="mt-0.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        action.type.includes('Review') ? 'bg-blue-50 text-blue-600' :
                        action.type.includes('Overdue') ? 'bg-red-50 text-red-600' :
                        action.type.includes('Blocker') ? 'bg-orange-50 text-orange-600' :
                        'bg-purple-50 text-purple-600'
                      }`}>
                        <action.icon size={16} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-semibold text-[#71757A] uppercase tracking-wider">{action.type}</span>
                        <span className="text-xs text-[#71757A]">{action.time}</span>
                      </div>
                      <div className="text-sm font-medium text-[#202830] mt-1 group-hover:text-[#C09860] transition-colors">{action.item}</div>
                      <div className="text-sm text-[#4A4943] mt-0.5">{action.user}</div>
                      
                      <div className="mt-3 flex gap-2">
                        <button className="text-xs font-medium bg-[#F8F8F8] border border-[#C5C6CB] px-3 py-1.5 rounded hover:bg-[#202830] hover:text-white hover:border-[#202830] transition-colors flex-1">
                          Take Action
                        </button>
                        {action.type.includes('Review') && (
                          <button className="text-xs font-medium bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded hover:bg-green-600 hover:text-white transition-colors flex-1">
                            Quick Approve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
};

export default LeadManagerDashboard;
