import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
      const navigate = useNavigate();
      useEffect(()=>{
            console.log('HomePage Mounted');
            navigate('/chemical-changes/215358?date=9/7/2024');
      },[]);
  return (
    <div>HomePage</div>
  )
}

export default HomePage