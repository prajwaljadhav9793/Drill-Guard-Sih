import React, { useState } from 'react';
import { useNWIS } from '../../context/NWISContext';
import { DEMO_USERS } from '../../data/demoData';
import { UserRole } from '../../types/nwis';

const ROLE_PERMISSIONS: Record<
  UserRole,
  {
    description: string;
    canVerifyOCR: boolean;
    canEditEvents: boolean;
    canAcknowledgeAlerts: boolean;
    canConfigureThresholds: boolean;
    canManageSystem: boolean;
  }
> = {
  'Drilling Engineer': {
    description:
      'Primary well planning & real-time decision support role. Full access to offset correlation, parameter comparison, risk review, and alert acknowledgment.',
    canVerifyOCR: true,
    canEditEvents: true,
    canAcknowledgeAlerts: true,
    canConfigureThresholds: true,
    canManageSystem: false,
  },
  Geologist: {
    description:
      'Focused on subsurface stratigraphic tops, pore-pressure transition zones, and geological document verification.',
    canVerifyOCR: true,
    canEditEvents: true,
    canAcknowledgeAlerts: false,
    canConfigureThresholds: false,
    canManageSystem: false,
  },
  'Drilling Supervisor': {
    description:
      'Rig-site DSV / Toolpusher console role. Monitors live telemetry, acknowledges operational alerts, and reviews lessons learned.',
    canVerifyOCR: false,
    canEditEvents: true,
    canAcknowledgeAlerts: true,
    canConfigureThresholds: false,
    canManageSystem: false,
  },
  'Data Analyst': {
    description:
      'Manages WITSML data ingestion pipelines, AI Document Processing & OCR extraction queues, and knowledge indexing.',
    canVerifyOCR: true,
    canEditEvents: true,
    canAcknowledgeAlerts: false,
    canConfigureThresholds: true,
    canManageSystem: false,
  },
  Administrator: {
    description:
      'Full enterprise governance, threshold configuration, user role assignment, and demo environment administration.',
    canVerifyOCR: true,
    canEditEvents: true,
    canAcknowledgeAlerts: true,
    canConfigureThresholds: true,
    canManageSystem: true,
  },
};

export const UserManagementView: React.FC = () => {
  const { currentUser, switchUserRole, updateUserProfile } = useNWIS();

  const [editName, setEditName] = useState(currentUser.name);
  const [editDept, setEditDept] = useState(currentUser.department);
  const [editShift, setEditShift] = useState(currentUser.shift);

  const handleRoleSwitch = (role: UserRole) => {
    switchUserRole(role);
    const matched = DEMO_USERS.find((u) => u.role === role);
    if (matched) {
      setEditName(matched.name);
      setEditDept(matched.department);
      setEditShift(matched.shift);
    }
  };

  const activePerms = ROLE_PERMISSIONS[currentUser.role];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-[#A3E6B8] font-semibold">
            FRONTEND ROLE SIMULATION — NO EXTERNAL AUTHENTICATION REQUIRED
          </div>
          <h1 className="text-xl font-bold text-[#F2F6F0] mt-0.5">
            User Management & Role-Based Access Demonstration
          </h1>
          <p className="text-xs text-[#9BB0A3]">
            Switch instantly between the 5 enterprise drilling roles to inspect role-specific
            permissions and profile settings.
          </p>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-[#A3E6B8]/12 border border-[#A3E6B8]/40 font-mono text-xs text-[#F2F6F0] font-semibold">
          Active Session: {currentUser.name} ({currentUser.role})
        </div>
      </div>

      {/* 5 Quick-Login Demo Role Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {DEMO_USERS.map((user) => {
          const isCurrent = currentUser.role === user.role;
          return (
            <div
              key={user.id}
              onClick={() => handleRoleSwitch(user.role)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                isCurrent
                  ? 'bg-[#A3E6B8]/12 border-[#A3E6B8] shadow-sm'
                  : 'bg-[#12221B] border-[#2B4337] hover:bg-[#162920] hover:border-[#3B5949]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#A3E6B8] font-bold">{user.badgeNumber}</span>
                  {isCurrent && <span className="text-[#4ADE80] font-bold">ACTIVE</span>}
                </div>
                <div className="text-sm font-bold text-[#F2F6F0] mt-1">{user.role}</div>
                <div className="text-xs text-[#F2F6F0] font-medium mt-0.5">{user.name}</div>
                <div className="text-[11px] text-[#9BB0A3] mt-1 line-clamp-2">
                  {user.department}
                </div>
              </div>

              <button
                className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isCurrent
                    ? 'bg-[#A3E6B8] text-[#0E1914]'
                    : 'bg-[#162920] text-[#F2F6F0] border border-[#2B4337] hover:bg-[#A3E6B8]/20'
                }`}
              >
                {isCurrent ? 'Current Active Role' : 'Quick Switch Role'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Role Permissions & Profile Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-[#F2F6F0]">
            Role Capabilities & Governance Matrix — {currentUser.role}
          </h2>
          <p className="text-xs text-[#9BB0A3] leading-relaxed">{activePerms.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
            {[
              { label: 'Verify & Approve OCR Extractions', allowed: activePerms.canVerifyOCR },
              { label: 'Add / Edit Drilling Events in KB', allowed: activePerms.canEditEvents },
              {
                label: 'Acknowledge & Resolve Rig Alerts',
                allowed: activePerms.canAcknowledgeAlerts,
              },
              {
                label: 'Modify Telemetry Alert Thresholds',
                allowed: activePerms.canConfigureThresholds,
              },
              {
                label: 'System & User Role Administration',
                allowed: activePerms.canManageSystem,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="p-3 rounded-xl bg-[#162920] border border-[#2B4337] flex items-center justify-between"
              >
                <span className="text-[#F2F6F0] font-medium">{item.label}</span>
                <span
                  className={`font-mono text-[11px] font-bold ${
                    item.allowed ? 'text-[#4ADE80]' : 'text-[#9BB0A3]'
                  }`}
                >
                  {item.allowed ? 'ENABLED' : 'READ-ONLY'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Editor */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-sm space-y-4 text-xs">
          <h2 className="text-base font-semibold text-[#F2F6F0]">Edit Active User Profile</h2>

          <div>
            <label className="block text-[#9BB0A3] font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-[#162920] text-[#F2F6F0] rounded-lg px-3 py-2 border border-[#2B4337]"
            />
          </div>

          <div>
            <label className="block text-[#9BB0A3] font-medium mb-1">Department / Asset Team</label>
            <input
              type="text"
              value={editDept}
              onChange={(e) => setEditDept(e.target.value)}
              className="w-full bg-[#162920] text-[#F2F6F0] rounded-lg px-3 py-2 border border-[#2B4337]"
            />
          </div>

          <div>
            <label className="block text-[#9BB0A3] font-medium mb-1">Shift Assignment</label>
            <input
              type="text"
              value={editShift}
              onChange={(e) => setEditShift(e.target.value)}
              className="w-full bg-[#162920] text-[#F2F6F0] rounded-lg px-3 py-2 border border-[#2B4337]"
            />
          </div>

          <button
            onClick={() =>
              updateUserProfile({
                name: editName,
                department: editDept,
                shift: editShift,
              })
            }
            className="w-full py-2.5 rounded-xl bg-[#A3E6B8] hover:bg-[#D4DE95] text-[#0E1914] font-semibold text-xs transition-colors shadow-sm"
          >
            Save Profile Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
