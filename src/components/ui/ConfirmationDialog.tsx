"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Accept",
  cancelText = "Decline",
  variant = "default",
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-full ${variant === 'destructive' ? 'bg-red-600/10' : 'bg-zinc-800'}`}>
              <AlertCircle className={`w-5 h-5 ${variant === 'destructive' ? 'text-red-600' : 'text-zinc-400'}`} />
            </div>
            <DialogTitle className="text-xl font-bold text-white">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-zinc-400 text-sm leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 flex flex-row gap-3 sm:justify-end">
          <DialogClose render={
            <Button variant="ghost" className="flex-1 sm:flex-none text-zinc-400 hover:text-white hover:bg-zinc-900 border-zinc-800">
              {cancelText}
            </Button>
          } />
          <Button
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
            className={`flex-1 sm:flex-none font-bold ${
              variant === 'destructive' 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-zinc-100 hover:bg-white text-black'
            }`}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
