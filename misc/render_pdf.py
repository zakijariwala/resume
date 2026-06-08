#!/usr/bin/env python3
"""
Render the AI PM resume to PDF using reportlab (pure Python, no system deps).
Content is imported from generate_ai_pm_resume.py so the .docx and .pdf stay
in sync from a single source of truth.

Run:  python3 misc/render_pdf.py public/Mohammad_Zaki_Jariwala_Resume.pdf
"""

import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable,
)
from reportlab.lib.styles import ParagraphStyle

import generate_ai_pm_resume as C  # content module

# ── Fonts (Liberation Sans = Arial-metric, clean & ATS-friendly) ────────────
FDIR = "/usr/share/fonts/truetype/liberation/"
pdfmetrics.registerFont(TTFont("Lib",     FDIR + "LiberationSans-Regular.ttf"))
pdfmetrics.registerFont(TTFont("Lib-B",   FDIR + "LiberationSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Lib-I",   FDIR + "LiberationSans-Italic.ttf"))
pdfmetrics.registerFont(TTFont("Lib-BI",  FDIR + "LiberationSans-BoldItalic.ttf"))
pdfmetrics.registerFontFamily("Lib", normal="Lib", bold="Lib-B", italic="Lib-I", boldItalic="Lib-BI")

ACCENT = HexColor("#1F2A44")
MUTED  = HexColor("#4B5563")
BODY   = HexColor("#1A1A1A")

PAGE_W = 7.5 * inch  # letter minus 0.5" margins

S = {
    "name": ParagraphStyle("name", fontName="Lib-B", fontSize=20, leading=23,
                            textColor=ACCENT, alignment=TA_CENTER, spaceAfter=1),
    "title": ParagraphStyle("title", fontName="Lib", fontSize=12, leading=15,
                             textColor=MUTED, alignment=TA_CENTER, spaceAfter=4),
    "contact": ParagraphStyle("contact", fontName="Lib", fontSize=9, leading=12,
                              textColor=MUTED, alignment=TA_CENTER, spaceAfter=1),
    "section": ParagraphStyle("section", fontName="Lib-B", fontSize=10.5, leading=13,
                              textColor=ACCENT, spaceBefore=9, spaceAfter=2),
    "body": ParagraphStyle("body", fontName="Lib", fontSize=9.3, leading=12.4,
                           textColor=BODY, spaceAfter=2, alignment=TA_LEFT),
    "skill": ParagraphStyle("skill", fontName="Lib", fontSize=9.3, leading=12.6,
                            textColor=BODY, spaceAfter=3),
    "orgL": ParagraphStyle("orgL", fontName="Lib-B", fontSize=10, leading=12.5,
                           textColor=BODY),
    "orgR": ParagraphStyle("orgR", fontName="Lib", fontSize=9, leading=12.5,
                           textColor=MUTED, alignment=TA_RIGHT),
    "sub": ParagraphStyle("sub", fontName="Lib-I", fontSize=9, leading=12,
                          textColor=MUTED, spaceAfter=2),
    "stack": ParagraphStyle("stack", fontName="Lib", fontSize=8.3, leading=11,
                            textColor=MUTED, spaceAfter=2),
    "bullet": ParagraphStyle("bullet", fontName="Lib", fontSize=9.3, leading=12.2,
                             textColor=BODY, leftIndent=12, bulletIndent=2,
                             spaceAfter=2),
}


def esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def heading(flow, text):
    flow.append(Paragraph(esc(text).upper(), S["section"]))
    flow.append(HRFlowable(width="100%", thickness=0.6, color=ACCENT,
                           spaceBefore=1, spaceAfter=4))


def entry_header(flow, left, right):
    t = Table([[Paragraph(esc(left), S["orgL"]), Paragraph(esc(right), S["orgR"])]],
              colWidths=[PAGE_W * 0.70, PAGE_W * 0.30])
    t.setStyle(TableStyle([
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
    ]))
    flow.append(t)


def subline(flow, role, metrics=None):
    txt = "<i>%s</i>" % esc(role)
    if metrics:
        txt += '&nbsp;&nbsp;<font size="8" color="#4B5563">%s</font>' % esc(metrics)
    flow.append(Paragraph(txt, S["sub"]))


def bullets(flow, items):
    for b in items:
        flow.append(Paragraph(esc(b), S["bullet"], bulletText="•"))


def build_pdf(out_path):
    doc = SimpleDocTemplate(
        out_path, pagesize=letter,
        leftMargin=0.5 * inch, rightMargin=0.5 * inch,
        topMargin=0.45 * inch, bottomMargin=0.45 * inch,
        title="Mohammad Zaki Jariwala — Resume",
        author="Mohammad Zaki Jariwala",
    )
    f = []

    # Header
    f.append(Paragraph(esc(C.NAME), S["name"]))
    f.append(Paragraph(esc(C.TITLE), S["title"]))
    for line in C.CONTACT:
        f.append(Paragraph(esc(line), S["contact"]))
    f.append(Spacer(1, 4))

    # Summary
    heading(f, "Professional Summary")
    f.append(Paragraph(esc(C.SUMMARY), S["body"]))

    # Skills
    heading(f, "Core Competencies")
    for cat, items in C.SKILLS:
        f.append(Paragraph("<b>%s:</b>&nbsp;&nbsp;%s" % (esc(cat), esc(items)), S["skill"]))

    # Experience
    heading(f, "Professional Experience")
    for e in C.EXPERIENCE:
        entry_header(f, e["org"], e["date"])
        subline(f, e["role"], e["metrics"])
        bullets(f, e["bullets"])

    # Projects
    heading(f, "Selected Projects")
    for pr in C.PROJECTS:
        entry_header(f, pr["name"], pr["date"])
        subline(f, pr["tag"])
        f.append(Paragraph("Stack: " + esc(pr["stack"]), S["stack"]))
        bullets(f, pr["bullets"])

    # Education & Certifications
    heading(f, "Education & Certifications")
    entry_header(f, C.EDUCATION["degree"], C.EDUCATION["year"])
    f.append(Paragraph("<i>%s</i>" % esc(C.EDUCATION["institution"]), S["sub"]))
    bullets(f, C.CERTS)

    doc.build(f)
    print("Wrote", out_path)


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "Mohammad_Zaki_Jariwala_Resume.pdf"
    build_pdf(out)
