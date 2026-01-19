"use client";

import React from "react";

interface StreamlitDashboardProps {
  title?: string;
  subtitle?: string;
}

const StreamlitDashboard: React.FC<StreamlitDashboardProps> = ({
}) => {
  return (
        <iframe
          src="https://open-sight-3swikarspfhr9yyjimecnr.streamlit.app/?embed=true&mode=Cumulative%20Heatmap%20(All%20Data)"
          width="100%"
          height={800}
          style={{ border: "none" }}
        />
  );
};

export default StreamlitDashboard;
