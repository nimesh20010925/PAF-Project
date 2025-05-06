"use client"

import { XCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"

const typeStyles = {
  success: {
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    bg: "bg-green-100 text-green-800",
  },
  error: {
    icon: <XCircle className="w-5 h-5 text-red-500" />,
    bg: "bg-red-100 text-red-800",
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    bg: "bg-yellow-100 text-yellow-800",
  },
  info: {
    icon: <Info className="w-5 h-5 text-blue-500" />,
    bg: "bg-blue-100 text-blue-800",
  },
}

const Toast = ({ message, type = "info", onClose }) => {
  const style = typeStyles[type] || typeStyles.info

  return (
    <div className={`flex items-center p-3 rounded shadow ${style.bg}`}>
      {style.icon}
      <span className="ml-2">{message}</span>
      <button onClick={onClose} className="ml-auto text-sm font-bold">
        ×
      </button>
    </div>
  )
}

export default Toast
