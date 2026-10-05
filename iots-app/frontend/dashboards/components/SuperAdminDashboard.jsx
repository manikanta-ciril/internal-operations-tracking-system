import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Globe, 
  Lock, 
  Activity, 
  Settings, 
  Database,
  Users,
  Search,
  Bell,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  Server,
  Command
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Platform Governance', icon: Globe },
    { name: 'Security Policies', icon: ShieldAlert },
    { name: 'Global Audit Logs', icon: Activity },
    { name: 'Roles & Permissions', icon: Lock },
    { name: 'Access Control', icon: Users },
    { name: 'Infrastructure', icon: Server },
    { name: 'Org Settings', icon: Settings }
  ];

  const policyStatus = [
    { name: 'Strict Location Binding', status: 'Enforced', scope: 'Global', lastUpdated: 'Oct 1, 2026' },
    { name: 'Executive Audit Tracking', status: 'Enforced', scope: 'Managers+', lastUpdated: 'Sep 15, 2026' },
    { name: 'Off-Hours Access Alert', status: 'Warning Only', scope: 'Global', lastUpdated: 'Oct 4, 2026' }
  ];

  const criticalAudits = [
    { time: '14:20 PM', action: 'Global Policy Modified', actor: 'SA-001 (Root)', severity: 'Critical' },
    { time: '11:05 AM', action: 'Mass Role Update', actor: 'Admin-03', severity: 'High' },
    { time: 'Yesterday', action: 'Failed Auth Spike (Region 2)', actor: 'System Alert', severity: 'High' }
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
              <span className="text-[#F8F8F8] font-medium">SA</span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#F8F8F8]">Super Admin</p>
              <p className="text-xs text-[#CAC1AB]">Platform Governance</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-[#C5C6CB] px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-[#202830]">Platform Governance</h1>
            <div className="h-4 w-px bg-[#C5C6CB]"></div>
            <span className="text-sm text-[#707070]">Root Access</span>
          </div>
          
          <div className="flex items-center gap-5">
            <button className="relative p-1 text-[#4A4943] hover:text-[#202830] transition-colors"><Bell size={20} /></button>
            <button className="bg-red-700 hover:bg-red-800 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
              <Command size={16} /> Global Override
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Active Security Policies', value: '14', trend: 'All enforced', icon: ShieldAlert },
              { label: 'High-Level Audits (24h)', value: '3', trend: 'Requires review', icon: Activity },
              { label: 'Platform Status', value: 'Nominal', trend: '99.99% Uptime', icon: Server },
              { label: 'Admin Escalations', value: '0', trend: 'Clear queue', icon: AlertTriangle }
            ].map((kpi, i) => (
              <div key={i} className="bg-white rounded-lg border border-[#C5C6CB] shadow-sm p-5 flex items-center justify-between hover:border-[#C09860] transition-all cursor-pointer">
                <div>
                  <div className="text-sm font-medium text-[#71757A]">{kpi.label}</div>
                  <div className={`text-2xl font-semibold mt-1 ${kpi.value === 'Nominal' ? 'text-green-700' : 'text-[#202830]'}`}>{kpi.value}</div>
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
                  <Globe size={16} className="text-[#C09860]" />
                  Global Security Policies
                </h2>
                <button className="text-xs font-medium text-[#C09860] hover:text-[#202830]">Manage Policies</button>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#F8F8F8] text-[#707070] text-xs uppercase tracking-wider border-b border-[#C5C6CB]">
                      <th className="px-6 py-3 font-medium">Policy Name</th>
                      <th className="px-6 py-3 font-medium">Scope</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Last Updated</th>
                      <th className="px-6 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F8F8F8]">
                    {policyStatus.map((policy, i) => (
                      <tr key={i} className="hover:bg-[#F8F8F8]/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-[#202830]">{policy.name}</td>
                        <td className="px-6 py-4 text-[#71757A]">{policy.scope}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                            policy.status === 'Enforced' ? 'border-green-200 bg-green-50 text-green-700' :
                            'border-orange-200 bg-orange-50 text-orange-700'
                          }`}>
                            {policy.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#4A4943]">{policy.lastUpdated}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-xs font-medium text-[#C09860] hover:text-[#202830] transition-colors">Configure</button>
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
                  <Activity size={16} className="text-[#C09860]" />
                  High-Level Audit Stream
                </h2>
              </div>
              <div className="p-6 flex-1 flex flex-col gap-4">
                {criticalAudits.map((audit, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-[#F8F8F8] bg-[#F8F8F8]/50 hover:bg-white hover:border-[#C5C6CB] transition-colors">
                    <div className={`mt-0.5 w-2 h-2 rounded-full ${audit.severity === 'Critical' ? 'bg-red-600' : 'bg-orange-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#202830]">{audit.action}</p>
                      <p className="text-xs text-[#71757A] mt-0.5">By {audit.actor}</p>
                      <div className="text-xs font-semibold mt-1 text-[#202830]">
                        {audit.time}
                      </div>
                    </div>
                  </div>
                ))}
                <button className="mt-auto w-full py-2 text-sm font-medium text-[#71757A] border border-[#C5C6CB] rounded hover:bg-[#F8F8F8] hover:text-[#202830] transition-colors">
                  Open Global Audit Explorer
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
export default SuperAdminDashboard;
