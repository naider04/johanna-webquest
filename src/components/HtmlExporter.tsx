import React, { useState } from 'react';
import { Copy, Check, Download, Code2, AlertCircle } from 'lucide-react';

export default function HtmlExporter() {
  const [copied, setCopied] = useState(false);

  // The actual full, self-contained, commented HTML template
  const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Moon Exploration WebQuest Template</title>
  <!-- Google Fonts: Playfair Display for Serifs, Inter for UI -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
  
  <style>
    /* ----------------------------------------------------
       CLASSROOM THEME & COLORS
       Soft Blue, Dark Blue, Gray, and White.
       Educational, clean, high-contrast, paper-like.
       ---------------------------------------------------- */
    :root {
      --color-bg: #f8fafc;        /* Soft light paper background */
      --color-primary: #0f172a;   /* Dark Blue / Slate 900 for text & major headers */
      --color-accent: #2563eb;    /* Royal Blue 600 for buttons, links & focus */
      --color-accent-light: #eff6ff; /* Soft Blue 50 for highlighted background boxes */
      --color-accent-dark: #1e40af;  /* Darker Blue for hover */
      --color-border: #cbd5e1;    /* Slate 300 for clean divisions */
      --color-card-bg: #ffffff;   /* Pure White for student cards */
      --color-text-body: #334155; /* Slate 700 for readable paragraphs */
      --color-text-muted: #64748b;/* Slate 500 for captions and hints */
      --color-highlight: #fef3c7; /* Amber 100 for high-importance callouts */
      --color-highlight-border: #f59e0b; /* Amber 500 for border */
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background-color: var(--color-bg);
      color: var(--color-text-body);
      line-height: 1.6;
      font-size: 16px;
    }

    /* Traditional Classroom Headers */
    h1, h2, h3, h4, .font-serif {
      font-family: 'Playfair Display', Georgia, serif;
      color: var(--color-primary);
    }

    /* ----------------------------------------------------
       LAYOUT CONTAINERS
       ---------------------------------------------------- */
    .container {
      max-width: 960px;
      margin: 0 auto;
      padding: 24px 16px;
    }

    /* ----------------------------------------------------
       CLASSROOM LOGBOOK HEADER
       Placeholders: Title, Name, Teacher, Subject, Date
       ---------------------------------------------------- */
    .webquest-header {
      background-color: var(--color-primary);
      color: #ffffff;
      border-bottom: 5px solid var(--color-accent);
      padding: 32px 16px;
      text-align: center;
      position: relative;
    }

    /* Subtle Celestial Decoration */
    .webquest-header::before {
      content: "•  .  o  .  •  .  o  .  •";
      display: block;
      color: rgba(255, 255, 255, 0.2);
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      letter-spacing: 6px;
      margin-bottom: 12px;
    }

    .webquest-title {
      font-size: 32px;
      font-weight: 700;
      color: #eff6ff;
      letter-spacing: 0.5px;
    }

    .webquest-subtitle {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #94a3b8;
      margin-top: 6px;
      font-weight: 600;
    }

    /* Student Notebook Fields Box */
    .student-fields-grid {
      background-color: var(--color-card-bg);
      border-bottom: 1px solid var(--color-border);
      padding: 16px;
    }

    .fields-container {
      max-width: 960px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
    }

    .field-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--color-text-muted);
      letter-spacing: 1px;
      margin-bottom: 4px;
    }

    .field-value {
      font-family: 'Playfair Display', serif;
      font-size: 14px;
      font-weight: 600;
      color: var(--color-primary);
      border-bottom: 2px dashed var(--color-border);
      padding: 4px 0;
    }

    /* ----------------------------------------------------
       STICKY MULTI-PAGE NAVIGATION
       ---------------------------------------------------- */
    .sticky-nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background-color: #ffffff;
      border-b: 1px solid var(--color-border);
      box-shadow: 0 2px 4px rgba(0,0,0,0.04);
    }

    .nav-container {
      max-width: 960px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
      overflow-x: auto;
    }

    .nav-tabs {
      display: flex;
      gap: 4px;
    }

    .nav-tab {
      background: none;
      border: none;
      border-bottom: 3px solid transparent;
      padding: 14px 16px;
      font-size: 13px;
      font-weight: 700;
      color: var(--color-text-muted);
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .nav-tab:hover {
      color: var(--color-primary);
      background-color: #f1f5f9;
    }

    .nav-tab.active {
      color: var(--color-accent);
      border-bottom-color: var(--color-accent);
      background-color: var(--color-accent-light);
    }

    /* Back/Next Step controller */
    .nav-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav-control-btn {
      background-color: #f1f5f9;
      border: 1px solid var(--color-border);
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 700;
      border-radius: 4px;
      cursor: pointer;
      color: var(--color-text-body);
      transition: all 0.2s;
    }

    .nav-control-btn:hover:not(:disabled) {
      background-color: #e2e8f0;
    }

    .nav-control-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .nav-control-btn.next-btn {
      background-color: var(--color-accent);
      color: #ffffff;
      border-color: var(--color-accent);
    }

    .nav-control-btn.next-btn:hover:not(:disabled) {
      background-color: var(--color-accent-dark);
    }

    /* ----------------------------------------------------
       MULTI-PAGE CONTENT TRANSITIONS
       Each section behaves like its own page.
       ---------------------------------------------------- */
    .webquest-page {
      display: none; /* Hidden by default */
      background-color: var(--color-card-bg);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 24px;
      margin-top: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }

    .webquest-page.active {
      display: block; /* Visible only when active */
    }

    /* ----------------------------------------------------
       COMMON SECTION DIVISIONS
       ---------------------------------------------------- */
    .section-title-area {
      border-b: 2px solid var(--color-accent-light);
      padding-bottom: 12px;
      margin-bottom: 20px;
    }

    .section-headline {
      font-size: 24px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ----------------------------------------------------
       VISUALLY HIGHLIGHTED CALLOUT BOXES
       ---------------------------------------------------- */
    .task-highlight-box {
      background-color: var(--color-highlight);
      border-left: 5px solid var(--color-highlight-border);
      padding: 18px;
      border-radius: 0 8px 8px 0;
      margin: 20px 0;
    }

    .congrats-box {
      background: linear-gradient(135deg, var(--color-primary) 0%, #1e293b 100%);
      color: #ffffff;
      padding: 24px;
      border-radius: 8px;
      text-align: center;
      border: 2px solid var(--color-accent);
      margin: 24px 0;
    }

    .congrats-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 24px;
      font-weight: 700;
      color: #fef08a; /* Soft bright yellow */
      margin-bottom: 8px;
    }

    /* ----------------------------------------------------
       STANDALONE EDUCATION CARDS / ACTIVITIES
       ---------------------------------------------------- */
    .activity-card {
      border: 1px solid var(--color-border);
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 20px;
      background-color: #ffffff;
    }

    .activity-card-header {
      font-size: 18px;
      font-weight: 700;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 8px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ----------------------------------------------------
       EVALUATION RUBRIC TABLE (Traditional & Clean)
       ---------------------------------------------------- */
    .rubric-table-wrapper {
      overflow-x: auto;
      margin: 20px 0;
      border: 1px solid var(--color-border);
      border-radius: 6px;
    }

    .rubric-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 13px;
    }

    .rubric-table th {
      background-color: #f8fafc;
      font-family: 'Playfair Display', serif;
      font-weight: 700;
      padding: 12px;
      border-bottom: 2px solid var(--color-border);
      color: var(--color-primary);
    }

    .rubric-table td {
      padding: 12px;
      border-bottom: 1px solid var(--color-border);
      vertical-align: top;
      color: var(--color-text-body);
    }

    .rubric-table tr:hover {
      background-color: #fafafa;
    }

    .rubric-criteria {
      font-weight: 700;
      color: var(--color-primary);
      font-size: 14px;
    }

    .rubric-desc {
      font-size: 11px;
      color: var(--color-text-muted);
      margin-top: 4px;
    }

    /* ----------------------------------------------------
       PLACEHOLDER BOX SPECIFICATIONS
       Teachers can see where files go.
       ---------------------------------------------------- */
    .teacher-placeholder {
      border: 2px dashed #94a3b8;
      background-color: #f8fafc;
      border-radius: 6px;
      padding: 24px;
      text-align: center;
      margin: 16px 0;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: var(--color-text-muted);
    }

    .teacher-placeholder-label {
      font-weight: 700;
      color: var(--color-primary);
      margin-bottom: 4px;
    }

    /* Responsive adjustments */
    @media (max-w: 640px) {
      .sticky-nav {
        overflow-x: auto;
      }
      .fields-container {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>

  <!-- ----------------------------------------------------
       CLASSROOM HEADER SECTION
       ---------------------------------------------------- -->
  <header class="webquest-header">
    <div class="webquest-title">Moon Explorer WebQuest</div>
    <div class="webquest-subtitle">A Guided Inquiry Scientific Investigation</div>
  </header>

  <!-- ----------------------------------------------------
       STUDENT DATA SHEET BINDER (EDITABLE PLACEHOLDERS)
       ---------------------------------------------------- -->
  <section class="student-fields-grid">
    <div class="fields-container">
      <div class="field-group">
        <span class="field-label">Student Name</span>
        <div class="field-value" contenteditable="true">Name: ______________________</div>
      </div>
      <div class="field-group">
        <span class="field-label">Subject / Class</span>
        <div class="field-value" contenteditable="true">Science 6 - Block ______</div>
      </div>
      <div class="field-group">
        <span class="field-label">Teacher Name</span>
        <div class="field-value" contenteditable="true">Teacher: ____________________</div>
      </div>
      <div class="field-group">
        <span class="field-label">Completion Date</span>
        <div class="field-value" contenteditable="true">Date: _______________________</div>
      </div>
    </div>
  </section>

  <!-- ----------------------------------------------------
       STICKY NAVIGATION MENU (Page/Tab Route Controller)
       ---------------------------------------------------- -->
  <nav class="sticky-nav">
    <div class="nav-container">
      <div class="nav-tabs" id="nav-tabs-container">
        <button class="nav-tab active" onclick="switchPage('title-page')">Cover Page</button>
        <button class="nav-tab" onclick="switchPage('intro-page')">Introduction</button>
        <button class="nav-tab" onclick="switchPage('task-page')">The Task</button>
        <button class="nav-tab" onclick="switchPage('process-page')">Process</button>
        <button class="nav-tab" onclick="switchPage('evaluation-page')">Evaluation</button>
        <button class="nav-tab" onclick="switchPage('conclusion-page')">Conclusion</button>
      </div>

      <div class="nav-controls">
        <button class="nav-control-btn" id="prev-step-btn" onclick="prevStep()" disabled>← Back</button>
        <button class="nav-control-btn next-btn" id="next-step-btn" onclick="nextStep()">Next →</button>
      </div>
    </div>
  </nav>

  <main class="container">

    <!-- ====================================================
         1. TITLE PAGE / COVER SECTION
         ==================================================== -->
    <div id="title-page" class="webquest-page active">
      <div class="section-title-area">
        <h2 class="section-headline">🌑 Welcome Lunar Investigator</h2>
      </div>
      
      <p style="margin-bottom: 16px;">
        Welcome to the Moon Exploration WebQuest. Today you will act as a lunar researcher exploring orbital rotations, planetary tides, and ancient craters.
      </p>

      <div class="teacher-placeholder">
        <div class="teacher-placeholder-label">COVER ILLUSTRATION EMBED</div>
        &lt;!-- TITLE COVER GRAPHIC OR VIDEO --&gt;
        <p style="font-size: 11px; margin-top: 8px;">Insert a high quality graphic showing the Earth-Moon orbit model here.</p>
      </div>

      <p style="margin-top: 16px;">
        Click <strong>"Next"</strong> in the top navigation bar or select <strong>"Introduction"</strong> to launch your scientific mission.
      </p>
    </div>


    <!-- ====================================================
         2. INTRODUCTION SECTION
         ==================================================== -->
    <div id="intro-page" class="webquest-page">
      <div class="section-title-area">
        <h2 class="section-headline">🚀 Introduction</h2>
      </div>

      <!-- INTRODUCTION IMAGE -->
      <div class="teacher-placeholder">
        <div class="teacher-placeholder-label">INTRODUCTION IMAGE PLACEHOLDER</div>
        &lt;!-- INTRODUCTION IMAGE --&gt;
        <p style="font-size: 11px; margin-top: 4px;">Recommended: 3:1 width-to-height header photo of the Lunar landscape.</p>
      </div>

      <!-- INTRODUCTION TEXT -->
      <div class="teacher-placeholder">
        <div class="teacher-placeholder-label">INTRODUCTION TEXT PLACEHOLDER</div>
        &lt;!-- INTRODUCTION TEXT --&gt;
        <p style="font-size: 11px; margin-top: 4px;">Write your lesson introductory hooks here. Keep sentences short, informative, and encouraging.</p>
      </div>

      <!-- INTRODUCTION VIDEO -->
      <div class="teacher-placeholder">
        <div class="teacher-placeholder-label">INTRODUCTION VIDEO EMBED</div>
        &lt;!-- INTRODUCTION VIDEO --&gt;
        <p style="font-size: 11px; margin-top: 4px;">Recommended: YouTube or Vimeo iframe block of Apollo missions or NASA lunar phases.</p>
      </div>
    </div>


    <!-- ====================================================
         3. TASK SECTION
         ==================================================== -->
    <div id="task-page" class="webquest-page">
      <div class="section-title-area">
        <h2 class="section-headline">🎯 The Task</h2>
      </div>

      <!-- TASK HIGHLIGHT BOX -->
      <div class="task-highlight-box">
        <h3 style="font-family: serif; font-size: 18px; margin-bottom: 8px;">🛡️ Your Scientific Mission</h3>
        
        <!-- TASK DESCRIPTION -->
        <div class="teacher-placeholder">
          <div class="teacher-placeholder-label">TASK DESCRIPTION</div>
          &lt;!-- TASK DESCRIPTION --&gt;
          <p style="font-size: 11px; margin-top: 4px;">Define the final student project here. E.g., 'Submit a poster, create a slideshow, or answer the 4 process sheets.'</p>
        </div>
      </div>

      <!-- TASK IMAGE -->
      <div class="teacher-placeholder">
        <div class="teacher-placeholder-label">SUPPORTING TASK IMAGE</div>
        &lt;!-- TASK IMAGE --&gt;
        <p style="font-size: 11px; margin-top: 4px;">Insert a graphic showing a sample student portfolio sheet or printable drawing page here.</p>
      </div>

      <!-- TASK RESOURCES -->
      <div class="teacher-placeholder">
        <div class="teacher-placeholder-label">DOWNLOADABLE LESSON RESOURCES</div>
        &lt;!-- TASK RESOURCES --&gt;
        <p style="font-size: 11px; margin-top: 4px;">Insert links to printable PDFs, orbit grids, or coordinate sheets here.</p>
      </div>
    </div>


    <!-- ====================================================
         4. PROCESS SECTION (LARGEST SECTION - 4 ACTIVITIES)
         ==================================================== -->
    <div id="process-page" class="webquest-page">
      <div class="section-title-area">
        <h2 class="section-headline">⚙️ The Process</h2>
      </div>

      <p style="margin-bottom: 20px;">
        Complete each of the following four inquiry activities. Record your findings in your paper notebook or type directly into your digital template.
      </p>

      <!-- ACTIVITY 1 CARD -->
      <div class="activity-card">
        <div class="activity-card-header">
          <span>🌑</span> Activity 1: The One-Face Mystery
        </div>

        <!-- ACTIVITY 1 INSTRUCTIONS -->
        <div class="teacher-placeholder">
          <div class="teacher-placeholder-label">ACTIVITY 1 INSTRUCTIONS</div>
          &lt;!-- ACTIVITY 1 INSTRUCTIONS --&gt;
          <p style="font-size: 11px; margin-top: 4px;">Explain synchronous rotation here: why the Moon revolves on its axis in the exact same time it takes to orbit Earth.</p>
        </div>

        <!-- EMBED ROTATION.HTML -->
        <div class="teacher-placeholder" style="background-color: #f1f5f9; border-color: #3b82f6;">
          <div class="teacher-placeholder-label">EMBED CODE FOR ROTATION.HTML</div>
          &lt;!-- EMBED ROTATION.HTML --&gt;
          <p style="font-size: 11px; margin-top: 4px;">Insert custom rotation simulator widget code or responsive iframe link here.</p>
        </div>

        <!-- STUDENT EVIDENCE -->
        <div class="teacher-placeholder">
          <div class="teacher-placeholder-label">STUDENT WORK EVIDENCE SUBMISSION</div>
          &lt;!-- STUDENT EVIDENCE --&gt;
          <p style="font-size: 11px; margin-top: 4px;">Provide an area where students can paste an orbit diagram screenshot or write down orbit duration rates.</p>
        </div>
      </div>

      <!-- ACTIVITY 2 CARD -->
      <div class="activity-card">
        <div class="activity-card-header">
          <span>🌗</span> Activity 2: Moon Phases Investigation
        </div>

        <!-- MOON PHASE SIMULATOR LINK -->
        <div class="teacher-placeholder">
          <div class="teacher-placeholder-label">MOON PHASE SIMULATOR LINK</div>
          &lt;!-- MOON PHASE SIMULATOR LINK --&gt;
          <p style="font-size: 11px; margin-top: 4px;">Hyperlink out to external interactive widgets (e.g. PBS, PhET, or Astronomy Education labs).</p>
        </div>

        <!-- MOON PHASE IMAGES -->
        <div class="teacher-placeholder">
          <div class="teacher-placeholder-label">MOON PHASE IMAGES REFERENCE</div>
          &lt;!-- MOON PHASE IMAGES --&gt;
          <p style="font-size: 11px; margin-top: 4px;">Add a clean visual sheet containing photos or vector layouts of the 8 crescent, gibbous, and full phases.</p>
        </div>

        <!-- OREO ACTIVITY -->
        <div class="teacher-placeholder">
          <div class="teacher-placeholder-label">OREO LAB ACTIVITY INSTRUCTIONS</div>
          &lt;!-- OREO ACTIVITY --&gt;
          <p style="font-size: 11px; margin-top: 4px;">Insert instructions for the edible Oreo cookie moon phases laboratory experiment here.</p>
        </div>
      </div>

      <!-- ACTIVITY 3 CARD -->
      <div class="activity-card">
        <div class="activity-card-header">
          <span>🌊</span> Activity 3: Moon's Effects on Earth
        </div>

        <!-- ECLIPSE RESOURCES -->
        <div class="teacher-placeholder">
          <div class="teacher-placeholder-label">ECLIPSE READING RESOURCES</div>
          &lt;!-- ECLIPSE RESOURCES --&gt;
          <p style="font-size: 11px; margin-top: 4px;">Provide scientific readings explaining solar and lunar eclipse alignments.</p>
        </div>

        <!-- TIDES RESOURCES -->
        <div class="teacher-placeholder">
          <div class="teacher-placeholder-label">TIDES PHYSICS REFERENCE</div>
          &lt;!-- TIDES RESOURCES --&gt;
          <p style="font-size: 11px; margin-top: 4px;">Add educational logs demonstrating the pull of ocean water relative to lunar orbit alignment.</p>
        </div>

        <!-- DIAGRAM CREATOR EMBED -->
        <div class="teacher-placeholder" style="background-color: #f1f5f9; border-color: #3b82f6;">
          <div class="teacher-placeholder-label">EMBED DIAGRAM SKETCHPAD WIDGET</div>
          &lt;!-- DIAGRAM CREATOR EMBED --&gt;
          <p style="font-size: 11px; margin-top: 4px;">Embed an active sketchboard or collaborative whiteboard iframe code here.</p>
        </div>
      </div>

      <!-- ACTIVITY 4 CARD -->
      <div class="activity-card">
        <div class="activity-card-header">
          <span>📝</span> Activity 4: Reflection
        </div>

        <!-- APOLLO VIDEO -->
        <div class="teacher-placeholder">
          <div class="teacher-placeholder-label">HISTORICAL APOLLO VIDEO PLAYLIST</div>
          &lt;!-- APOLLO VIDEO --&gt;
          <p style="font-size: 11px; margin-top: 4px;">Link or embed documentary recordings of lunar exploration history.</p>
        </div>

        <!-- REFLECTION QUESTION -->
        <div class="teacher-placeholder">
          <div class="teacher-placeholder-label font-bold">STUDENT WRITTEN REFLECTION PROMPT</div>
          &lt;!-- REFLECTION QUESTION --&gt;
          <p style="font-size: 11px; margin-top: 4px;">Add your closing thinking prompts or reflection questions here.</p>
        </div>
      </div>
    </div>


    <!-- ====================================================
         5. EVALUATION SECTION (RUBRIC TABLE)
         ==================================================== -->
    <div id="evaluation-page" class="webquest-page">
      <div class="section-title-area">
        <h2 class="section-headline">🏆 Grading Rubric</h2>
      </div>

      <p style="margin-bottom: 16px;">
        Your performance in this WebQuest will be evaluated based on the criteria in the table below. Make sure to review this carefully before submitting your scientific logbook!
      </p>

      <div class="rubric-table-wrapper">
        <table class="rubric-table">
          <thead>
            <tr>
              <th>Criteria</th>
              <th style="color: #047857;">Excellent</th>
              <th style="color: #1d4ed8;">Good</th>
              <th style="color: #b45309;">Needs Improvement</th>
            </tr>
          </thead>
          <tbody>
            <!-- Editable Rubric Row 1 -->
            <tr>
              <td class="rubric-criteria">
                Participation
                <div class="rubric-desc">Engagement with the orbital activities.</div>
              </td>
              <td>Active engagement, asked insightful questions. Completed all simulators.</td>
              <td>Participated in activities but did not complete all rotation slides.</td>
              <td>Unfocused during simulators; did not complete required activities.</td>
            </tr>
            <!-- Editable Rubric Row 2 -->
            <tr>
              <td class="rubric-criteria">
                Evidence Collection
                <div class="rubric-desc">Quality of orbital diagrams and screenshot uploads.</div>
              </td>
              <td>Screenshots are clear and accurate. Highly descriptive labels.</td>
              <td>Screenshots present but missing axis or orbital markers.</td>
              <td>No screenshots or drawings submitted, or work is incorrect.</td>
            </tr>
            <!-- Editable Rubric Row 3 -->
            <tr>
              <td class="rubric-criteria">
                Scientific Understanding
                <div class="rubric-desc">Knowledge of phases, tides, and alignment.</div>
              </td>
              <td>Accurately explained phase sequences, gravity forces, and eclipses.</td>
              <td>Showed good knowledge but confused lunar vs solar eclipse alignments.</td>
              <td>Major misconceptions about moon gravity, cycles, and tides.</td>
            </tr>
            <!-- Editable Rubric Row 4 -->
            <tr>
              <td class="rubric-criteria">
                Reflection
                <div class="rubric-desc">Quality of written analytical answers.</div>
              </td>
              <td>Thoughtful, deep, and tied directly to simulator experiences.</td>
              <td>Completed reflections but lacks comprehensive analysis.</td>
              <td>Response is extremely brief or skipped completely.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>


    <!-- ====================================================
         6. CONCLUSION SECTION
         ==================================================== -->
    <div id="conclusion-page" class="webquest-page">
      <div class="section-title-area">
        <h2 class="section-headline">🎉 Conclusion</h2>
      </div>

      <p style="margin-bottom: 16px;">
        Great job, Scientist! You have successfully completed your mission. Reflect on your key findings and get ready for your classroom presentation.
      </p>

      <!-- CONGRATULATIONS LUNAR EXPLORER HIGHLIGHT BOX -->
      <div class="congrats-box">
        <div class="congrats-title">Congratulations, Lunar Explorer!</div>
        <p style="font-size: 14px; opacity: 0.95;">
          You have mastered synchronous orbital mechanics, phase rotations, and tidal gravity. Mission accomplished!
        </p>
      </div>

      <p>
        Make sure to show your final workbook page, screenshots, and reflective essays to your teacher to claim your Junior Astronomer badge.
      </p>
    </div>

  </main>

  <!-- ----------------------------------------------------
       ROUTING ENGINE SCRIPT
       Implements a true multi-page user experience natively!
       ---------------------------------------------------- -->
  <script>
    // List of page IDs in structural sequence
    const pagesList = [
      'title-page',
      'intro-page',
      'task-page',
      'process-page',
      'evaluation-page',
      'conclusion-page'
    ];

    let activePageIndex = 0;

    function switchPage(pageId) {
      // 1. Hide all pages
      pagesList.forEach(id => {
        document.getElementById(id).classList.remove('active');
      });

      // 2. Show active page
      document.getElementById(pageId).classList.add('active');

      // 3. Update active index
      activePageIndex = pagesList.indexOf(pageId);

      // 4. Update Navigation tab buttons style
      const tabButtons = document.querySelectorAll('.nav-tab');
      tabButtons.forEach((btn, idx) => {
        if (idx === activePageIndex) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      // 5. Update Back / Next controls disabled state
      document.getElementById('prev-step-btn').disabled = (activePageIndex === 0);
      document.getElementById('next-step-btn').disabled = (activePageIndex === pagesList.length - 1);

      // 6. Scroll window to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function prevStep() {
      if (activePageIndex > 0) {
        switchPage(pagesList[activePageIndex - 1]);
      }
    }

    function nextStep() {
      if (activePageIndex < pagesList.length - 1) {
        switchPage(pagesList[activePageIndex + 1]);
      }
    }
  </script>
</body>
</html>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(htmlTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    const blob = new Blob([htmlTemplate], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'moon_exploration_webquest_template.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      
      {/* Title block */}
      <div className="border-b-2 border-blue-100 pb-4 mb-6">
        <h2 className="font-serif text-3xl font-bold text-slate-800 flex items-center gap-2">
          <span>🛠️</span> Standalone HTML Template Exporter
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Export or download the clean single-file HTML version containing embedded CSS, JS page routes, and code comments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Info Column */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-slate-100 p-5 rounded-lg border border-slate-200">
            <h4 className="font-serif text-sm font-bold text-slate-800 mb-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-blue-600" /> WebQuest File Info
            </h4>
            <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <li>
                <span className="font-semibold text-slate-700">Type:</span> Single File (.html)
              </li>
              <li>
                <span className="font-semibold text-slate-700">Architecture:</span> Dynamic JS Navigation Tabs (Acts as a multi-page app out of the box)
              </li>
              <li>
                <span className="font-semibold text-slate-700">Styling:</span> Standard Embedded CSS Variables
              </li>
              <li>
                <span className="font-semibold text-slate-700">Responsiveness:</span> Desktop, Chromebook, & Mobile
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <button
              id="btn-copy-template-code"
              onClick={copyToClipboard}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow transition-colors focus:outline-none"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Copied Template!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy HTML Code
                </>
              )}
            </button>

            <button
              id="btn-download-template-file"
              onClick={downloadFile}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow transition-colors focus:outline-none"
            >
              <Download className="w-4 h-4" /> Download HTML File
            </button>
          </div>
        </div>

        {/* Code Preview Column */}
        <div className="md:col-span-2">
          <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="bg-slate-800 px-4 py-2 flex items-center justify-between text-slate-300">
              <span className="font-mono text-xs text-blue-400 font-semibold flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5" /> moon_webquest_template.html
              </span>
              <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300 uppercase font-bold tracking-wider">
                Full Template Code
              </span>
            </div>
            
            <pre className="bg-slate-950 p-4 font-mono text-[10px] md:text-xs text-slate-300 overflow-y-auto h-96 select-all scrollbar-thin">
              <code>{htmlTemplate}</code>
            </pre>
          </div>
        </div>

      </div>

    </div>
  );
}
