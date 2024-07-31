import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import config from './config.js';
import fs from 'fs';


const firebaseApp = initializeApp(config.firebaseConfig);
const db = getFirestore(firebaseApp);


const FIRESTORE_COLLECTION = 'commit-summary';

const svgTemplate = (summaryText) => {
  return `
    <svg fill="none" viewBox="0 0 600 300" width="600" height="300" xmlns="http://www.w3.org/2000/svg">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <style>
            @keyframes hi {
                0% { transform: rotate( 0.0deg); }
               10% { transform: rotate(14.0deg); }
               20% { transform: rotate(-8.0deg); }
               30% { transform: rotate(14.0deg); }
               40% { transform: rotate(-4.0deg); }
               50% { transform: rotate(10.0deg); }
               60% { transform: rotate( 0.0deg); }
              100% { transform: rotate( 0.0deg); }
            }

            @keyframes gradient {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }

            .container {
              --color-main: #5452ee;
              --color-primary: #e73c7e;
              --color-secondary: #23a6d5;
              --color-tertiary: #ffff;

              background: linear-gradient(-45deg, var(--color-main), var(--color-primary), var(--color-secondary), var(--color-tertiary));
              background-size: 400% 400%;
              animation: gradient 15s ease infinite;

              width: 100%;
              height: 300px;

              display: flex;
              justify-content: center;
              align-items: center;
              color: white;

              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
              padding: 20px;
              box-sizing: border-box;
              text-align: center;
            }

            .hi {
              animation: hi 1.5s linear -0.5s infinite;
              display: inline-block;
              transform-origin: 70% 70%;
            }

            .summary {
              margin-top: 20px;
              font-size: 16px;
              line-height: 1.5;
              white-space: pre-wrap;
              text-align: left;
            }

            @media (prefers-color-scheme: light) {
              .container {
                --color-main: #F15BB5;
                --color-primary: #24b0ef;
                --color-secondary: #4526f6;
                --color-tertiary: #f6f645;
              }
            }

            @media (prefers-reduced-motion) {
              .container {
                animation: none;
              }

              .hi {
                animation: none;
              }
            }
          </style>

          <div class="container">
            <div>
              <h1>Weekly Summary <div class="hi">👋</div></h1>
              <div class="summary">${escapeXml(summaryText)}</div>
            </div>
          </div>
        </div>
      </foreignObject>
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