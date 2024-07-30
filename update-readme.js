const fs = require('fs');
const fetch = require('node-fetch');

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
const FIRESTORE_COLLECTION = 'commit-summary';

const svgMessage = `
<svg width="600" height="150" xmlns="http://www.w3.org/2000/svg">
  <style>
    @font-face {
      font-family: 'EB Garamond';
      src: url('../fonts/EBGaramond-Regular.woff') format('woff');
    }
    .title {
      font-family: 'EB Garamond', serif;
      font-size: 24px;
      fill: #333;
    }
    .subtitle {
      font-family: 'EB Garamond', serif;
      font-size: 16px;
      fill: #666;
    }
  </style>
  <rect width="600" height="150" fill="#f0f4f8" stroke="#d1dce5" stroke-width="1"/>
  <text x="20" y="35" class="title">Weekly Summary</text>
  <text x="20" y="75" class="subtitle">
    
  </text>
</svg>
`;

async function fetchCommitSummary() {
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${FIRESTORE_COLLECTION}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FIREBASE_API_KEY}`
    }
  });
  const data = await response.json();
  return data.documents.map(doc => doc.fields);
}

async function updateReadme() {
  const commitSummary = await fetchCommitSummary();

  const summarySection = commitSummary.map(commit => `- ${commit.created_at.stringValue}: ${commit.summary.stringValue}`).join('\n');

  let readmeContent = fs.readFileSync('README.md', 'utf-8');
  const updatedContent = readmeContent.replace(
    /<!-- COMMIT_SUMMARY_START -->([\s\S]*?)<!-- COMMIT_SUMMARY_END -->/,
    `<!-- COMMIT_SUMMARY_START -->\n${svgMessage}\n\n${summarySection}\n<!-- COMMIT_SUMMARY_END -->`
  );

  fs.writeFileSync('README.md', updatedContent);
}

updateReadme();
