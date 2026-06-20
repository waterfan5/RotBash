VERSION 5.00
Begin VB.Form Form1 
   BorderStyle     =   3  'Fixed Dialog
   Caption         =   "Rotx"
   ClientHeight    =   7230
   ClientLeft      =   45
   ClientTop       =   435
   ClientWidth     =   12720
   LinkTopic       =   "Form1"
   MaxButton       =   0   'False
   MinButton       =   0   'False
   ScaleHeight     =   7230
   ScaleWidth      =   12720
   StartUpPosition =   3  'Windows Default
   Begin VB.CommandButton Rev2 
      Caption         =   "Rev"
      Height          =   255
      Left            =   11760
      TabIndex        =   8
      Top             =   1440
      Width           =   735
   End
   Begin VB.CommandButton Command1 
      Caption         =   "Command1"
      Height          =   255
      Left            =   2880
      TabIndex        =   7
      Top             =   120
      Width           =   255
   End
   Begin VB.CommandButton bRev 
      Caption         =   "Rev"
      Height          =   255
      Left            =   3240
      TabIndex        =   6
      Top             =   120
      Width           =   615
   End
   Begin VB.CommandButton cmdGo 
      Caption         =   "Go"
      Height          =   255
      Left            =   11520
      TabIndex        =   5
      Top             =   120
      Width           =   1095
   End
   Begin VB.CheckBox chkAddNumbers 
      Caption         =   "Add Numbers"
      Height          =   255
      Left            =   9720
      TabIndex        =   4
      Top             =   120
      Width           =   2535
   End
   Begin VB.TextBox txtCustom 
      Height          =   285
      Left            =   4080
      TabIndex        =   3
      Text            =   "ABCDEFGHIJKLMNOPQRSTUVWYZ01234567890"
      Top             =   120
      Width           =   5295
   End
   Begin VB.TextBox txtOut 
      BackColor       =   &H8000000F&
      Height          =   5415
      Left            =   120
      Locked          =   -1  'True
      MultiLine       =   -1  'True
      TabIndex        =   2
      Text            =   "Form1.frx":0000
      Top             =   1680
      Width           =   12495
   End
   Begin VB.TextBox txtIn 
      Height          =   855
      Left            =   120
      MultiLine       =   -1  'True
      TabIndex        =   1
      Text            =   "Form1.frx":0006
      Top             =   480
      Width           =   12495
   End
   Begin VB.Label Label1 
      Caption         =   "Input"
      Height          =   255
      Left            =   120
      TabIndex        =   0
      Top             =   120
      Width           =   2655
   End
End
Attribute VB_Name = "Form1"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit

Const FIXEDSTRING = "ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890"

Private Sub bRev_Click()
    txtCustom.Text = StrReverse(txtCustom.Text)
End Sub

Private Sub cmdGo_Click()
    Dim nMax As Integer
    Dim strString As String
    Dim strKey As String
    Dim strOutput As String
    Dim i As Integer
    txtOut.Text = ""
  
    
    If chkAddNumbers.Value = vbChecked Then
        nMax = 35
        strString = txtCustom.Text
    Else
        nMax = 25
        strString = Left(txtCustom.Text, 26)
    End If
    strKey = UCase(strString)
        
    strOutput = RestoreCase(CaesarReplace(UCase(txtIn.Text), FIXEDSTRING, strKey), txtIn.Text)
    txtOut.Text = txtOut.Text & "Rot" & i & "=" & strOutput & vbNewLine
    
    For i = 1 To nMax
        strKey = Mid(strString, i + 1) & Left(strString, i)
        strOutput = RestoreCase(CaesarReplace(UCase(txtIn.Text), FIXEDSTRING, strKey), txtIn.Text)
        txtOut.Text = txtOut.Text & "Rot" & i & "=" & strOutput & vbNewLine
    Next
End Sub

Private Function CaesarReplace(ByVal strIn As String, ByVal strSource As String, ByVal strKey As String) As String
    Dim i As Integer
    Dim l As Integer
    Dim strOutput As String
    
    For i = 1 To Len(strIn)
        l = InStr(1, strSource, Mid(strIn, i, 1))
        If l > 0 Then
            strOutput = strOutput & Mid(strKey, l, 1)
        Else
            strOutput = strOutput & Chr(Asc(Mid(strIn, i, 1)) - 0)
        End If
    Next
    CaesarReplace = strOutput
End Function

Private Function RestoreCase(ByVal strIn As String, ByVal strSource As String) As String
    Dim i As Integer
    Dim strOut As String
    For i = 1 To Len(strIn)
        If Mid(strSource, i, 1) >= "a" And Mid(strSource, i, 1) <= "z" Then
            strOut = strOut & LCase(Mid(strIn, i, 1))
        Else
            strOut = strOut & (Mid(strIn, i, 1))
        End If
    Next
    RestoreCase = strOut
End Function

Private Sub Command1_Click()
    txtCustom.Text = FIXEDSTRING
End Sub

Private Sub Form_Load()
    txtCustom.Text = FIXEDSTRING
End Sub

Private Sub Rev2_Click()
    txtIn.Text = StrReverse(txtIn.Text)
End Sub
