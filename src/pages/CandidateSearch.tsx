import { useState, useEffect } from 'react';
import { searchGithub, searchGithubUser } from '../api/API';
import { Candidate } from '../interfaces/Candidate.interface';

const CandidateSearch = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedCandidates, setSavedCandidates] = useState<Candidate[]>(() => {
    return JSON.parse(localStorage.getItem('savedCandidates') || '[]');
  });

  useEffect(() => {
    const fetchCandidates = async () => {
      const data = await searchGithub();
      setCandidates(data);
    };
    fetchCandidates();
  }, []);

  const handleAccept = async () => {
    if (candidates[currentIndex]) {
      const userDetails = await searchGithubUser(candidates[currentIndex].login);
      const updatedSaved = [...savedCandidates, userDetails];
      setSavedCandidates(updatedSaved);
      localStorage.setItem('savedCandidates', JSON.stringify(updatedSaved));
    }
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < candidates.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCandidates([]);
    }
  };

  if (candidates.length === 0) {
    return <h2>No more candidates available.</h2>;
  }

  const candidate = candidates[currentIndex];
  
  return (
  <div>
    <h1>Candidate Search</h1>;
    <div>
      <img src={candidate.avatar_url} alt={candidate.login} width='100' />
      <p>{candidate.login} <em>({candidate.login})</em></p>
      <p>Location: {candidate.location || "Not available"}</p>
      <p>Email: {candidate.email || "Not available"}</p>
      <p>Company: {candidate.company || "Not available"}</p>
      <p>Bio: {candidate.bio || "Not available"}</p>
      <a href={candidate.html_url} target="_blank" rel="noopener noreferrer">View Profile</a>
      <div>
        <button onClick={handleAccept}>+</button>
        <button onClick={handleNext}>-</button>
      </div>
      </div>
    </div>
    );
};

export default CandidateSearch;
