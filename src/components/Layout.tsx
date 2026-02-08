import React from 'react'
import { Music, History, Library, Settings, LogOut, Menu } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useAuth } from '../hooks/useAuth'
import { cn } from '../lib/utils'

interface LayoutProps {
  children: React.ReactNode
  activeTab: 'composer' | 'library'
  setActiveTab: (tab: 'composer' | 'library') => void
}

export function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const { user, logout } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)

  const navItems = [
    { id: 'composer', label: 'Composer', icon: Music },
    { id: 'library', label: 'My Library', icon: Library },
  ]

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-card border-r transition-all duration-300 flex flex-col",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="h-16 flex items-center px-6 border-b">
          <Music className="w-8 h-8 text-primary shrink-0" />
          {isSidebarOpen && (
            <span className="ml-3 font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Gemini Composer
            </span>
          )}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center px-3 py-3 rounded-lg transition-colors group",
                activeTab === item.id 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", activeTab === item.id ? "" : "group-hover:text-primary")} />
              {isSidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t space-y-2">
          {user && isSidebarOpen && (
            <div className="flex items-center px-2 py-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/20">
                {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium truncate">{user.displayName || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            className={cn("w-full justify-start", !isSidebarOpen && "px-2")}
            onClick={logout}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="ml-3">Logout</span>}
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start md:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 border-b flex items-center justify-between px-8 bg-background/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden md:flex"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">
              {activeTab === 'composer' ? 'AI Composer' : 'Your Collection'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Additional header items could go here */}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
          {children}
        </div>
      </main>
    </div>
  )
}
