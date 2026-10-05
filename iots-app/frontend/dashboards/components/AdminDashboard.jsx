import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  Briefcase, 
  Settings, 
  ShieldCheck, 
  Megaphone, 
  FileBarChart,
  UserPlus,
  Search,
  Bell,
  MoreVertical,
  UserCheck,
  AlertTriangle,
  Clock,
  Activity
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'User Management', icon: Users },
    { name: 'Location & Attendance', icon: MapPin },
    { name: 'Global Task Management', icon: Briefcase },
    { name: 'System Settings', icon: Settings },
    { name: 'Security & Audit', icon: ShieldCheck },
    { name: 'Announcements', icon: Megaphone },
    { name: 'Reports', icon: FileBarChart }
  ];

  const userManagement = [
    { id: 'EMP-001', name: 'Alice Smith', designation: 'Graphic Designer', role: 'Employee', access: 'Limited', location: 'NY Office', team: 'Creative', status: 'Active' },
    { id: 'EMP-002', name: 'Bob Johnson', designation: 'Senior Manager', role: 'Manager', access: 'Higher-Level', location: 'LDN Office', team: 'Marketing', status: 'Active' },
    { id: 'EMP-003', name: 'Charlie Brown', designation: 'Social Media Manager', role: 'Employee', access: 'Limited', location: 'Remote', team: 'Marketing', status: 'Pending Review' }
  ];

  const recentAudits = [
    { time: '10:45 AM', action: 'User Activated', actor: 'Admin (System)', target: 'EMP-045 Account' },
    { time: '09:30 AM', action: 'Role Changed', actor: 'Admin (System)', target: 'EMP-012 Access Level' },
    { time: 'Yesterday', action: 'Global Task Reassigned', actor: 'Admin (System)', target: 'TSK-992' }
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
              <span className="text-[#F8F8F8] font-medium">AD</span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#F8F8F8]">System Admin</p>
              <p className="text-xs text-[#CAC1AB]">Administration</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-[#C5C6CB] px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-[#202830]">Administration Console</h1>
            <div className="h-4 w-px bg-[#C5C6CB]"></div>
            <span className="text-sm text-[#707070]">Routine Operations</span>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71757A]" />
              <input 
                type="text" 
                placeholder="Search users, tasks..." 
                className="pl-10 pr-4 py-1.5 bg-[#F8F8F8] border border-[#C5C6CB] rounded-md text-sm focus:outline-none focus:border-[#C09860] w-64"
              />
            </div>
            <button className="relative p-1 text-[#4A4943] hover:text-[#202830] transition-colors"><Bell size={20} /></button>
            <button className="bg-[#202830] hover:bg-[#2D312B] text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
              <UserPlus size={16} /> Create User
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Active Users', value: '142', trend: '+3 this month', icon: Users },
              { label: 'Pending Accounts', value: '4', trend: 'Requires action', icon: UserCheck },
              { label: 'Location Flags', value: '2', trend: 'Unusual logins', icon: AlertTriangle },
              { label: 'Active Global Tasks', value: '89', trend: '12 overdue', icon: Briefcase }
            ].map((kpi, i) => (
              <div key={i} className="bg-white rounded-lg border border-[#C5C6CB] shadow-sm p-5 flex items-center justify-between hover:border-[#C09860] transition-all cursor-pointer">
                <div>
                  <div className="text-sm font-medium text-[#71757A]">{kpi.label}</div>
                  <div className="text-2xl font-semibold mt-1 text-[#202830]">{kpi.value}</div>
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
                  <Users size={16} className="text-[#C09860]" />
                  User Directory (Recent)
                </h2>
                <button className="text-xs font-medium text-[#C09860] hover:text-[#202830]">View All Users</button>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#F8F8F8] text-[#707070] text-xs uppercase tracking-wider border-b border-[#C5C6CB]">
                      <th className="px-6 py-3 font-medium">Employee</th>
                      <th className="px-6 py-3 font-medium">Designation / Role</th>
                      <th className="px-6 py-3 font-medium">Location / Team</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F8F8F8]">
                    {userManagement.map((user, i) => (
                      <tr key={i} className="hover:bg-[#F8F8F8]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-[#202830]">{user.name}</div>
                          <div className="text-xs text-[#71757A]">{user.id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[#202830]">{user.designation}</div>
                          <div className="text-xs text-[#71757A]">{user.role} • {user.access}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[#202830]">{user.location}</div>
                          <div className="text-xs text-[#71757A]">{user.team}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                            user.status === 'Active' ? 'border-green-200 bg-green-50 text-green-700' :
                            'border-orange-200 bg-orange-50 text-orange-700'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-[#71757A] hover:text-[#202830]"><MoreVertical size={16} /></button>
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
                  <ShieldCheck size={16} className="text-[#C09860]" />
                  Recent Audit Events
                </h2>
              </div>
              <div className="p-6 flex-1 flex flex-col gap-4">
                {recentAudits.map((audit, idx) => (
                  <div key={idx} className="flex items-start gap-3 pb-4 border-b border-[#F8F8F8] last:border-0 last:pb-0">
                    <div className="mt-0.5 w-2 h-2 rounded-full bg-[#C09860]" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#202830]">{audit.action}</p>
                      <p className="text-xs text-[#71757A] mt-0.5">{audit.target}</p>
                      <div className="flex items-center justify-between mt-1 text-[11px] text-[#71757A]">
                        <span>{audit.actor}</span>
                        <span>{audit.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <button className="mt-auto w-full py-2 text-sm font-medium text-[#71757A] border border-[#C5C6CB] rounded hover:bg-[#F8F8F8] hover:text-[#202830] transition-colors">
                  View Full Audit Log
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
export default AdminDashboard;
