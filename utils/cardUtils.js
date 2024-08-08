const Issue = require('../models/issue');
const Card = require('../models/card');

// Function to draw random cards with pull rates based on rarity
async function drawRandomCards(count) {
  const issues = await Issue.find();
  
  // Create a weighted array based on rarity
  const weightedIssues = issues.flatMap(issue => Array((6 - issue.rarity) * 10).fill(issue));

  // Shuffle and select random cards
  const shuffled = weightedIssues.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  return selected.map(issue => ({
    name: issue.name,
    value: issue.rarity,
    image: issue.image
  }));
}

// Function to get the next issue number for a card
async function getNextIssueNumber(cardName) {
  const cards = await Card.find({ name: cardName });
  const issueNumbers = cards.map(card => card.issue).sort((a, b) => a - b);
  return (issueNumbers.pop() || 0) + 1;
}

module.exports = { drawRandomCards, getNextIssueNumber };