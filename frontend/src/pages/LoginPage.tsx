import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface StatusMessage {
  text: string;
  type: 'info' | 'success' | 'error' | ''; 
}

function LoginPage(){

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessage>({ text: '', type: '' });

  const handleLogin = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!username || !password) {
      setStatusMessage({ text: 'Please enter both username and password.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ text: 'Attempting login...', type: 'info' });

    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); 

      if (username === 'admin' && password === 'password123') {
        setStatusMessage({ text: 'Login successful! Redirecting...', type: 'success' });
      
        console.log('Login successful (simulated)');
        
      } else {
        
        throw new Error('Invalid username or password.');
      }
    } catch (error) {
        
        let errorMessage = 'Login failed. Please try again.';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error; 
        }
        console.error("Login error:", error); 
        setStatusMessage({ text: errorMessage, type: 'error' });
        setIsLoading(false); 
    }
   
  };

  useEffect(() => {
    if (statusMessage.text && statusMessage.type !== 'success') {
      const timer = setTimeout(() => {
        setStatusMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer); 
    }
  }, [statusMessage]);

  const getStatusBgColor = (): string => {
    switch (statusMessage.type) {
      case 'success': return 'bg-green-600';
      case 'error': return 'bg-red-600';
      case 'info': return 'bg-blue-600';
      default: return 'hidden';
    }
  };

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
  };

  return (
   
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4 text-gray-200">

     
      <div className="w-full max-w-md rounded-none bg-gray-900 p-6 shadow-none
                      sm:rounded-lg sm:bg-gray-800 sm:p-8 sm:shadow-lg">

        <h1 className="mb-6 text-center text-2xl font-bold text-white sm:text-3xl relative pb-4">
          Admin <span className="text-blue-500">Login</span>
          <span className="absolute bottom-0 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full bg-blue-500"></span>
        </h1>

        {statusMessage.text && (
          <div
            className={`mb-5 rounded px-4 py-3 text-center font-medium text-white ${getStatusBgColor()}`}
            role="alert"
          >
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleLogin} noValidate>
         
          <div className="mb-5">
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Username or Email:
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={handleUsernameChange} 
              required
              placeholder="Enter your username or email"
              className="block w-full rounded-md border border-gray-600 bg-gray-700 p-3 text-gray-100 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Password:
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={password}
                onChange={handlePasswordChange} 
                required
                placeholder="Enter your password"
                className="block w-full rounded-md border border-gray-600 bg-gray-700 p-3 pr-10 text-gray-100 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash size="1.2em" /> : <FaEye size="1.2em" />}
              </button>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-md px-4 py-3 text-center text-base font-semibold text-white shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
                ${isLoading
                  ? 'cursor-not-allowed bg-blue-800'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
                }`}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;