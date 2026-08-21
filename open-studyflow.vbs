' StudyFlow instant launcher.
' Pure VBScript (no PowerShell) so double-click reaches a running app
' as fast as possible:
'   1. If the app is already running  -> open browser immediately.
'   2. Otherwise start servers hidden -> poll until frontend responds
'      -> open browser. No console flash, no progress window.

Option Explicit

Dim shell, fso, appDir, lockDir, appUrl
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

appDir = fso.GetParentFolderName(WScript.ScriptFullName)
lockDir = appDir & "\.studyflow-lock"
appUrl = "http://localhost:5173"

' ── Probe helper: true if URL answers (any non-server-error status) ──
Function HttpOk(urlToCheck)
    On Error Resume Next
    Dim req
    Set req = CreateObject("MSXML2.XMLHTTP")
    req.open "GET", urlToCheck, False
    req.send
    HttpOk = (Err.Number = 0 And req.status >= 200 And req.status < 500)
    On Error GoTo 0
End Function

Sub OpenBrowser()
    shell.Run Chr(34) & appUrl & Chr(34), 1, False
End Sub

' ── Fast path: already running? Open instantly and exit ────────────
If HttpOk(appUrl & "/") Then
    OpenBrowser
    WScript.Quit 0
End If

' ── Single-instance lock (another launch may be mid-startup) ───────
On Error Resume Next
fso.CreateFolder(lockDir)
If Err.Number <> 0 Then WScript.Quit 0
On Error GoTo 0

' ── Start both servers hidden via dev.js ───────────────────────────
shell.CurrentDirectory = appDir
shell.Run "cmd /c node dev.js", 0, False

' ── Poll until the frontend answers (~120ms granularity) ───────────
Dim i, ready
ready = False
For i = 1 To 375   ' ~45s cap
    If HttpOk(appUrl & "/") Then
        ready = True
        Exit For
    End If
    WScript.Sleep 120
Next

If ready Then
    OpenBrowser
Else
    ' Rare failure path: give feedback instead of silence
    MsgBox "StudyFlow did not start within 45 seconds." & vbCrLf & _
           "Make sure Node.js is installed and no other program" & vbCrLf & _
           "is using port 5173.", vbExclamation, "StudyFlow"
End If

' ── Release lock ───────────────────────────────────────────────────
On Error Resume Next
If fso.FolderExists(lockDir) Then fso.DeleteFolder lockDir, True
On Error GoTo 0
