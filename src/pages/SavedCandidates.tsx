import { useState, useEffect } from "react";
import { Candidate } from "../interfaces/Candidate.interface";

const SavedCandidates = () => {
  const [savedCandidates, setSavedCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    try {
      const storedCandidates = JSON.parse(localStorage.getItem("savedCandidates") || "[]");

      if (Array.isArray(storedCandidates)) {
        const filteredCandidates = storedCandidates.filter((candidate) => candidate && typeof candidate === "object" && candidate.login);
        setSavedCandidates(filteredCandidates);
      } else {
        console.warn("Invalid data found in localStorage, resetting...");
        setSavedCandidates([]);
      }
    } catch (error) {
      console.error("Error parsing savedCandidates from localStorage:", error);
      setSavedCandidates([]);
    }
  }, []);

  const handleRemove = (username: string) => {
    const updatedList = savedCandidates.filter((candidate) => candidate.login !== username);
    setSavedCandidates(updatedList);
    localStorage.setItem("savedCandidates", JSON.stringify(updatedList));
  };

  return (
    <div>
      <h1>Potential Candidates</h1>
      {savedCandidates.length === 0 ? (
        <p>No candidates have been accepted.</p>
      ) : (
        <ul>
          {savedCandidates.map((candidate) => (
            <li key={candidate.login}>
              <img src={candidate.avatar_url} alt={candidate.login} width="50" />
              <h2>{candidate.login}</h2>
              <p>Location: {candidate.location || "Not available"}</p>
              <p>Email: {candidate.email || "Not available"}</p>
              <p>Company: {candidate.company || "Not available"}</p>
              <p>Bio: {candidate.bio || "Not available"}</p>
              <a href={candidate.html_url} target="_blank" rel="noopener noreferrer">
                View Profile
              </a>
              <button onClick={() => handleRemove(candidate.login)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


export default SavedCandidates;
