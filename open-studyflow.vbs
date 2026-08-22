' StudyFlow instant launcher (release)
' Starts the release server (node server.js) hidden, waits for it to respond, then opens the browser.
Option Explicit

Dim shell, fso, appDir, lockDir, appUrl
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

appDir = fso.GetParentFolderName(WScript.ScriptFullName)
lockDir = appDir & "\\.studyflow-lock"
appUrl = "http://localhost:3001"

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

' Fast path: already running? Open and exit
If HttpOk(appUrl & "/") Then
    OpenBrowser
    WScript.Quit 0
End If

' Single-instance lock (another launch may be mid-startup)
On Error Resume Next
fso.CreateFolder(lockDir)
If Err.Number <> 0 Then WScript.Quit 0
On Error GoTo 0

' Start the release server hidden (minimized)
shell.CurrentDirectory = appDir
' Use a minimized CMD window to run node server.js and silence output
shell.Run "cmd /c start ""StudyFlow Server"" /min cmd /c node server.js > nul 2>&1", 0, False

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
    MsgBox "StudyFlow did not start within 45 seconds." & vbCrLf & _
           "Make sure Node.js is installed and no other program" & vbCrLf & _
           "is using port 3001.", vbExclamation, "StudyFlow"
End If

' Release lock
On Error Resume Next
If fso.FolderExists(lockDir) Then fso.DeleteFolder lockDir, True
On Error GoTo 0
