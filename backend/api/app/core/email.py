"""
SMTP 邮件发送功能
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import Header
from email.utils import formataddr
from typing import Optional
from app.config import settings


def send_verification_code_email(to_email: str, code: str) -> bool:
    """
    发送邮箱验证码邮件
    
    Args:
        to_email: 收件人邮箱
        code: 6位验证码
    
    Returns:
        是否发送成功
    """
    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        return False
    
    try:
        # #region agent debug
        import json
        import os
        log_path = r"c:\Users\mininormi\Desktop\rimsurge\rimsurge-pj\.cursor\debug.log"
        try:
            with open(log_path, "a", encoding="utf-8") as f:
                f.write(json.dumps({
                    "sessionId": "debug-session",
                    "runId": "run1",
                    "hypothesisId": "A",
                    "location": "email.py:27",
                    "message": "Before creating email headers",
                    "data": {
                        "smtp_from_name": settings.SMTP_FROM_NAME,
                        "smtp_from_email": settings.SMTP_FROM_EMAIL,
                        "to_email": to_email
                    },
                    "timestamp": int(__import__("time").time() * 1000)
                }, ensure_ascii=False) + "\n")
        except Exception:
            pass
        # #endregion
        
        # 创建邮件对象
        msg = MIMEMultipart('alternative')
        # 使用 formataddr 和 Header 正确编码包含中文的邮件头
        # Header 对象需要转换为字符串才能用于邮件头
        from_name_header = Header(settings.SMTP_FROM_NAME, 'utf-8')
        msg['From'] = formataddr((str(from_name_header), settings.SMTP_FROM_EMAIL))
        msg['To'] = to_email
        subject_header = Header("RimSurge 邮箱验证码", 'utf-8')
        msg['Subject'] = str(subject_header)
        
        # #region agent debug
        try:
            with open(log_path, "a", encoding="utf-8") as f:
                f.write(json.dumps({
                    "sessionId": "debug-session",
                    "runId": "run1",
                    "hypothesisId": "B",
                    "location": "email.py:35",
                    "message": "After setting email headers",
                    "data": {
                        "from_header_type": str(type(msg['From'])),
                        "subject_header_type": str(type(msg['Subject'])),
                        "from_value": str(msg['From'])[:100] if msg['From'] else None,
                        "subject_value": str(msg['Subject'])[:100] if msg['Subject'] else None
                    },
                    "timestamp": int(__import__("time").time() * 1000)
                }, ensure_ascii=False) + "\n")
        except Exception:
            pass
        # #endregion
        
        # HTML 邮件内容
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f9f9f9;
                }}
                .content {{
                    background-color: white;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }}
                .code-box {{
                    background-color: #f4f4f4;
                    border: 2px dashed #333;
                    padding: 20px;
                    text-align: center;
                    margin: 20px 0;
                    border-radius: 4px;
                }}
                .code {{
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    color: #333;
                    font-family: 'Courier New', monospace;
                }}
                .warning {{
                    color: #e74c3c;
                    font-size: 14px;
                    margin-top: 20px;
                }}
                .footer {{
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    font-size: 12px;
                    color: #999;
                    text-align: center;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="content">
                    <h2>RimSurge 邮箱验证码</h2>
                    <p>您好！</p>
                    <p>您正在注册 RimSurge 账号，请使用以下验证码完成验证：</p>
                    
                    <div class="code-box">
                        <div class="code">{code}</div>
                    </div>
                    
                    <p class="warning">⚠️ 验证码有效期为 5 分钟，请及时使用。</p>
                    <p>如果这不是您的操作，请忽略此邮件。</p>
                    
                    <div class="footer">
                        <p>此邮件由 RimSurge 系统自动发送，请勿回复。</p>
                        <p>© 2024 RimSurge. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        # 纯文本内容（备用）
        text_content = f"""
        RimSurge 邮箱验证码
        
        您好！
        
        您正在注册 RimSurge 账号，请使用以下验证码完成验证：
        
        验证码：{code}
        
        验证码有效期为 5 分钟，请及时使用。
        
        如果这不是您的操作，请忽略此邮件。
        
        ---
        此邮件由 RimSurge 系统自动发送，请勿回复。
        © 2024 RimSurge. All rights reserved.
        """
        
        # 添加文本和 HTML 内容
        part1 = MIMEText(text_content, 'plain', 'utf-8')
        part2 = MIMEText(html_content, 'html', 'utf-8')
        msg.attach(part1)
        msg.attach(part2)
        
        # 发送邮件
        smtp_port = settings.SMTP_PORT or 587
        use_ssl = smtp_port == 465  # 端口 465 使用 SMTP_SSL
        use_tls = smtp_port == 587  # 端口 587 使用 STARTTLS
        
        # #region agent debug
        try:
            with open(log_path, "a", encoding="utf-8") as f:
                f.write(json.dumps({
                    "sessionId": "debug-session",
                    "runId": "run1",
                    "hypothesisId": "C",
                    "location": "email.py:143",
                    "message": "Before sending email",
                    "data": {
                        "smtp_host": settings.SMTP_HOST,
                        "smtp_port": smtp_port,
                        "use_ssl": use_ssl,
                        "use_tls": use_tls
                    },
                    "timestamp": int(__import__("time").time() * 1000)
                }, ensure_ascii=False) + "\n")
        except Exception:
            pass
        # #endregion
        
        # 使用 sendmail 方法代替 send_message，确保编码正确处理
        # sendmail 方法可以更好地处理包含中文的邮件头
        from_email_addr = settings.SMTP_FROM_EMAIL or settings.SMTP_USER
        
        if use_ssl:
            # 使用 SMTP_SSL（端口 465）
            with smtplib.SMTP_SSL(settings.SMTP_HOST, smtp_port) as server:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                # #region agent debug
                try:
                    with open(log_path, "a", encoding="utf-8") as f:
                        f.write(json.dumps({
                            "sessionId": "debug-session",
                            "runId": "run1",
                            "hypothesisId": "D",
                            "location": "email.py:150",
                            "message": "Before sendmail (SMTP_SSL)",
                            "data": {},
                            "timestamp": int(__import__("time").time() * 1000)
                        }, ensure_ascii=False) + "\n")
                except Exception:
                    pass
                # #endregion
                # 使用 sendmail 方法，msg.as_string() 会自动处理编码
                server.sendmail(from_email_addr, [to_email], msg.as_string())
        else:
            # 使用 SMTP + STARTTLS（端口 587）
            with smtplib.SMTP(settings.SMTP_HOST, smtp_port) as server:
                if use_tls:
                    server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                # #region agent debug
                try:
                    with open(log_path, "a", encoding="utf-8") as f:
                        f.write(json.dumps({
                            "sessionId": "debug-session",
                            "runId": "run1",
                            "hypothesisId": "E",
                            "location": "email.py:165",
                            "message": "Before sendmail (SMTP)",
                            "data": {},
                            "timestamp": int(__import__("time").time() * 1000)
                        }, ensure_ascii=False) + "\n")
                except Exception:
                    pass
                # #endregion
                # 使用 sendmail 方法，msg.as_string() 会自动处理编码
                server.sendmail(from_email_addr, [to_email], msg.as_string())
        
        return True
    except Exception as e:
        # #region agent debug
        import traceback
        try:
            with open(log_path, "a", encoding="utf-8") as f:
                f.write(json.dumps({
                    "sessionId": "debug-session",
                    "runId": "run1",
                    "hypothesisId": "F",
                    "location": "email.py:172",
                    "message": "Email send exception",
                    "data": {
                        "error_type": str(type(e).__name__),
                        "error_message": str(e),
                        "traceback": traceback.format_exc()[:500]
                    },
                    "timestamp": int(__import__("time").time() * 1000)
                }, ensure_ascii=False) + "\n")
        except Exception:
            pass
        # #endregion
        print(f"发送邮件失败: {e}")
        return False
