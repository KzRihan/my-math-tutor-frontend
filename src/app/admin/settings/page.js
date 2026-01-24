'use client';

import { useState } from 'react';
import { activityLog } from '@/data/admin-data';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'system', label: 'System', icon: '⚙️' },
  { id: 'logs', label: 'Activity Logs', icon: '📋' },
  { id: 'security', label: 'Security', icon: '🔐' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('system');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-foreground-secondary">Configure system and security settings</p>
        </div>
        <button className="btn btn-primary">
          <span>💾</span>
          Save All Changes
        </button>
      </div>

      {/* Tabs */}
      <div className="glass-card p-1 inline-flex gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
              activeTab === tab.id
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                : 'text-foreground-secondary hover:bg-neutral-100 dark:hover:bg-neutral-800'
            )}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>

        {/* System Settings */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">General Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">App Name</label>
                  <input
                    type="text"
                    defaultValue="MathTutor AI"
                    className="w-full px-4 py-3 text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Support Email</label>
                  <input
                    type="email"
                    defaultValue="support@mathtutor.ai"
                    className="w-full px-4 py-3 text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Default Language</label>
                  <select className="w-full px-4 py-3 text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all">
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Timezone</label>
                  <select className="w-full px-4 py-3 text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all">
                    <option value="UTC">UTC</option>
                    <option value="IST">IST (India)</option>
                    <option value="EST">EST (US East)</option>
                    <option value="PST">PST (US West)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-neutral-300" />
                  <span className="text-sm">Enable email notifications</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-neutral-300" />
                  <span className="text-sm">Allow student registration</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded border-neutral-300" />
                  <span className="text-sm">Maintenance mode</span>
                </label>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">Database & Storage</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                  <p className="text-sm text-foreground-secondary mb-1">Database Size</p>
                  <p className="text-2xl font-bold">2.4 GB</p>
                </div>
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                  <p className="text-sm text-foreground-secondary mb-1">Media Storage</p>
                  <p className="text-2xl font-bold">8.1 GB</p>
                </div>
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                  <p className="text-sm text-foreground-secondary mb-1">Backup Status</p>
                  <p className="text-2xl font-bold text-success">✓ OK</p>
                </div>
              </div>
              <button className="btn btn-secondary mt-4">
                <span>🔄</span>
                Create Backup Now
              </button>
            </div>
          </div>
        )}

        {/* Activity Logs */}
        {activeTab === 'logs' && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">Recent Activity</h3>
              <div className="flex items-center gap-2">
                <select className="px-4 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all">
                  <option value="all">All Types</option>
                  <option value="content">Content Changes</option>
                  <option value="ai">AI Operations</option>
                  <option value="user">User Actions</option>
                </select>
                <button className="btn btn-secondary btn-sm">
                  <span>📥</span>
                  Export
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {[...activityLog, ...activityLog].slice(0, 10).map((activity, index) => (
                <div
                  key={`${activity.id}-${index}`}
                  className={cn(
                    'flex items-start gap-4 pb-4',
                    index !== 9 && 'border-b border-[var(--card-border)]'
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-lg flex-shrink-0">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-foreground-secondary">{activity.user}</span>
                      <span className="text-xs text-foreground-secondary">•</span>
                      <span className="text-xs text-foreground-secondary">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn btn-secondary w-full mt-4">
              Load More
            </button>
          </div>
        )}

        {/* Security */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">Admin Account</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Admin Email</label>
                  <input
                    type="email"
                    defaultValue="admin@mathtutor.ai"
                    className="w-full px-4 py-3 text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Change Password</label>
                  <button className="btn btn-secondary">
                    <span>🔑</span>
                    Change Password
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded border-neutral-300" />
                  <div>
                    <span className="text-sm font-medium">Enable Two-Factor Authentication</span>
                    <p className="text-xs text-foreground-secondary">Add extra security to your admin account</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">Recent Login Activity</h3>
              <div className="space-y-3">
                {[
                  { ip: '192.168.1.1', device: 'Chrome on Windows', time: '2025-12-24 16:30', success: true },
                  { ip: '192.168.1.1', device: 'Chrome on Windows', time: '2025-12-24 10:15', success: true },
                  { ip: '10.0.0.50', device: 'Firefox on Mac', time: '2025-12-23 22:00', success: false },
                  { ip: '192.168.1.1', device: 'Chrome on Windows', time: '2025-12-23 09:00', success: true },
                ].map((login, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                    <div>
                      <p className="font-medium text-sm">{login.device}</p>
                      <p className="text-xs text-foreground-secondary">IP: {login.ip} · {login.time}</p>
                    </div>
                    <span className={cn(
                      'text-xs font-medium px-2 py-1 rounded-full',
                      login.success ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                    )}>
                      {login.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 border-error/50">
              <h3 className="font-semibold mb-4 text-error">Danger Zone</h3>
              <p className="text-sm text-foreground-secondary mb-4">
                These actions are irreversible. Please be certain.
              </p>
              <div className="space-y-3">
                <button className="btn btn-secondary text-error hover:bg-error/10">
                  <span>🗑️</span>
                  Delete All Generated Content
                </button>
                <button className="btn btn-secondary text-error hover:bg-error/10">
                  <span>🔄</span>
                  Reset All Student Progress
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
