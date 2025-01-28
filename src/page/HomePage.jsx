import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
      const navigate = useNavigate();
      useEffect(()=>{
            console.log('HomePage Mounted');
            navigate('/chemical-changes');
      },[]);
  return (
    <div>HomePage</div>
  )
}

export default HomePage