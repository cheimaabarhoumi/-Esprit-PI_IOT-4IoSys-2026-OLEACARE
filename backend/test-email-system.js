const emailService = require('./src/services/emailService');

async function testEmailSystem() {
  console.log('🧪 Test du système d\'email avec Ethereal...\n');

  try {
    // Générer un code de test
    const testCode = Math.floor(100000 + Math.random() * 900000).toString();
    const testEmail = 'test@example.com';

    console.log(`📧 Envoi d'un email de test à: ${testEmail}`);
    console.log(`🔢 Code de vérification: ${testCode}\n`);

    await emailService.sendVerificationEmail(testEmail, testCode);

    console.log('\n✅ Test réussi ! Le système d\'email fonctionne.');
    console.log('📝 Prochaines étapes :');
    console.log('1. Configurez Gmail pour la production');
    console.log('2. Testez une vraie inscription');
    console.log('3. Vérifiez que les emails arrivent');

  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error.message);
  }
}

testEmailSystem();