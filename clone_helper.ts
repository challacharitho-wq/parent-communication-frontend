import { execSync } from 'child_process';
import fs from 'fs';

try {
  console.log('Checking out charith-backend-dev branch...');
  execSync('git -C backend-clone checkout charith-backend-dev', { stdio: 'inherit' });
  console.log('Checkout successful!');

  console.log('Files in backend-clone root:');
  console.log(fs.readdirSync('backend-clone'));

  if (fs.existsSync('backend-clone/parent-communication-backend')) {
    console.log('Files inside parent-communication-backend:');
    console.log(fs.readdirSync('backend-clone/parent-communication-backend'));
  }
} catch (error) {
  console.error('Error running checkout helper:', error);
}
