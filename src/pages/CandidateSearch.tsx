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
        // Fetch full details of the first candidate
        const fullCandidate = await searchGithubUser(basicCandidates[0].login);
        setCandidates(basicCandidates);
        setCurrentCandidate(fullCandidate);
      } catch (error) {
        console.error("❌ Error fetching full candidate details:", error);
      }
    } else {
      console.warn("⚠️ Warning: Received an invalid candidate from GitHub API.");
    }
  
    };
    fetchCandidates();
  }, []);

  const handleAccept = async () => {
    if (candidates.length > 0) {
      try{
      const fullCandidateDetails = await searchGithubUser(candidates[0].login); 

      console.log("Full API Response:", fullCandidateDetails);

      // Check if required fields exist
      if (!fullCandidateDetails.location && !fullCandidateDetails.email && !fullCandidateDetails.company && !fullCandidateDetails.bio) {
        console.warn("Warning: API is not returning full user details.");
      }
  
      const updatedSaved = [...savedCandidates, fullCandidateDetails];
      setSavedCandidates(updatedSaved);
      localStorage.setItem('savedCandidates', JSON.stringify(updatedSaved));
    } catch (error) {
      console.error("Error fetching candidate details:", error);
    }
  }
    handleNext(); 
  };

  const handleNext = async () => {
    if (candidates.length > 1) {
      // Remove the first candidate and fetch full details of the next one
      const remainingCandidates = candidates.slice(1);
      const nextCandidate = await searchGithubUser(remainingCandidates[0].login);
      setCandidates(remainingCandidates);
      setCurrentCandidate(nextCandidate);
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

