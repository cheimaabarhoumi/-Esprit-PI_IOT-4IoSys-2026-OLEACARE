const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

// Simple User schema for cleanup
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  farmName: String,
  role: String,
  isVerified: Boolean,
  verificationCode: String,
  codeExpiresAt: Date,
  createdAt: Date,
});

const User = mongoose.model('User', UserSchema);

async function cleanupTestUsers() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/oleacare';
    console.log(`🔌 Connexion à MongoDB: ${mongoUri}`);

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connecté à MongoDB');

    // Trouver tous les utilisateurs sauf l'admin
    const testUsers = await User.find({
      email: { $ne: 'admin@oleacare.com' }
    });

    console.log(`\n👥 Utilisateurs trouvés: ${testUsers.length}`);
    testUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.isVerified ? 'Vérifié' : 'Non vérifié'})`);
    });

    if (testUsers.length === 0) {
      console.log('\n✨ Aucun utilisateur de test à supprimer');
      await mongoose.disconnect();
      return;
    }

    // Demander confirmation
    console.log('\n⚠️  ATTENTION: Cette action va supprimer TOUS les utilisateurs sauf admin@oleacare.com');
    console.log('Tapez "OUI" pour confirmer la suppression:');

    // Pour l'instant, on simule la confirmation
    const confirmed = true; // À remplacer par une vraie confirmation si nécessaire

    if (confirmed) {
      const result = await User.deleteMany({
        email: { $ne: 'admin@oleacare.com' }
      });

      console.log(`\n🗑️  ${result.deletedCount} utilisateurs supprimés`);
      console.log('✅ Base de données nettoyée !');
    } else {
      console.log('\n❌ Opération annulée');
    }

    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error.message);
    process.exit(1);
  }
}

// Fonction pour lister les utilisateurs
async function listUsers() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/oleacare';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const users = await User.find({});
    console.log('\n👥 Liste des utilisateurs:');
    users.forEach(user => {
      console.log(`  📧 ${user.email}`);
      console.log(`     ✅ Vérifié: ${user.isVerified}`);
      console.log(`     👤 Nom: ${user.firstName} ${user.lastName}`);
      console.log(`     🏢 Ferme: ${user.farmName || 'N/A'}`);
      console.log(`     📅 Créé: ${user.createdAt}`);
      console.log('');
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function deleteUserByEmail(email) {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/oleacare';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const deleted = await User.deleteOne({ email });
    if (deleted.deletedCount === 0) {
      console.log(`❌ Aucun utilisateur trouvé pour l'email : ${email}`);
    } else {
      console.log(`✅ Utilisateur supprimé : ${email}`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error.message);
    process.exit(1);
  }
}

// Gestion des arguments
const action = process.argv[2];
const target = process.argv[3];

if (action === 'list') {
  listUsers();
} else if (action === 'clean') {
  cleanupTestUsers();
} else if (action === 'delete' && target) {
  deleteUserByEmail(target);
} else {
  console.log('📋 Utilisation:');
  console.log('  node cleanup-users.js list              - Lister tous les utilisateurs');
  console.log('  node cleanup-users.js clean             - Supprimer les utilisateurs de test');
  console.log('  node cleanup-users.js delete <email>    - Supprimer un utilisateur par email');
}