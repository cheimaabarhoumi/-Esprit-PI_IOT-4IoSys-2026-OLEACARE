const http = require('http');

async function testRegistration() {
  console.log('🧪 Test d\'inscription complète...\n');

  const postData = JSON.stringify({
    email: 'test-user-' + Date.now() + '@oleacare.com',
    password: 'test123',
    firstName: 'Test',
    lastName: 'User'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('STATUS CODE:', res.statusCode);
          console.log('RESPONSE:', response);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ Inscription réussie:', response.message);
          } else {
            console.error('❌ Inscription échouée:', response.message || data);
          }
          resolve();
        } catch (error) {
          console.error('❌ Erreur parsing réponse:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Erreur requête:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

testRegistration().catch(console.error);