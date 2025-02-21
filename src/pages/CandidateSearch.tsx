import { useState, useEffect } from 'react';
import { searchGithub, searchGithubUser } from '../api/API';
import { Candidate } from '../interfaces/Candidate.interface';

const CandidateSearch = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentCandidate, setCurrentCandidate] = useState<Candidate | null>(null);
  const [savedCandidates, setSavedCandidates] = useState<Candidate[]>(() => {
    return JSON.parse(localStorage.getItem('savedCandidates') || '[]');
  });

  useEffect(() => {
    const fetchCandidates = async () => {
      const basicCandidates = await searchGithub();

      if (basicCandidates.length > 0) {
        try {
          const enrichedCandidates = await Promise.all(
            basicCandidates.map(async (candidate: Candidate) => {
              try {
                const fullCandidate = await searchGithubUser(candidate.login);
                return fullCandidate && fullCandidate.login ? fullCandidate : null;
              } catch (error) {
                console.error(`Error fetching details for ${candidate.login}:`, error);
                return null; // Skip invalid candidates
              }
            })
          );

          // Remove null values (invalid candidates)
          const validCandidates = enrichedCandidates.filter((c) => c !== null);

          if (validCandidates.length > 0) {
            setCandidates(validCandidates);
            setCurrentCandidate(validCandidates[0]);
          } else {
            console.warn("No valid candidates retrieved.");
          }
        } catch (error) {
          console.error("Error enriching candidates:", error);
        }
      } else {
        console.warn("No candidates found from GitHub API.");
      }
    };

    fetchCandidates();
  }, []);


  const handleAccept = () => {
    if (currentCandidate) {
      const updatedSaved = [...savedCandidates, {
        login: currentCandidate.login,
        avatar_url: currentCandidate.avatar_url,
        location: currentCandidate.location || "Not available",
        email: currentCandidate.email || "Not available",
        company: currentCandidate.company || "Not available",
        bio: currentCandidate.bio || "Not available",
        html_url: currentCandidate.html_url
      }];

      setSavedCandidates(updatedSaved);
      localStorage.setItem('savedCandidates', JSON.stringify(updatedSaved));
    }
    handleNext();
  };

  const handleNext = () => {
    if (candidates.length > 1) {
      const remainingCandidates = candidates.slice(1);
      setCandidates(remainingCandidates);
      setCurrentCandidate(remainingCandidates[0]);
    } else {
      setCandidates([]);
      setCurrentCandidate(null);
    }
  };

  if (!currentCandidate) {
    return <h2>No more candidates available.</h2>;
  }

  return (
    <div>
      <h1>Candidate Search</h1>
      <div>
        <img src={currentCandidate.avatar_url} alt={currentCandidate.login} width="100" />
        <p>{currentCandidate.login} <em>({currentCandidate.login})</em></p>
        <p>Location: {currentCandidate.location || "Not available"}</p>
        <p>Email: {currentCandidate.email || "Not available"}</p>
        <p>Company: {currentCandidate.company || "Not available"}</p>
        <p>Bio: {currentCandidate.bio || "Not available"}</p>
        <a href={currentCandidate.html_url} target="_blank" rel="noopener noreferrer">View Profile</a>
        <div>
          <button onClick={handleAccept}>+</button>
          <button onClick={handleNext}>-</button>
        </div>
      </div>
    </div>
  );
};

export default CandidateSearch;
