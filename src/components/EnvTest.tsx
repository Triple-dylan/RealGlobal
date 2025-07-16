import React from 'react'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const EnvTest: React.FC = () => {
  const envVars = {
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL,
      key: import.meta.env.VITE_SUPABASE_ANON_KEY
    },
    mapbox: {
      token: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    },
    openai: {
      key: import.meta.env.VITE_OPENAI_API_KEY
    }
  }

  const getStatus = (value: string | undefined) => {
    if (!value) return { status: 'missing', icon: <XCircle className="w-4 h-4 text-red-500" />, text: 'Missing' }
    if (value.includes('your_') || value.includes('fallback')) return { status: 'placeholder', icon: <AlertCircle className="w-4 h-4 text-yellow-500" />, text: 'Placeholder' }
    return { status: 'configured', icon: <CheckCircle className="w-4 h-4 text-green-500" />, text: 'Configured' }
  }

  return (
    <div className="fixed top-4 left-4 z-20 bg-white rounded-lg shadow-lg p-4 max-w-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Environment Status</h3>
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          {getStatus(envVars.supabase.url).icon}
          <span className="text-gray-700">Supabase URL:</span>
          <span className="text-gray-500">{getStatus(envVars.supabase.url).text}</span>
        </div>
        <div className="flex items-center gap-2">
          {getStatus(envVars.supabase.key).icon}
          <span className="text-gray-700">Supabase Key:</span>
          <span className="text-gray-500">{getStatus(envVars.supabase.key).text}</span>
        </div>
        <div className="flex items-center gap-2">
          {getStatus(envVars.mapbox.token).icon}
          <span className="text-gray-700">Mapbox Token:</span>
          <span className="text-gray-500">{getStatus(envVars.mapbox.token).text}</span>
        </div>
        <div className="flex items-center gap-2">
          {getStatus(envVars.openai.key).icon}
          <span className="text-gray-700">OpenAI Key:</span>
          <span className="text-gray-500">{getStatus(envVars.openai.key).text}</span>
        </div>
      </div>
    </div>
  )
}

export default EnvTest 