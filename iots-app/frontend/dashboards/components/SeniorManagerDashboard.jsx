import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  Users, 
  Activity, 
  AlertTriangle, 
  FileCheck, 
  Target, 
  Search,
  Bell,
  Clock,
  CheckCircle2,
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

const SeniorManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');

  const navItems = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'Task Management', icon: CheckSquare },
    { name: 'Team Roster & Leave', icon: Calendar },
    { name: 'Workload & Capacity', icon: Users },
    { name: 'Performance Metrics', icon: Activity },
    { name: 'Escalations', icon: AlertTriangle },
    { name: 'Approvals & Review', icon: FileCheck },
    { name: 'Operational Targets', icon: Target },
  ];

  const pendingApprovals = [
    { id: 'APP-102', req: 'Leave Request', user: 'Mark D.', date: 'Oct 08 - Oct 12' },
    { id: 'APP-103', req: 'Budget Revision', user: 'Finance Dept', date: 'Q4 2026' },
    { id: 'APP-104', req: 'Project Extension', user: 'IT Ops', date: 'Sprint 12' }
  ];

  const teamCapacity = [
    { team: 'Customer Support', load: 92, status: 'High' },
    { team: 'IT Operations', load: 78, status: 'Optimal' },
    { team: 'HR & Admin', load: 45, status: 'Low' },
    { team: 'Sales & BD', load: 85, status: 'High' }
  ];

  const escalatedTasks = [
    { id: 'TSK-088', task: 'Client Portal Outage', owner: 'Dev Team', priority: 'Critical', age: '4 hrs', issue: 'Resource Bottleneck' },
    { id: 'TSK-092', task: 'Q3 Report Finalization', owner: 'Finance', priority: 'High', age: '1 day', issue: 'Data Missing' },
    { id: 'TSK-105', task: 'New Hire Onboarding', owner: 'HR', priority: 'Medium', age: '2 days', issue: 'Hardware Delay' },
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
              <span className="text-[#F8F8F8] font-medium">SM</span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#F8F8F8]">Senior Manager</p>
              <p className="text-xs text-[#CAC1AB]">Operations Dept</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Global Header */}
        <header className="h-16 bg-white border-b border-[#C5C6CB] px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-[#202830]">Operations Management</h1>
            <div className="h-4 w-px bg-[#C5C6CB]"></div>
            <span className="text-sm text-[#707070]">Department View</span>
            <span className="flex items-center gap-1.5 text-sm text-[#4A4943] bg-[#CAC1AB]/20 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
            </span>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71757A]" size={16} />
              <input 
                type="text" 
                placeholder="Search tasks, users..." 
                className="pl-9 pr-4 py-1.5 bg-[#F8F8F8] border border-[#C5C6CB] rounded-md text-sm focus:outline-none focus:border-[#C09860] focus:ring-1 focus:ring-[#C09860] w-64 transition-all"
              />
            </div>
            <button className="relative p-1 text-[#4A4943] hover:text-[#202830] transition-colors">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#C09860] rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        {/* Dashboard Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Top KPI Row */}
          <div className="grid grid-cols-4 gap-6">
            {[
              { label: 'Active Tasks', value: '142', trend: '+12 this week', icon: CheckSquare },
              { label: 'Team Members on Leave', value: '8', trend: '2 returning tomorrow', icon: Calendar },
              { label: 'Pending Approvals', value: '15', trend: '5 urgent', icon: FileCheck },
              { label: 'Target Completion Rate', value: '88%', trend: '-2% vs last month', icon: Target }
            ].map((kpi, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#C5C6CB] p-6 shadow-sm flex flex-col justify-between hover:border-[#C09860] transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-medium text-[#71757A]">{kpi.label}</span>
                  <kpi.icon size={18} className="text-[#C09860]" />
                </div>
                <div>
                  <div className="text-3xl font-light text-[#202830]">{kpi.value}</div>
                  <div className="text-xs text-[#707070] mt-1">{kpi.trend}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-6">
            
            {/* Escalated Tasks - 8 cols */}
            <section className="col-span-12 xl:col-span-8 bg-white rounded-xl border border-[#C5C6CB] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#C5C6CB] flex justify-between items-center bg-[#F8F8F8]/50">
                <h2 className="text-sm font-bold tracking-wide uppercase text-[#202830] flex items-center gap-2">
                  <AlertTriangle size={16} className="text-[#C09860]" />
                  Active Escalations
                </h2>
                <button className="text-xs font-medium text-[#71757A] hover:text-[#202830]">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#F8F8F8] text-[#707070] text-xs uppercase tracking-wider border-b border-[#C5C6CB]">
                      <th className="px-6 py-3 font-medium">Escalated Task</th>
                      <th className="px-6 py-3 font-medium">Owner</th>
                      <th className="px-6 py-3 font-medium">Priority</th>
                      <th className="px-6 py-3 font-medium">Issue</th>
                      <th className="px-6 py-3 font-medium">Age</th>
                      <th className="px-6 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F8F8F8]">
                    {escalatedTasks.map((row) => (
                      <tr key={row.id} className="hover:bg-[#F8F8F8]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-[#202830]">{row.task}</div>
                          <div className="text-xs text-[#71757A]">{row.id}</div>
                        </td>
                        <td className="px-6 py-4 text-[#4A4943]">{row.owner}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                            row.priority === 'Critical' ? 'border-red-200 bg-red-50 text-red-700' :
                            row.priority === 'High' ? 'border-orange-200 bg-orange-50 text-orange-700' :
                            'border-[#C5C6CB] bg-white text-[#4A4943]'
                          }`}>
                            {row.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#4A4943]">{row.issue}</td>
                        <td className="px-6 py-4 text-[#71757A] text-xs">{row.age}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-xs font-medium text-[#C09860] hover:text-[#202830] transition-colors">Intervene</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Team Capacity & Approvals - 4 cols */}
            <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
              
              {/* Approvals */}
              <section className="bg-white rounded-xl border border-[#C5C6CB] shadow-sm overflow-hidden flex-1">
                <div className="px-6 py-4 border-b border-[#C5C6CB] bg-[#F8F8F8]/50">
                  <h2 className="text-sm font-bold tracking-wide uppercase text-[#202830] flex items-center gap-2">
                    <FileCheck size={16} className="text-[#C09860]" />
                    Pending Approvals
                  </h2>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  {pendingApprovals.map((app, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-[#C5C6CB] hover:border-[#C09860] bg-[#F8F8F8]/30 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-[#202830]">{app.req}</div>
                        <div className="text-xs text-[#71757A]">{app.user} • {app.date}</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-1.5 rounded bg-green-50 text-green-700 hover:bg-green-100 transition-colors" title="Approve">
                          <CheckCircle2 size={16} />
                        </button>
                        <button className="p-1.5 rounded bg-red-50 text-red-700 hover:bg-red-100 transition-colors" title="Reject">
                          <XCircle size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button className="w-full text-center text-sm font-medium text-[#C09860] mt-2 hover:text-[#202830]">View All Approvals</button>
                </div>
              </section>

              {/* Workload Capacity */}
              <section className="bg-white rounded-xl border border-[#C5C6CB] shadow-sm overflow-hidden flex-1">
                <div className="px-6 py-4 border-b border-[#C5C6CB] bg-[#F8F8F8]/50">
                  <h2 className="text-sm font-bold tracking-wide uppercase text-[#202830] flex items-center gap-2">
                    <Users size={16} className="text-[#C09860]" />
                    Team Capacity
                  </h2>
                </div>
                <div className="p-6 flex flex-col gap-5">
                  {teamCapacity.map((team, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-[#4A4943]">{team.team}</span>
                        <span className="text-xs font-medium text-[#707070]">{team.load}% Load</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#F8F8F8] border border-[#C5C6CB] overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${team.load > 90 ? 'bg-red-500' : team.load > 80 ? 'bg-orange-400' : 'bg-green-500'}`}
                          style={{ width: `${team.load}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default SeniorManagerDashboard;
