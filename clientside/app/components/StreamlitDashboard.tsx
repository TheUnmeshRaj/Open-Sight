"use client";

import React from "react";

interface StreamlitDashboardProps {
  title?: string;
  subtitle?: string;
}

const StreamlitDashboard: React.FC<StreamlitDashboardProps> = ({
  title = "Advanced Analytics Dashboard",
  subtitle = "Interactive visualizations and predictions"
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8 animate-fade-in hover:shadow-2xl transition-all duration-500">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
          {title}
        </h2>
        <p className="text-slate-600 text-sm mt-2">
          {subtitle}
        </p>
      </div>
      
      <div className="rounded-lg overflow-hidden border border-slate-200 shadow-sm">
        <iframe
          src="https://open-sight-3swikarspfhr9yyjimecnr.streamlit.app/?embed=true"
          width="100%"
          height={800}
          style={{ border: "none" }}
          title="OpenSight Analytics Dashboard"
        />
      </div>
    </div>
  );
};

export default StreamlitDashboard;
