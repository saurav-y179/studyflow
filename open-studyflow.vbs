' Launches StudyFlow via PowerShell for a smooth startup experience.
' PowerShell provides a progress window that the VBScript popup cannot.

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

appDir = fso.GetParentFolderName(WScript.ScriptFullName)
lockDir = appDir & "\.studyflow-lock"

' ── Single-instance lock ─────────────────────────────────────────────
On Error Resume Next
fso.CreateFolder(lockDir)
If Err.Number <> 0 Then
    On Error GoTo 0
    WScript.Quit 0
End If
On Error GoTo 0

' ── Launch the PowerShell progress window ────────────────────────────
psScript = appDir & "\scripts\launch.ps1"

' Run PowerShell hidden. The PowerShell script itself shows a GUI window.
WshShell.Run "powershell -NoProfile -ExecutionPolicy Bypass -File """ & psScript & """ -VBS", 0, True

' Clean up lock (in case PowerShell exit was unexpected)
On Error Resume Next
If fso.FolderExists(lockDir) Then fso.DeleteFolder lockDir, True
On Error GoTo 0
