"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Switch } from "@/components/ui/switch"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme, theme, systemTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark')

  const toggleTheme = (checked: boolean) => {
    if (checked) {
      setTheme("dark")
    } else {
      setTheme("light")
    }
  }

  return (
    <DropdownMenuItem className="flex items-center justify-between px-2 py-1.5 focus:bg-accent focus:text-accent-foreground cursor-pointer" onSelect={(e) => e.preventDefault()}>
      <div className="flex items-center gap-2" onClick={() => toggleTheme(!isDark)}>
        <Sun className="mr-2 size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute mr-2 size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span>Dark mode</span>
      </div>
      <Switch
        checked={isDark}
        onCheckedChange={toggleTheme}
      />
    </DropdownMenuItem>
  )
}
