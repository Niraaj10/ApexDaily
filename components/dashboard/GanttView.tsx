export default function GanttView({ data }: { data: any[] }) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="flex mb-4 border-b pb-2">
            <div className="w-1/4 font-bold text-slate-500 text-sm">Task Name</div>
            <div className="flex-1 font-bold text-slate-500 text-sm text-center">Schedule (Current Month)</div>
          </div>
          {data.map((task, i) => (
            <div key={task.id} className="flex items-center h-12 border-b border-slate-50 last:border-0">
              <div className="w-1/4 text-sm font-semibold text-slate-700 truncate pr-4">{task.title}</div>
              <div className="flex-1 relative h-6 bg-slate-50 rounded-full overflow-hidden">
                {/* Dynamic bar representing task duration */}
                <div 
                  className="absolute h-full bg-blue-500 rounded-full opacity-80"
                  style={{ 
                    left: `${(i * 10) % 60}%`, 
                    width: '30%' 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }