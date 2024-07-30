const fs = require('fs');
const fetch = require('node-fetch');

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
const FIRESTORE_COLLECTION = 'commit-summary';

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
  const updatedContent = readmeContent.replace(/<!-- COMMIT_SUMMARY_START -->([\s\S]*?)<!-- COMMIT_SUMMARY_END -->/, `<!-- COMMIT_SUMMARY_START -->\n${summarySection}\n<!-- COMMIT_SUMMARY_END -->`);

  fs.writeFileSync('README.md', updatedContent);
}

updateReadme();
