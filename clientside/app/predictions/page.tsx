"use client";
import React from "react";
import { Card } from "@/components/ui/card";

export default function Predictions() {
  return (
    <div className='flex flex-col gap-5 w-full h-full p-4'>
        <div className='w-full'>
            <h1 className='text-3xl font-secondary font-bold text-gray-800'>Crime Hotspot Predictions</h1>
            <p className='text-gray-500 font-third'>Interactive 3D model powered by ConvLSTM</p>
        </div>
        
        <Card className="w-full h-[85vh] overflow-hidden border-2 shadow-lg rounded-xl">
            {}
            <iframe 
                src="https://open-sight-rrl7mbsafpyuu7yvoh6ucx.streamlit.app?embed=true"
                width="100%"
                height="100%"
                frameBorder="0"
                className="w-full h-full"
                allowFullScreen
            ></iframe>
        </Card>
    </div>
  );
}
