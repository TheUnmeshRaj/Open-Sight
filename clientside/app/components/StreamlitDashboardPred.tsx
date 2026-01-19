"use client";

import React from "react";

interface StreamlitDashboardPredProps {
  title?: string;
  subtitle?: string;
}

const StreamlitDashboardPred: React.FC<StreamlitDashboardPredProps> = ({
}) => {
  return (
        <iframe
          src="https://open-sight-3swikarspfhr9yyjimecnr.streamlit.app/?page=dashboard&embed=true"
          width="100%"
          height={800}
          style={{ border: "none" }}
        />
  );
};

export default StreamlitDashboardPred;
