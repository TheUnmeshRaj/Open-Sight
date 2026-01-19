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
          src="https://open-sight-3swikarspfhr9yyjimecnr.streamlit.app/?page=home&embed=true"
          width="100%"
          height={800}
          style={{ border: "none" }}
        />
  );
};

export default StreamlitDashboard;
