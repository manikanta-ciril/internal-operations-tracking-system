import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  PlayCircle, 
  Activity, 
  AlertOctagon, 
  Send, 
  Calendar, 
  Bell, 
  BarChart2, 
  User,
  Clock,
  Play,
  CheckCircle2,
  AlertTriangle,
  Paperclip,
  MessageSquare
} from 'lucide-react';

const ExecutiveDashboard = () => {
  const [activeTab, setActiveTab] = useState('My Dashboard');

  const navItems = [
    { name: 'My Dashboard', icon: LayoutDashboard },
    { name: 'My Tasks', icon: CheckSquare },
    { name: 'Task Execution', icon: PlayCircle },
    { name: 'Work Activity', icon: Activity },
    { name: 'Issues / Blockers', icon: AlertOctagon },
    { name: 'Requests', icon: Send },
    { name: 'Attendance', icon: Calendar },
    { name: 'My Performance', icon: BarChart2 },
    { name: 'Profile', icon: User }
  ];

  const myTasks = [
    { id: 'TSK-1042', task: 'Q3 Financial Reconciliation', priority: 'High', due: 'Today, 5:00 PM', status: 'In Progress', progress: 65 },
    { id: 'TSK-1045', task: 'Vendor Agreement Review', priority: 'Medium', due: 'Tomorrow, 12:00 PM', status: 'Pending', progress: 0 },
    { id: 'TSK-1038', task: 'Monthly Expense Report', priority: 'High', due: 'Yesterday', status: 'Overdue', progress: 90 },
    { id: 'TSK-1048', task: 'Team Training Module', priority: 'Low', due: 'Oct 15', status: 'Blocked', progress: 20 },
  ];

  const recentActivity = [
    { type: 'Update', task: 'TSK-1042', action: 'Added 2 hours of effort', time: '1 hr ago' },
    { type: 'Blocker', task: 'TSK-1048', action: 'Reported missing documentation', time: '3 hrs ago' },
    { type: 'Completed', task: 'TSK-1035', action: 'Submitted for manager review', time: 'Yesterday' }
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
              <span className="text-[#F8F8F8] font-medium">EX</span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#F8F8F8]">Executive User</p>
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
            <h1 className="text-lg font-semibold text-[#202830]">My Workspace</h1>
            <div className="h-4 w-px bg-[#C5C6CB]"></div>
            <span className="text-sm text-[#707070]">Personal Execution Dashboard</span>
            <select className="bg-[#F8F8F8] border border-[#C5C6CB] text-sm text-[#4A4943] rounded px-2 py-1 outline-none focus:border-[#C09860]">
              <option>Available</option>
              <option>Busy</option>
              <option>On Break</option>
            </select>
          </div>
          
          <div className="flex items-center gap-5">
            <button className="relative p-1 text-[#4A4943] hover:text-[#202830] transition-colors">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <button className="bg-[#C09860] hover:bg-[#A88554] text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
              <Play size={16} fill="currentColor" /> Resume Work
            </button>
          </div>
        </header>

        {/* Dashboard Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {/* Top Quick Status Row */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Tasks Due Today', value: '2', icon: Clock, alert: false },
              { label: 'Overdue Tasks', value: '1', icon: AlertTriangle, alert: true },
              { label: 'Tasks Pending Review', value: '3', icon: CheckCircle2, alert: false },
              { label: 'Active Blockers', value: '1', icon: AlertOctagon, alert: true }
            ].map((kpi, i) => (
              <div key={i} className={`bg-white rounded-lg border ${kpi.alert ? 'border-orange-300 shadow-[0_0_0_1px_rgba(249,115,22,0.1)]' : 'border-[#C5C6CB] shadow-sm'} p-5 flex items-center justify-between hover:border-[#C09860] transition-all cursor-pointer`}>
                <div>
                  <div className="text-sm font-medium text-[#71757A]">{kpi.label}</div>
                  <div className={`text-2xl font-semibold mt-1 ${kpi.alert ? 'text-orange-600' : 'text-[#202830]'}`}>{kpi.value}</div>
                </div>
                <div className={`p-2 rounded-full ${kpi.alert ? 'bg-orange-50 text-orange-500' : 'bg-[#F8F8F8] text-[#C09860]'}`}>
                  <kpi.icon size={20} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-6">
            
            {/* My Active Tasks - 8 cols */}
            <section className="col-span-12 xl:col-span-8 bg-white rounded-xl border border-[#C5C6CB] shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-[#C5C6CB] flex justify-between items-center bg-[#F8F8F8]/50">
                <h2 className="text-sm font-bold tracking-wide uppercase text-[#202830] flex items-center gap-2">
                  <CheckSquare size={16} className="text-[#C09860]" />
                  My Active Tasks
                </h2>
                <div className="flex gap-2">
                  <button className="text-xs font-medium text-[#4A4943] bg-white border border-[#C5C6CB] px-3 py-1.5 rounded hover:border-[#707070] transition-colors">Filter</button>
                </div>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#F8F8F8] text-[#707070] text-xs uppercase tracking-wider border-b border-[#C5C6CB]">
                      <th className="px-6 py-3 font-medium">Task & ID</th>
                      <th className="px-6 py-3 font-medium">Priority</th>
                      <th className="px-6 py-3 font-medium">Status & Progress</th>
                      <th className="px-6 py-3 font-medium">Due</th>
                      <th className="px-6 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F8F8F8]">
                    {myTasks.map((row, i) => (
                      <tr key={i} className="hover:bg-[#F8F8F8]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-[#202830]">{row.task}</div>
                          <div className="text-xs text-[#71757A]">{row.id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                            row.priority === 'High' ? 'border-orange-200 bg-orange-50 text-orange-700' :
                            'border-[#C5C6CB] bg-white text-[#4A4943]'
                          }`}>
                            {row.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            <span className={`text-xs font-medium ${
                              row.status === 'Overdue' ? 'text-red-600' :
                              row.status === 'Blocked' ? 'text-orange-600' : 'text-[#4A4943]'
                            }`}>{row.status}</span>
                            <div className="w-24 h-1.5 rounded-full bg-[#F8F8F8] border border-[#C5C6CB] overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${row.status === 'Overdue' ? 'bg-red-500' : 'bg-[#C09860]'}`}
                                style={{ width: `${row.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 ${row.status === 'Overdue' ? 'text-red-600 font-medium' : 'text-[#4A4943]'}`}>
                          {row.due}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-xs font-medium bg-[#202830] text-white px-3 py-1.5 rounded hover:bg-[#2D312B] transition-colors">
                            {row.status === 'In Progress' ? 'Continue' : 'Start Work'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Quick Actions & Recent Activity - 4 cols */}
            <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
              
              {/* Log Work / Quick Actions */}
              <section className="bg-white rounded-xl border border-[#C5C6CB] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#C5C6CB] bg-[#F8F8F8]/50">
                  <h2 className="text-sm font-bold tracking-wide uppercase text-[#202830]">Execution Actions</h2>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  <button className="p-3 text-sm font-medium text-[#4A4943] border border-[#C5C6CB] rounded hover:border-[#C09860] hover:text-[#C09860] transition-colors flex flex-col items-center gap-2">
                    <Clock size={18} /> Log Time
                  </button>
                  <button className="p-3 text-sm font-medium text-[#4A4943] border border-[#C5C6CB] rounded hover:border-[#C09860] hover:text-[#C09860] transition-colors flex flex-col items-center gap-2">
                    <MessageSquare size={18} /> Add Note
                  </button>
                  <button className="p-3 text-sm font-medium text-[#4A4943] border border-[#C5C6CB] rounded hover:border-red-400 hover:text-red-600 transition-colors flex flex-col items-center gap-2">
                    <AlertOctagon size={18} /> Report Blocker
                  </button>
                  <button className="p-3 text-sm font-medium text-[#4A4943] border border-[#C5C6CB] rounded hover:border-[#C09860] hover:text-[#C09860] transition-colors flex flex-col items-center gap-2">
                    <Paperclip size={18} /> Attach File
                  </button>
                </div>
              </section>

              {/* Recent Activity */}
              <section className="bg-white rounded-xl border border-[#C5C6CB] shadow-sm overflow-hidden flex-1">
                <div className="px-6 py-4 border-b border-[#C5C6CB] bg-[#F8F8F8]/50">
                  <h2 className="text-sm font-bold tracking-wide uppercase text-[#202830] flex items-center gap-2">
                    <Activity size={16} className="text-[#C09860]" />
                    My Recent Activity
                  </h2>
                </div>
                <div className="p-6 flex flex-col gap-5">
                  {recentActivity.map((act, i) => (
                    <div key={i} className="flex gap-3 relative">
                      {i !== recentActivity.length - 1 && (
                        <div className="absolute left-2.5 top-6 bottom-[-20px] w-px bg-[#C5C6CB]"></div>
                      )}
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        act.type === 'Completed' ? 'bg-green-100 text-green-600' :
                        act.type === 'Blocker' ? 'bg-orange-100 text-orange-600' : 'bg-[#E5E7EB] text-[#71757A]'
                      }`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="flex justify-between items-baseline">
                          <span className="text-sm font-medium text-[#202830]">{act.action}</span>
                          <span className="text-xs text-[#71757A]">{act.time}</span>
                        </div>
                        <div className="text-xs text-[#4A4943] mt-0.5">{act.type} • {act.task}</div>
                      </div>
                    </div>
                  ))}
                  <button className="w-full text-center text-sm font-medium text-[#C09860] mt-2 hover:text-[#202830]">View Full History</button>
                </div>
              </section>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ExecutiveDashboard;
