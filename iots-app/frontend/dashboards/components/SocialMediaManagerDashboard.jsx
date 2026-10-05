import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  MessageCircle, 
  TrendingUp, 
  Image as ImageIcon,
  Share2,
  Users,
  Search,
  Bell,
  CheckCircle2,
  PieChart,
  Eye,
  Heart
} from 'lucide-react';

const SocialMediaManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('Campaign Overview');

  const navItems = [
    { name: 'Campaign Overview', icon: LayoutDashboard },
    { name: 'Content Calendar', icon: Calendar },
    { name: 'Engagement & Mentions', icon: MessageCircle },
    { name: 'Platform Analytics', icon: TrendingUp },
    { name: 'Assets & Media', icon: ImageIcon },
    { name: 'Publishing', icon: Share2 },
    { name: 'Audience Insights', icon: Users }
  ];

  const contentSchedule = [
    { platform: 'LinkedIn', content: 'Q3 Product Update Video', status: 'Scheduled', date: 'Today, 10:00 AM', engagement: 'High Expected' },
    { platform: 'Twitter', content: 'Feature Thread', status: 'Draft', date: 'Tomorrow, 2:00 PM', engagement: '-' },
    { platform: 'Instagram', content: 'Behind the Scenes Story', status: 'Needs Review', date: 'Oct 15, 9:00 AM', engagement: '-' }
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
              <span className="text-[#F8F8F8] font-medium">SM</span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#F8F8F8]">Social Media Mgr</p>
              <p className="text-xs text-[#CAC1AB]">Marketing Div</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-[#C5C6CB] px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-[#202830]">Social Campaign Hub</h1>
            <div className="h-4 w-px bg-[#C5C6CB]"></div>
            <span className="text-sm text-[#707070]">Q4 Execution</span>
          </div>
          
          <div className="flex items-center gap-5">
            <button className="relative p-1 text-[#4A4943] hover:text-[#202830] transition-colors"><Bell size={20} /></button>
            <button className="bg-[#202830] hover:bg-[#2D312B] text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
              + New Post
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total Engagement', value: '45.2K', trend: '+12% this week', icon: Heart },
              { label: 'Total Reach', value: '1.2M', trend: '+5% this week', icon: Eye },
              { label: 'Pending Posts', value: '8', trend: 'Next 7 days', icon: Calendar },
              { label: 'Mentions to Triage', value: '24', trend: '5 urgent', icon: MessageCircle }
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
                  <Share2 size={16} className="text-[#C09860]" />
                  Upcoming Content
                </h2>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#F8F8F8] text-[#707070] text-xs uppercase tracking-wider border-b border-[#C5C6CB]">
                      <th className="px-6 py-3 font-medium">Platform & Content</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Schedule</th>
                      <th className="px-6 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F8F8F8]">
                    {contentSchedule.map((row, i) => (
                      <tr key={i} className="hover:bg-[#F8F8F8]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-[#202830]">{row.content}</div>
                          <div className="text-xs text-[#71757A]">{row.platform}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                            row.status === 'Scheduled' ? 'border-green-200 bg-green-50 text-green-700' :
                            row.status === 'Needs Review' ? 'border-orange-200 bg-orange-50 text-orange-700' :
                            'border-[#C5C6CB] bg-white text-[#4A4943]'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#4A4943]">{row.date}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-xs font-medium text-[#C09860] hover:text-[#202830] transition-colors">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
export default SocialMediaManagerDashboard;
