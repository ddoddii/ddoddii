import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import config from './config.js';
import fs from 'fs';

console.log("config loaded : ", config);

const firebaseApp = initializeApp(config.firebaseConfig);
const db = getFirestore(firebaseApp);


const FIRESTORE_COLLECTION = 'commit-summary';

const svgTemplate = (summaryText) => {
  const lines = summaryText.split('\n');
  const lineHeight = 20;
  let textElements = '';

  lines.forEach((line, index) => {
    textElements += `<text x="20" y="${75 + index * lineHeight}" class="content">${line}</text>`;
  });

  return `
    <svg width="600" height="300" xmlns="http://www.w3.org/2000/svg">
      <style>
        @font-face {
          font-family: 'EB Garamond';
          src: url('../fonts/EBGaramond-Regular.woff') format('woff');
        }
        .title {
          font-family: 'EB Garamond', serif;
          font-size: 28px;
          font-weight: bold;
          fill: #333;
        }
        .subtitle {
          font-family: 'EB Garamond', serif;
          font-size: 20px;
          font-weight: bold;
          fill: #666;
        }
        .content {
          font-family: 'EB Garamond', serif;
          font-size: 16px;
          fill: #444;
        }
        .decorative-line {
          stroke: #d1dce5;
          stroke-width: 2;
        }
      </style>
      <rect width="600" height="300" fill="#f8f8f8" stroke="#d1dce5" stroke-width="1"/>
      <text x="20" y="40" class="title">Weekly Summary</text>
      <line x1="20" y1="50" x2="580" y2="50" class="decorative-line" />
      ${textElements}
      <line x1="20" y1="${75 + lines.length * lineHeight + 20}" x2="580" y2="${75 + lines.length * lineHeight + 20}" class="decorative-line" />
    </svg>
  `;
};


function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case '\'': return '&apos;';
          case '"': return '&quot;';
          default: return c;
      }
  });
}


async function fetchCommitSummary() {
  try {
    const commitSummaryCollection = collection(db, FIRESTORE_COLLECTION);
    const commitSummaryQuery = query(commitSummaryCollection, orderBy('created_at', 'desc'), limit(1));
    const querySnapshot = await getDocs(commitSummaryQuery);

    if (querySnapshot.empty) {
        console.log("No activities this week.");
        return "No activities this week.";
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    console.log("✅ @summary.js : Fetch summary from firestore success")
    return data;
} catch (error) {
    throw new Error("@summary.js : Failed to fetch commit data from Firestore.");
}
}


async function updateSvg() {
  try {
    const commitSummary = await fetchCommitSummary();
    console.log(commitSummary);

    if (!commitSummary.summary) {
      console.error("Error: Commit summary does not have 'summary' field.");
      return;
    }

    const escapedSummary = escapeXml(commitSummary.summary);
    const svgContent = svgTemplate(escapedSummary);

    fs.writeFileSync('summary.svg', svgContent);
    console.log("Updated summary.svg");
  } catch (error) {
    console.error("Error updating README:", error);
  } 
}

updateSvg();