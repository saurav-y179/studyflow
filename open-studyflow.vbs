Set WshShell = CreateObject("WScript.Shell")

WshShell.CurrentDirectory = "C:\Users\vlodo\code\web app"

WshShell.Run "cmd /c node_modules\.bin\vite.cmd", 0, False