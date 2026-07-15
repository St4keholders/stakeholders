'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'

interface BotonEliminarProps {
  id: string
  action: (id: string) => Promise<{ ok: boolean, error?: string }>
  confirmMessage?: string
}

export function BotonEliminar({ id, action, confirmMessage = '¿Estás seguro de que deseas eliminar este registro?' }: BotonEliminarProps) {
  const [isPending, setIsPending] = useState(false)

  const handleEliminar = async () => {
    if (!window.confirm(confirmMessage)) return
    setIsPending(true)
    try {
      const res = await action(id)
      if (!res.ok) {
        alert(res.error || 'Ocurrió un error al eliminar')
      }
    } catch (err) {
      console.error(err)
      alert('Error de red al intentar eliminar')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <button
      onClick={handleEliminar}
      disabled={isPending}
      className="text-red-400 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors ml-2 inline-flex items-center justify-center disabled:opacity-50"
      title="Eliminar"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  )
}
