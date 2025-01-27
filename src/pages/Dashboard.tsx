import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { FileText, Clock, Share2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { MedicalDocument } from '../types';

function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalDocuments: 0,
    recentUploads: 0,
    activeShares: 0,
    expiringSoon: 0
  });
  const [recentActivity, setRecentActivity] = useState<MedicalDocument[]>([]);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchRecentActivity();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Get total documents
      const { data: documents, error: docError } = await supabase
        .from('documents')
        .select('id, created_at')
        .eq('user_id', user.id);

      if (docError) throw docError;

      // Get recent uploads (last 7 days)
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 7);
      const recentUploads = documents?.filter(doc => 
        new Date(doc.created_at) > recentDate
      ).length || 0;

      // Get active shares
      const { data: shares, error: shareError } = await supabase
        .from('shared_links')
        .select('id, expires_at')
        .eq('created_by', user.id)
        .gt('expires_at', new Date().toISOString());

      if (shareError) throw shareError;

      // Get expiring shares (next 24 hours)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const expiringSoon = shares?.filter(share => 
        new Date(share.expires_at) < tomorrow
      ).length || 0;

      setStats({
        totalDocuments: documents?.length || 0,
        recentUploads,
        activeShares: shares?.length || 0,
        expiringSoon
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentActivity = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentActivity(data || []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.full_name}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and access your medical documents securely
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Documents
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalDocuments}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Recent Uploads
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.recentUploads}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Share2 className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Shares
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.activeShares}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Expiring Soon
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.expiringSoon}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Activity
          </h3>
          <div className="mt-4">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500">No recent activity to display.</p>
            ) : (
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {recentActivity.map((doc) => (
                    <li key={doc.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <FileText className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {doc.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;