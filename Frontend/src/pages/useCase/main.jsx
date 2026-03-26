import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LaptopIcon from '@mui/icons-material/Laptop';
import PersonIcon from '@mui/icons-material/Person';
import Radio from '@mui/material/Radio';
import { IconButton } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UseCase = () => {
  const [selected, setSelected] = useState('bot');
  const [useCaseData, setUseCaseData] = useState({
    requestOwner: '',
    projectType: '',
    systemName: '',
    startDate: '',
    endDate: '',
    delayFactors: ''
  });
  const navigate = useNavigate();

  // Only collect high-level metadata, no questions or templates
  const handleContinue = () => {
    navigate('/quetionare', {
      state: {
        useCaseType: selected,
        useCaseData: useCaseData
      }
    });
  };

  return (
    <div className='flex flex-col gap-6 px-4 py-6'>
      <div className='flex items-center gap-2'>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <div className='font-semibold text-2xl'>Create a new use case</div>
      </div>

      <div className='p-6 shadow-xl transform hover:-translate-y-1 rounded-xl flex flex-col gap-6'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold mb-2'>Select Use Case Type</h2>
          <p className='text-gray-600'>Choose the type of use case you want to create</p>
        </div>

        <div className='flex gap-4'>
          <div
            onClick={() => setSelected('bot')}
            className={`flex flex-col border rounded-xl p-4 gap-4 cursor-pointer w-1/2 
              ${selected === 'bot' ? 'border-blue-600 shadow-md' : 'border-gray-300'}`}
          >
            <div className='flex gap-2 items-center'>
              <div className='rounded-full p-2 bg-blue-100'>
                <LaptopIcon />
              </div>
              <div className='font-semibold text-xl'>AI Agent</div>
            </div>
            <p className='text-gray-600'>Automated AI agent for risk assessment</p>
            <div className='flex justify-end'>
              <Radio
                checked={selected === 'bot'}
                onChange={() => setSelected('bot')}
                value='bot'
                color='primary'
              />
            </div>
          </div>
          <div
            onClick={() => setSelected('human')}
            className={`flex flex-col border rounded-xl p-4 gap-4 cursor-pointer w-1/2 
              ${selected === 'human' ? 'border-blue-600 shadow-md' : 'border-gray-300'}`}
          >
            <div className='flex gap-2 items-center'>
              <div className='rounded-full p-2 bg-green-100'>
                <PersonIcon />
              </div>
              <div className='font-semibold text-xl'>Human-operated</div>
            </div>
            <p className='text-gray-600'>Manual questionnaire-based assessment</p>
            <div className='flex justify-end'>
              <Radio
                checked={selected === 'human'}
                onChange={() => setSelected('human')}
                value='human'
                color='primary'
              />
            </div>
          </div>
        </div>

        {/* High-level metadata form */}
        <div className='mt-6 space-y-4'>
          <h3 className='text-xl font-semibold'>Use Case Details</h3>
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>1. Who is submitting this request?</label>
            <input
              type='text'
              placeholder='Name, role & country of the request owner'
              value={useCaseData.requestOwner}
              onChange={e => setUseCaseData(prev => ({ ...prev, requestOwner: e.target.value }))}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>2. Project Type</label>
            <select
              value={useCaseData.projectType}
              onChange={e => setUseCaseData(prev => ({ ...prev, projectType: e.target.value }))}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>Select project type</option>
              <option value='Internal development'>Internal development</option>
              <option value='Third-party Integration'>Third-party Integration</option>
            </select>
          </div>
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>3. System Name</label>
            <input
              type='text'
              placeholder='Enter system name'
              value={useCaseData.systemName}
              onChange={e => setUseCaseData(prev => ({ ...prev, systemName: e.target.value }))}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>4. Start Date</label>
            <input
              type='date'
              value={useCaseData.startDate}
              onChange={e => setUseCaseData(prev => ({ ...prev, startDate: e.target.value }))}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>5. End Date</label>
            <input
              type='date'
              value={useCaseData.endDate}
              onChange={e => setUseCaseData(prev => ({ ...prev, endDate: e.target.value }))}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>6. Delay Factors</label>
            <textarea
              placeholder='Describe any potential delays...'
              value={useCaseData.delayFactors}
              onChange={e => setUseCaseData(prev => ({ ...prev, delayFactors: e.target.value }))}
              rows='3'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>
        <div className='flex justify-end mt-6'>
          <button
            onClick={handleContinue}
            className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
          >
            Continue to Questionnaire
          </button>
        </div>
      </div>
    </div>
  );
};

export default UseCase;
