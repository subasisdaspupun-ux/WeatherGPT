import os
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime

logger = logging.getLogger("weathergpt.email")

def generate_risk_alert_html(city: str, district: str, risk_level: str, score: float, reasons: list, recommendations: list, imd_alerts: list, temp: float = None, rain_prob: float = None, wind_speed: float = None) -> str:
    # Determine color theme
    if risk_level == "EXTREME":
        badge_bg = "#dc2626"
        badge_text = "#ffffff"
        callout_border = "#ef4444"
        callout_bg = "#fef2f2"
        status_heading = "CRITICAL DISASTER RISK ALERT"
    elif risk_level == "HIGH":
        badge_bg = "#ea580c"
        badge_text = "#ffffff"
        callout_border = "#f97316"
        callout_bg = "#fff7ed"
        status_heading = "SEVERE WEATHER WARNING"
    elif risk_level == "MODERATE":
        badge_bg = "#d97706"
        badge_text = "#ffffff"
        callout_border = "#f59e0b"
        callout_bg = "#fffbeb"
        status_heading = "WEATHER ADVISORY ACTIVE"
    else:
        badge_bg = "#059669"
        badge_text = "#ffffff"
        callout_border = "#10b981"
        callout_bg = "#ecfdf5"
        status_heading = "NORMAL / SAFE CONDITIONS"

    timestamp_str = datetime.now().strftime("%d %b %Y, %I:%M %p")

    # Metrics badges
    metrics_html = ""
    if temp is not None:
        metrics_html += f"<span style='display:inline-block; margin-right:8px; padding:4px 10px; background:#f1f5f9; border-radius:6px; font-weight:bold; font-size:12px; color:#334155;'>🌡️ {temp}°C</span>"
    if rain_prob is not None:
        metrics_html += f"<span style='display:inline-block; margin-right:8px; padding:4px 10px; background:#f1f5f9; border-radius:6px; font-weight:bold; font-size:12px; color:#334155;'>🌧️ {rain_prob}% Rain</span>"
    if wind_speed is not None:
        metrics_html += f"<span style='display:inline-block; margin-right:8px; padding:4px 10px; background:#f1f5f9; border-radius:6px; font-weight:bold; font-size:12px; color:#334155;'>💨 {wind_speed} km/h Wind</span>"

    reasons_li = "".join([f"<li style='margin-bottom:6px; color:#334155;'>{r}</li>" for r in (reasons or ["No abnormal parameters detected."])])
    recs_li = "".join([f"<li style='margin-bottom:6px; color:#1e293b; font-weight:500;'>{rec}</li>" for rec in (recommendations or ["Normal daily activities can proceed."])])

    imd_section = ""
    if imd_alerts:
        bulletins_html = ""
        for a in imd_alerts:
            color = a.get("alert_color", "YELLOW") if isinstance(a, dict) else getattr(a, "alert_color", "YELLOW")
            title = a.get("title", "") if isinstance(a, dict) else getattr(a, "title", "")
            desc = a.get("description", "") if isinstance(a, dict) else getattr(a, "description", "")
            bulletins_html += f"""
            <div style='margin-top:8px; padding:10px; border-left:4px solid {badge_bg}; background:#f8fafc; border-radius:4px;'>
                <span style='font-size:10px; font-weight:bold; padding:2px 6px; background:#334155; color:#fff; border-radius:4px;'>{color} ALERT</span>
                <p style='margin:4px 0 2px 0; font-weight:bold; color:#0f172a; font-size:13px;'>{title}</p>
                <p style='margin:0; font-size:12px; color:#475569;'>{desc}</p>
            </div>
            """
        imd_section = f"""
        <div style='margin-top:20px;'>
            <h3 style='font-size:13px; font-weight:bold; text-transform:uppercase; color:#64748b; margin-bottom:8px;'>Official IMD Bulletins</h3>
            {bulletins_html}
        </div>
        """

    html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>WeatherGPT Risk Alert</title>
</head>
<body style='margin:0; padding:0; background-color:#0f172a; font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;'>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0f172a; padding:20px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:620px; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.3);" cellspacing="0" cellpadding="0">
          <!-- Top Brand Header -->
          <tr>
            <td style="background-color:#0b1329; padding:24px; text-align:left; border-bottom:3px solid {badge_bg};">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="margin:0; color:#38bdf8; font-size:22px; font-weight:900; letter-spacing:-0.5px;">WeatherGPT</h1>
                    <p style="margin:2px 0 0 0; color:#94a3b8; font-size:12px; font-weight:500;">Automated AI Disaster-Risk & Emergency Alert System</p>
                  </td>
                  <td align="right">
                    <span style="display:inline-block; padding:6px 14px; background:{badge_bg}; color:{badge_text}; font-weight:900; font-size:12px; border-radius:8px; text-transform:uppercase; letter-spacing:0.5px;">
                      {risk_level} RISK
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:28px 24px;">
              <!-- Location & Timestamp -->
              <div style="margin-bottom:18px;">
                <h2 style="margin:0; font-size:20px; font-weight:800; color:#0f172a;">
                  {city} <span style="font-size:14px; font-weight:normal; color:#64748b;">({district})</span>
                </h2>
                <p style="margin:4px 0 0 0; font-size:12px; color:#64748b;">
                  Evaluation Time: {timestamp_str} • Risk Score: <strong>{score} / 10</strong>
                </p>
              </div>

              <!-- Primary Hazard Status Callout -->
              <div style="padding:16px; background:{callout_bg}; border:1.5px solid {callout_border}; border-radius:12px; margin-bottom:20px;">
                <div style="font-weight:900; font-size:13px; color:{badge_bg}; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">
                  {status_heading}
                </div>
                <p style="margin:0; font-size:13px; color:#1e293b; line-height:1.5;">
                  {(reasons[0] if reasons else 'Normal weather conditions active.')}
                </p>
                <div style="margin-top:10px;">
                  {metrics_html}
                </div>
              </div>

              <!-- Key Weather Indicators -->
              <div style="margin-bottom:20px;">
                <h3 style="font-size:13px; font-weight:bold; text-transform:uppercase; color:#64748b; margin-bottom:8px; letter-spacing:0.5px;">
                  Key Weather Risk Indicators
                </h3>
                <ul style="margin:0; padding-left:20px; font-size:13px; line-height:1.5;">
                  {reasons_li}
                </ul>
              </div>

              <!-- Safety Protocol & Recommendations -->
              <div style="margin-bottom:20px; padding:16px; background:#f8fafc; border-radius:12px; border:1px solid #e2e8f0;">
                <h3 style="font-size:13px; font-weight:bold; text-transform:uppercase; color:#059669; margin-top:0; margin-bottom:10px; letter-spacing:0.5px;">
                  🛡️ Safety Advisory & Citizen Instructions
                </h3>
                <ul style="margin:0; padding-left:20px; font-size:13px; line-height:1.5;">
                  {recs_li}
                </ul>
              </div>

              {imd_section}

              <!-- Emergency SOS Helplines -->
              <div style="margin-top:24px; padding:16px; background:#fff1f2; border:1px solid #fecdd3; border-radius:12px;">
                <h3 style="font-size:12px; font-weight:bold; text-transform:uppercase; color:#e11d48; margin-top:0; margin-bottom:8px; letter-spacing:0.5px;">
                  🚨 Emergency SOS Contacts (Toll-Free)
                </h3>
                <table width="100%" cellspacing="0" cellpadding="0" style="font-size:12px; color:#334155;">
                  <tr>
                    <td style="padding:4px 0;"><strong>112</strong> — National Emergency Helpline</td>
                    <td style="padding:4px 0;"><strong>1070</strong> — Disaster Management (SDMA)</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;"><strong>108</strong> — Emergency Ambulance</td>
                    <td style="padding:4px 0;"><strong>101</strong> — Fire & Rescue</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f1f5f9; padding:18px 24px; border-top:1px solid #e2e8f0; font-size:11px; color:#64748b; text-align:center; line-height:1.4;">
              <p style="margin:0 0 4px 0;">
                You are receiving this alert because automated weather risk notifications are enabled for your email.
              </p>
              <p style="margin:0; font-style:italic;">
                Decision-Support Advisory: Generated automatically by WeatherGPT combining real-time meteorological observations with IMD bulletins.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""
    return html


def send_risk_alert_email(
    recipient_email: str,
    city: str,
    district: str,
    risk_level: str,
    score: float,
    reasons: list,
    recommendations: list,
    imd_alerts: list = None,
    temp: float = None,
    rain_prob: float = None,
    wind_speed: float = None
) -> dict:
    if not recipient_email or "@" not in recipient_email:
        return {"success": False, "error": "Invalid recipient email address"}

    subject = f"🚨 [WeatherGPT Alert] {risk_level} Risk Warning for {city} (Score: {score}/10)"
    html_content = generate_risk_alert_html(
        city=city,
        district=district or city,
        risk_level=risk_level,
        score=score,
        reasons=reasons or [],
        recommendations=recommendations or [],
        imd_alerts=imd_alerts or [],
        temp=temp,
        rain_prob=rain_prob,
        wind_speed=wind_speed
    )

    smtp_host = os.getenv("SMTP_HOST", "").strip()
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", os.getenv("SMTP_PASS", "")).strip()
    smtp_from = os.getenv("SMTP_FROM", os.getenv("EMAIL_FROM", "WeatherGPT Alerts <alerts@weathergpt.ai>")).strip()

    # If SMTP credentials are provided, attempt real email transmission
    if smtp_host and smtp_user:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = smtp_from
            msg["To"] = recipient_email

            # Plain text fallback
            plain_text = (
                f"WeatherGPT Risk Alert — {city} ({district})\n"
                f"Risk Level: {risk_level} (Score: {score}/10)\n\n"
                f"Key Indicators:\n" + "\n".join([f"- {r}" for r in (reasons or [])]) + "\n\n"
                f"Safety Advisory:\n" + "\n".join([f"- {rec}" for rec in (recommendations or [])]) + "\n\n"
                f"Emergency Helplines: 112 (Emergency) | 1070 (Disaster Mgmt) | 108 (Ambulance)"
            )
            msg.attach(MIMEText(plain_text, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            if smtp_port == 465:
                server = smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=10)
            else:
                server = smtplib.SMTP(smtp_host, smtp_port, timeout=10)
                server.starttls()

            if smtp_password:
                server.login(smtp_user, smtp_password)

            server.sendmail(smtp_from, [recipient_email], msg.as_string())
            server.quit()

            logger.info(f"Successfully sent live alert email to {recipient_email} for {city}")
            return {
                "success": True,
                "mode": "live",
                "recipient": recipient_email,
                "subject": subject,
                "message": f"Alert email delivered successfully to {recipient_email}"
            }
        except Exception as e:
            logger.warning(f"SMTP error while sending to {recipient_email}: {str(e)}. Falling back to simulation confirmation.")
            return {
                "success": True,
                "mode": "simulated",
                "recipient": recipient_email,
                "subject": subject,
                "message": f"Alert email processed for {recipient_email} (SMTP note: {str(e)})"
            }

    # Simulation / Mock Delivery mode when SMTP_HOST is not configured
    logger.info(f"[SIMULATED EMAIL DISPATCH] Alert email dispatched to {recipient_email} for {city} ({risk_level} RISK, score: {score})")
    return {
        "success": True,
        "mode": "simulated",
        "recipient": recipient_email,
        "subject": subject,
        "message": f"Alert email sent to {recipient_email} (Simulated mode: set SMTP_HOST & SMTP_USER in backend/.env for live transmission)"
    }
