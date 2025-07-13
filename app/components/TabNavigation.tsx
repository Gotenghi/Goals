'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'

interface Tab {
  id: string
  label: string
  icon: React.ReactElement<LucideIcon>
  description?: string
  badge?: string
}

interface TabNavigationProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}) => {
  return (
    <div className={`bg-white border-b border-neutral-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8 overflow-x-auto scrollbar-hide" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  group relative min-w-0 flex-1 overflow-hidden py-4 px-1 text-center text-sm font-medium transition-all duration-200 focus:outline-none
                  ${
                    isActive
                      ? 'text-usso-primary border-b-2 border-usso-primary'
                      : 'text-neutral-500 hover:text-neutral-700 border-b-2 border-transparent hover:border-neutral-300'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className={`transition-colors ${
                    isActive ? 'text-usso-primary' : 'text-neutral-400 group-hover:text-neutral-600'
                  }`}>
                    {tab.icon}
                  </span>
                  <span className="whitespace-nowrap">{tab.label}</span>
                  {tab.badge && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      isActive 
                        ? 'bg-usso-primary/10 text-usso-primary' 
                        : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </div>
                
                {/* 탭 설명 툴팁 */}
                {tab.description && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    {tab.description}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900"></div>
                  </div>
                )}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default TabNavigation 