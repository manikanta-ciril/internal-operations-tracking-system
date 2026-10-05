import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Target, 
  Users, 
  TrendingUp, 
  Calendar, 
  FileText, 
  MessageSquare,
  Search,
  Bell,
  PhoneCall,
  Mail,
  MoreHorizontal,
  CheckCircle2,
  PieChart
} from 'lucide-react';

const BusinessDevelopmentExecutiveDashboard = () => {
  const [activeTab, setActiveTab] = useState('My Workspace');

  const navItems = [
    { name: 'My Workspace', icon: LayoutDashboard },
    { name: 'Pipeline', icon: Briefcase },
    { name: 'Leads & Accounts', icon: Users },
    { name: 'Targets & Quota', icon: Target },
    { name: 'Meetings', icon: Calendar },
    { name: 'Proposals', icon: FileText },
    { name: 'Performance', icon: TrendingUp },
    { name: 'Communications', icon: MessageSquare }
  ];

  const activeDeals = [
    { client: 'Acme Corp', value: '$45,000', stage: 'Negotiation', probability: 80, nextAction: 'Send Final Contract', date: 'Tomorrow' },
    { client: 'Stark Industries', value: '$120,000', stage: 'Proposal Sent', probability: 50, nextAction: 'Follow-up Call', date: 'Oct 12' },
    { client: 'Wayne Enterprises', value: '$85,000', stage: 'Discovery', probability: 30, nextAction: 'Technical Demo', date: 'Oct 15' },
    { client: 'Oscorp', value: '$25,000', stage: 'Closed Won', probability: 100, nextAction: 'Handover to Ops', date: 'Done' }
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
              <span className="text-[#F8F8F8] font-medium">BD</span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#F8F8F8]">BD Executive</p>
              <p className="text-xs text-[#CAC1AB]">Sales Division</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Global Header */}
        <header className="h-16 bg-white border-b border-[#C5C6CB] px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-[#202830]">BD Workspace</h1>
            <div className="h-4 w-px bg-[#C5C6CB]"></div>
            <span className="text-sm text-[#707070]">Q4 Execution</span>
            <span className="flex items-center gap-1.5 text-sm text-[#4A4943] bg-[#CAC1AB]/20 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Available
            </span>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71757A]" size={16} />
              <input 
                type="text" 
                placeholder="Search accounts..." 
                className="pl-9 pr-4 py-1.5 bg-[#F8F8F8] border border-[#C5C6CB] rounded-md text-sm focus:outline-none focus:border-[#C09860] focus:ring-1 focus:ring-[#C09860] w-64 transition-all"
              />
            </div>
            <button className="relative p-1 text-[#4A4943] hover:text-[#202830] transition-colors">
              <Bell size={20} />
            </button>
            <button className="bg-[#202830] hover:bg-[#2D312B] text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
              + New Lead
            </button>
          </div>
        </header>

        {/* Dashboard Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {/* Top KPI Row */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Q4 Target Achieved', value: '72%', trend: 'On track', icon: Target },
              { label: 'Active Pipeline', value: '$240k', trend: '4 deals', icon: Briefcase },
              { label: 'Meetings This Week', value: '12', trend: '3 upcoming today', icon: Calendar },
              { label: 'Proposals Out', value: '5', trend: 'Awaiting signature', icon: FileText }
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
            
            {/* Active Deals - 8 cols */}
            <section className="col-span-12 xl:col-span-8 bg-white rounded-xl border border-[#C5C6CB] shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-[#C5C6CB] flex justify-between items-center bg-[#F8F8F8]/50">
                <h2 className="text-sm font-bold tracking-wide uppercase text-[#202830] flex items-center gap-2">
                  <PieChart size={16} className="text-[#C09860]" />
                  Active Deals
                </h2>
                <div className="flex gap-2">
                  <button className="text-xs font-medium text-[#4A4943] bg-white border border-[#C5C6CB] px-3 py-1.5 rounded hover:border-[#707070] transition-colors">Pipeline View</button>
                </div>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#F8F8F8] text-[#707070] text-xs uppercase tracking-wider border-b border-[#C5C6CB]">
                      <th className="px-6 py-3 font-medium">Client & Value</th>
                      <th className="px-6 py-3 font-medium">Stage</th>
                      <th className="px-6 py-3 font-medium">Probability</th>
                      <th className="px-6 py-3 font-medium">Next Action</th>
                      <th className="px-6 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F8F8F8]">
                    {activeDeals.map((row, i) => (
                      <tr key={i} className="hover:bg-[#F8F8F8]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-[#202830]">{row.client}</div>
                          <div className="text-xs text-[#71757A]">{row.value}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                            row.stage === 'Closed Won' ? 'border-green-200 bg-green-50 text-green-700' :
                            'border-[#C5C6CB] bg-white text-[#4A4943]'
                          }`}>
                            {row.stage}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-[#F8F8F8] border border-[#C5C6CB] overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${row.probability > 70 ? 'bg-green-500' : row.probability > 40 ? 'bg-orange-400' : 'bg-red-400'}`}
                                style={{ width: `${row.probability}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-[#4A4943]">{row.probability}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[#202830]">{row.nextAction}</div>
                          <div className="text-xs text-[#71757A]">{row.date}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-xs font-medium text-[#C09860] hover:text-[#202830] transition-colors">Update</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Today's Schedule - 4 cols */}
            <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
              
              <section className="bg-white rounded-xl border border-[#C5C6CB] shadow-sm overflow-hidden flex-1">
                <div className="px-6 py-4 border-b border-[#C5C6CB] bg-[#F8F8F8]/50">
                  <h2 className="text-sm font-bold tracking-wide uppercase text-[#202830] flex items-center gap-2">
                    <Calendar size={16} className="text-[#C09860]" />
                    Today's Schedule
                  </h2>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="text-right w-12 shrink-0">
                      <div className="text-sm font-semibold text-[#202830]">10:00</div>
                      <div className="text-xs text-[#71757A]">AM</div>
                    </div>
                    <div className="flex-1 p-3 rounded-lg border border-l-4 border-[#C5C6CB] border-l-[#C09860] bg-[#F8F8F8]/30">
                      <div className="text-sm font-medium text-[#202830]">Discovery Call: Wayne Ent.</div>
                      <div className="text-xs text-[#71757A] mt-1 flex items-center gap-1"><PhoneCall size={12}/> Zoom</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="text-right w-12 shrink-0">
                      <div className="text-sm font-semibold text-[#202830]">01:30</div>
                      <div className="text-xs text-[#71757A]">PM</div>
                    </div>
                    <div className="flex-1 p-3 rounded-lg border border-l-4 border-[#C5C6CB] border-l-blue-400 bg-[#F8F8F8]/30">
                      <div className="text-sm font-medium text-[#202830]">Internal Sales Sync</div>
                      <div className="text-xs text-[#71757A] mt-1 flex items-center gap-1"><Users size={12}/> Room B</div>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default BusinessDevelopmentExecutiveDashboard;
