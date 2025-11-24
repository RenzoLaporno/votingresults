export interface VotingData {
  email: string;
  name: string;
  shares: number;
  maxVotes: string; // Note: This is a string in your Firestore!
  hasRatified: boolean;
  hasVoted: boolean;
  
  // Vote counts (0-150)
  vote1: number;
  vote2: number;
  vote3: number;
  vote4: number;
  vote5: number;
  vote6: number;
  vote7: number;
  vote8: number;
  independent1: number;
  independent2: number;
  
  // Selections (For/Against/Abstain)
  selection1: string;
  selection2: string;
  selection3: string;
  selection4: string;
  selection5: string;
  selection6: string;
  selection7: string;
  selection8: string;
  selection9: string;
  selection10: string;
  selection11: string;
  selection12: string;
  selection13: string;
  
  // Timestamps
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  timeRatified?: any; // Firebase Timestamp
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  timeVoted?: any; // Firebase Timestamp
}