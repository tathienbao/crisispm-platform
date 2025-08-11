'use client'

import { useState, useEffect } from 'react'

interface LogEntry {
  timestamp: string
  message: string
  data?: string | null
  url: string
}

export function LogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const storedLogs = localStorage.getItem('crisispm-debug-logs')
    if (storedLogs) {
      setLogs(JSON.parse(storedLogs))
    }
  }, [isVisible])

  const clearLogs = () => {
    localStorage.removeItem('crisispm-debug-logs')
    setLogs([])
  }

  const copyLogs = () => {
    const logText = logs.map(log => {
      const time = new Date(log.timestamp).toLocaleTimeString()
      return `${time} [${log.url}] ${log.message}${log.data ? '\n' + log.data : ''}`
    }).join('\n\n')
    
    navigator.clipboard.writeText(logText).then(() => {
      alert('Logs copied to clipboard!')
    })
  }

  // Only show in development or when debug=true
  if (process.env.NODE_ENV === 'production' && !process.env.DEBUG) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-red-600 text-white px-3 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-red-700"
        title="Toggle Debug Logs"
      >
        DEBUG ({logs.length})
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 w-96 max-h-80 bg-black text-green-400 text-xs font-mono rounded-lg shadow-2xl overflow-hidden">
          <div className="bg-gray-900 px-4 py-2 flex justify-between items-center">
            <span className="text-white font-bold">Debug Console Logs</span>
            <div className="flex gap-2">
              <button
                onClick={copyLogs}
                className="text-blue-400 hover:text-blue-300"
                title="Copy logs to clipboard"
              >
                📋
              </button>
              <button
                onClick={clearLogs}
                className="text-red-400 hover:text-red-300"
                title="Clear logs"
              >
                🗑️
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-64 p-3 space-y-2">
            {logs.map((log, index) => (
              <div key={index} className="border-b border-gray-800 pb-2">
                <div className="text-gray-400 text-xs">
                  {new Date(log.timestamp).toLocaleTimeString()} - {new URL(log.url).pathname}
                </div>
                <div className="text-green-400">{log.message}</div>
                {log.data && (
                  <div className="text-blue-400 pl-2 text-xs whitespace-pre-wrap">
                    {log.data}
                  </div>
                )}
              </div>
            ))}
            
            {logs.length === 0 && (
              <div className="text-gray-500 text-center py-4">
                No debug logs yet. Try logging in to see authentication flow.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}