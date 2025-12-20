export default function DashboardPage() {
  return(<div className="min-h-screen bg-gradient from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-6 relative overflow-hidden">
    <div className="pointer-events-none absolute -left-20 -top-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl transform rotate-45" />
    <div className="pointer-events-none absolute -right-48 -bottom-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
    <div className="max-w-md w-full bg-white/6 backdrop-blur-lg border border-white/8 rounded-xl shadow-xl p-8">
      <h1 className="text-xl font-bold text-white">You</h1>
      <p className="text-sm text-slate-200/80 mt-1">If you read this you are gay.</p>
    </div>
  </div>)  
}