import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Check, Edit3 } from 'lucide-react';
import API from '../../api/axios';

const AdminRolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [rolePermissions, setRolePermissions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [rolesRes, permRes] = await Promise.all([
      API.get('/roles'),
      API.get('/roles/permissions'),
    ]);
    if (rolesRes.success) setRoles(rolesRes.data || []);
    if (permRes.success) setPermissions(permRes.data || []);
  };

  const handleEditPermissions = (role) => {
    setSelectedRole(role);
    setRolePermissions(role.permissions || []);
    setModalOpen(true);
  };

  const togglePermission = (slug) => {
    setRolePermissions((prev) =>
      prev.includes(slug) ? prev.filter((p) => p !== slug) : [...prev, slug]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    try {
      await API.put(`/roles/${selectedRole._id}`, { permissions: rolePermissions });
      setModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900">Role-Based Access Control (RBAC)</h1>
        <p className="text-xs text-slate-500">Configure granular permission sets enforced at backend API middleware boundary.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roles.map((r) => (
          <div key={r._id} className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <span className="font-mono text-xs font-extrabold uppercase text-gentora-gold bg-gentora-dark px-2.5 py-1 rounded">
                  {r.name}
                </span>
                <p className="text-xs text-slate-500 mt-2">{r.description}</p>
              </div>
              {r.slug !== 'super_admin' && (
                <button onClick={() => handleEditPermissions(r)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border flex items-center gap-1">
                  <Edit3 className="w-3.5 h-3.5" /> Edit Permissions
                </button>
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-slate-700 mb-2">Granted Permissions ({r.permissions?.length || 0}):</p>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                {r.slug === 'super_admin' ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                    Full Unrestricted System Access (*)
                  </span>
                ) : r.permissions?.length > 0 ? (
                  r.permissions.map((p) => (
                    <span key={p} className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border">
                      {p}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No admin permissions granted.</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && selectedRole && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <h2 className="font-serif text-lg font-bold text-slate-900">
              Configure Permissions — {selectedRole.name}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
              {permissions.map((p) => {
                const checked = rolePermissions.includes(p.slug);
                return (
                  <label key={p.slug} className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${checked ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePermission(p.slug)}
                      className="mt-0.5 accent-gentora-emerald"
                    />
                    <div>
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-[10px] font-mono text-slate-500">{p.slug}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg font-bold text-xs">Cancel</button>
              <button onClick={handleSavePermissions} className="px-6 py-2 bg-gentora-emerald text-white text-xs font-bold rounded-lg shadow">
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRolesPage;
