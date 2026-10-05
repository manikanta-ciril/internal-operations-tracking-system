import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Terminal, 
  Server, 
  ShieldAlert, 
  HardDrive, 
  Activity, 
  Ticket, 
  Key,
  Bell,
  Search,
  Wifi,
  Cpu,
  Database,
  ArrowUpCircle,
  MoreHorizontal
} from 'lucide-react';

const ITSystemAnalystDashboard = () => {
  const [activeTab, setActiveTab] = useState('System Overview');

  const navItems = [
    { name: 'System Overview', icon: LayoutDashboard },
    { name: 'Infrastructure', icon: Server },
    { name: 'Network Health', icon: Wifi },
    { name: 'Security & Access', icon: Key },
    { name: 'IT Support Tickets', icon: Ticket },
    { name: 'System Alerts', icon: ShieldAlert },
    { name: 'Database Ops', icon: Database },
    { name: 'Diagnostics', icon: Terminal },
    { name: 'Hardware Assets', icon: HardDrive }
  ];

  const systemAlerts = [
    { id: 'ALT-902', issue: 'High Memory Usage', system: 'Prod-DB-01', severity: 'Critical', time: '10 mins ago' },
    { id: 'ALT-903', issue: 'Failed Login Spikes', system: 'Auth Gateway', severity: 'High', time: '30 mins ago' },
    { id: 'ALT-904', issue: 'SSL Cert Expiring', system: 'Internal Portal', severity: 'Medium', time: '2 hrs ago' }
  ];

  const activeTickets = [
    { id: 'IT-5042', user: 'Sarah Jenkins', issue: 'VPN Access Denied', status: 'Open', priority: 'High', sla: '1 hr' },
    { id: 'IT-5043', user: 'David Chen', issue: 'Software Provisioning', status: 'In Progress', priority: 'Medium', sla: '4 hrs' },
    { id: 'IT-5040', user: 'Elena Rostova', issue: 'Account Unlock', status: 'Pending Auth', priority: 'High', sla: '15 mins' },
    { id: 'IT-5038', user: 'Mark D.', issue: 'Monitor Replacement', status: 'Assigned', priority: 'Low', sla: '2 days' },
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
              <span className="text-[#F8F8F8] font-medium">IT</span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#F8F8F8]">System Analyst</p>
              <p className="text-xs text-[#CAC1AB]">IT Operations</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Global Header */}
        <header className="h-16 bg-white border-b border-[#C5C6CB] px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-[#202830]">IT Operations Console</h1>
            <div className="h-4 w-px bg-[#C5C6CB]"></div>
            <span className="text-sm text-[#707070]">System Diagnostics</span>
            <span className="flex items-center gap-1.5 text-sm text-[#4A4943] bg-[#CAC1AB]/20 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Systems Normal
            </span>
          </div>
          
          <div className="flex items-center gap-5">
            <button className="relative p-1 text-[#4A4943] hover:text-[#202830] transition-colors">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <button className="bg-[#202830] hover:bg-[#2D312B] text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
              <Terminal size={16} /> Open Terminal
            </button>
          </div>
        </header>

        {/* Dashboard Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {/* Top KPI Row */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'System Uptime', value: '99.98%', trend: 'Last 30 Days', icon: Activity, alert: false },
              { label: 'Active Alerts', value: '3', trend: '1 Critical', icon: ShieldAlert, alert: true },
              { label: 'Open IT Tickets', value: '42', trend: '+5 since morning', icon: Ticket, alert: false },
              { label: 'Avg Resp Time', value: '142ms', trend: 'Within SLA', icon: Cpu, alert: false }
            ].map((kpi, i) => (
              <div key={i} className={`bg-white rounded-lg border ${kpi.alert ? 'border-red-200 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]' : 'border-[#C5C6CB] shadow-sm'} p-5 flex items-center justify-between hover:border-[#C09860] transition-all`}>
                <div>
                  <div className="text-sm font-medium text-[#71757A]">{kpi.label}</div>
                  <div className={`text-2xl font-semibold mt-1 ${kpi.alert ? 'text-red-600' : 'text-[#202830]'}`}>{kpi.value}</div>
                </div>
                <div className={`p-2 rounded-full ${kpi.alert ? 'bg-red-50 text-red-500' : 'bg-[#F8F8F8] text-[#C09860]'}`}>
                  <kpi.icon size={20} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-6">
            
            {/* Active Tickets - 8 cols */}
            <section className="col-span-12 xl:col-span-8 bg-white rounded-xl border border-[#C5C6CB] shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-[#C5C6CB] flex justify-between items-center bg-[#F8F8F8]/50">
                <h2 className="text-sm font-bold tracking-wide uppercase text-[#202830] flex items-center gap-2">
                  <Ticket size={16} className="text-[#C09860]" />
                  Active Support Tickets
                </h2>
                <div className="flex gap-2">
                  <button className="text-xs font-medium text-[#4A4943] bg-white border border-[#C5C6CB] px-3 py-1.5 rounded hover:border-[#707070] transition-colors">Filter</button>
                </div>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#F8F8F8] text-[#707070] text-xs uppercase tracking-wider border-b border-[#C5C6CB]">
                      <th className="px-6 py-3 font-medium">Ticket & User</th>
                      <th className="px-6 py-3 font-medium">Issue</th>
                      <th className="px-6 py-3 font-medium">Priority</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">SLA Time</th>
                      <th className="px-6 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F8F8F8]">
                    {activeTickets.map((row, i) => (
                      <tr key={i} className="hover:bg-[#F8F8F8]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-[#202830]">{row.id}</div>
                          <div className="text-xs text-[#71757A]">{row.user}</div>
                        </td>
                        <td className="px-6 py-4 text-[#4A4943]">{row.issue}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                            row.priority === 'High' ? 'border-orange-200 bg-orange-50 text-orange-700' :
                            'border-[#C5C6CB] bg-white text-[#4A4943]'
                          }`}>
                            {row.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#4A4943]">{row.status}</td>
                        <td className="px-6 py-4 text-[#71757A] text-xs font-medium">{row.sla}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-xs font-medium text-[#C09860] hover:text-[#202830] transition-colors">Resolve</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* System Alerts & Quick Ops - 4 cols */}
            <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
              
              {/* System Alerts */}
              <section className="bg-white rounded-xl border border-[#C5C6CB] shadow-sm overflow-hidden flex-1">
                <div className="px-6 py-4 border-b border-[#C5C6CB] bg-[#F8F8F8]/50">
                  <h2 className="text-sm font-bold tracking-wide uppercase text-[#202830] flex items-center gap-2">
                    <Server size={16} className="text-[#C09860]" />
                    Infrastructure Alerts
                  </h2>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  {systemAlerts.map((alert, i) => (
                    <div key={i} className={`flex items-start justify-between p-3 rounded-lg border ${
                      alert.severity === 'Critical' ? 'border-red-300 bg-red-50/50' :
                      alert.severity === 'High' ? 'border-orange-300 bg-orange-50/50' : 'border-[#C5C6CB] bg-[#F8F8F8]/30'
                    } cursor-pointer hover:shadow-sm transition-all`}>
                      <div>
                        <div className="text-sm font-medium text-[#202830]">{alert.issue}</div>
                        <div className="text-xs text-[#71757A] mt-1">{alert.system} • {alert.time}</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium ${
                        alert.severity === 'Critical' ? 'bg-red-100 text-red-700 border-red-200' : 
                        alert.severity === 'High' ? 'bg-orange-100 text-orange-700 border-orange-200' : 
                        'bg-white text-[#4A4943] border-[#C5C6CB]'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                  ))}
                  <button className="w-full text-center text-sm font-medium text-[#C09860] mt-2 hover:text-[#202830]">View Full Logs</button>
                </div>
              </section>

              {/* Quick Actions */}
              <section className="bg-white rounded-xl border border-[#C5C6CB] shadow-sm overflow-hidden">
                <div className="p-4 grid grid-cols-2 gap-3">
                  <button className="p-3 text-sm font-medium text-[#4A4943] border border-[#C5C6CB] rounded hover:border-[#C09860] hover:text-[#C09860] transition-colors flex flex-col items-center gap-2">
                    <Key size={18} /> Reset Password
                  </button>
                  <button className="p-3 text-sm font-medium text-[#4A4943] border border-[#C5C6CB] rounded hover:border-[#C09860] hover:text-[#C09860] transition-colors flex flex-col items-center gap-2">
                    <ArrowUpCircle size={18} /> Deploy Patch
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

export default ITSystemAnalystDashboard;
