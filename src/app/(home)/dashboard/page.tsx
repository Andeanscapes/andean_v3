import BookingTab from "@/components/Dashboard/BookingTab";
import DashboardTab from "@/components/Dashboard/DashboardTab";
import ProfileTab from "@/components/Dashboard/ProfileTab";
import SettingsTab from "@/components/Dashboard/SettingsTab";
import { Metadata } from "next";
import Link from "next/link";

const tabs = [
  {
    id: '1',
    tabName: 'Dashboard',
    LinkString: 'dashboard'
  },
  {
    id: '2',
    tabName: 'My Booking',
    LinkString: 'booking'
  },
  {
    id: '3',
    tabName: 'My Profile',
    LinkString: 'profile'
  },
  {
    id: '4',
    tabName: 'Settings',
    LinkString: 'settings'
  },
]

export const metadata: Metadata = {
  title: 'Dashboard | Arid - Travel & Tourism HTML/Tailwind CSS Template',
  description: 'Welcome, Arid - Travel & Tourism HTML/Tailwind CSS Template',
  keywords: ['tour', 'travel', 'booking', 'rental', 'nextJs', 'tailwind', 'trip', 'beach', 'holidy', 'cruise', 'vacation' ]
}

const Dashboard = (
  { searchParams}:
    {
      searchParams: { [key: string]: string | string[] | undefined }
    }
) => {
  const selectedTab = (searchParams.tab || 'dashboard') as string;
  return (
    <div className="lg:pt-20 pt-14 lg:pb-[10px] max-w-[1570px] mx-auto px-3">
      <div className="lg:grid lg:grid-cols-12 gap-[30px]">
        <div className="col-span-2 pb-4">
          <ul className="border border-primary-1 border-opacity-20 lg:block flex flex-wrap">
            {tabs?.map((item) => (
              <li key={item.id}>
                <Link
                  href={
                    `?${new URLSearchParams({
                      tab: item.LinkString
                    })}`
                  }
                  className={
                    selectedTab === item.LinkString ? 'ds__link active__ds' : 'ds__link'
                  }>
                  {item.tabName}
                </Link>
              </li>
            ))}
            <li><Link href='/login' className="ds__link">Logout</Link></li>
          </ul>
        </div>
        
        <div className="col-span-10">
            { selectedTab === 'dashboard' ? 
              <DashboardTab/> : null
            }
            { selectedTab === 'booking' ? 
              <BookingTab/> : null
            }
            { selectedTab === 'profile' ? 
              <ProfileTab/> : null
            }
            { selectedTab === 'settings' ? 
              <SettingsTab/> : null
            }
        </div>
      </div>
    </div>
  )
}

export default Dashboard;