const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function testGmailConfig() {
  console.log('🔍 Test de configuration Gmail...\n');

  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  console.log(`📧 GMAIL_USER: ${gmailUser ? '✅ Configuré' : '❌ Manquant'}`);
  console.log(`🔑 GMAIL_APP_PASSWORD: ${gmailAppPassword ? '✅ Configuré' : '❌ Manquant'}`);

  if (!gmailUser || !gmailAppPassword) {
    console.log('\n❌ Variables manquantes dans .env');
    return;
  }

  if (gmailUser === 'your-email@gmail.com') {
    console.log('\n❌ Remplacez "your-email@gmail.com" par votre vraie adresse Gmail');
    return;
  }

  if (gmailAppPassword === 'your-app-password') {
    console.log('\n❌ Remplacez "your-app-password" par votre vrai mot de passe d\'application');
    return;
  }

  if (gmailAppPassword === '20962m@ll') {
    console.log('\n❌ Remplacez "20962m@ll" par votre vrai mot de passe d\'application Gmail');
    console.log('Format attendu: XXXX-XXXX-XXXX-XXXX (16 caractères avec tirets)');
    return;
  }

  // Test de connexion
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });

  try {
    await transporter.verify();
    console.log('\n✅ Connexion Gmail réussie !');
    console.log('🚀 Votre configuration est correcte.');
    console.log('📧 Les emails de vérification seront envoyés depuis:', gmailUser);
    console.log('\n🎯 Testez maintenant avec une inscription !');
  } catch (error) {
    console.log('\n❌ Erreur de connexion Gmail :');
    console.log(error.message);

    if (error.message.includes('Invalid login')) {
      console.log('\n🔧 Solutions possibles :');
      console.log('1. Vérifiez que la vérification en 2 étapes est activée sur votre compte Gmail');
      console.log('2. Vérifiez que le mot de passe d\'application est correct');
      console.log('3. Essayez de régénérer un nouveau mot de passe d\'application');
      console.log('4. Format attendu: XXXX-XXXX-XXXX-XXXX (16 caractères avec tirets)');
      console.log('5. Assurez-vous que le mot de passe correspond au compte Gmail indiqué');
    }
  }
}

testGmailConfig();