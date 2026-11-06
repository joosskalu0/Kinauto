# 🚀 Guide de Déploiement Hostinger - CONGOCAR / AUTOKIN

Ce guide détaille pas à pas la publication complète de votre application (Frontend React + Backend Node.js Express + Base MySQL) sur **Hostinger**.

---

## 📋 Résumé de ce qui est prêt dans le projet

1. ✅ **Build Production** : `npm run build` génère le bundle frontend optimisé dans `dist/` et le serveur compilé dans `dist/server.cjs`.
2. ✅ **Configuration Apache / LiteSpeed** : `.htaccess` est déjà configuré à la racine pour forcer HTTPS, rediriger `/api/*` vers Node.js et router la SPA React sans erreur 404.
3. ✅ **Schémas de Base de Données** : Les fichiers SQL complets sont disponibles dans `/database/congocar_schema.sql` et `/database/autokin_monetization.sql`.
4. ✅ **Résilience Base de Données** : Si MySQL n'est pas encore configuré ou en maintenance, le serveur bascule automatiquement sur la mémoire sécurisée avec hachage Bcrypt.

---

## 🛠️ Option 1 : Déploiement sur Hébergement Web Hostinger (hPanel avec Node.js)

### Étape 1 : Créer la Base de Données MySQL sur Hostinger
1. Connectez-vous à votre compte **Hostinger hPanel**.
2. Allez dans **Bases de données** > **Gestion des bases de données MySQL**.
3. Créez une nouvelle base de données :
   - **Nom de la base** : ex. `u123456789_congocar`
   - **Nom d'utilisateur** : ex. `u123456789_admin`
   - **Mot de passe** : Générez un mot de passe sécurisé et notez-le.
4. Cliquez sur **phpMyAdmin** à côté de votre base de données.
5. Dans phpMyAdmin, cliquez sur **Importer**, sélectionnez le fichier `database/congocar_schema.sql` (puis `database/autokin_monetization.sql`) et cliquez sur **Exécuter**.

### Étape 2 : Configurer l'application Node.js dans hPanel
1. Dans hPanel, rendez-vous dans la section **Avancé** > **Node.js** (ou tapez "Node.js" dans la recherche).
2. Cliquez sur **Créer une application Node.js** :
   - **Version Node.js** : 18.x, 20.x ou 22.x
   - **Racine de l'application (Application root)** : `/` ou le dossier de votre site
   - **URL de l'application** : votre domaine (ex. `votredomaine.com`)
   - **Fichier de démarrage (Startup file)** : `dist/server.cjs` (ou `server.ts` si vous lancez via tsx)
   - **Mode de l'application** : `production`

### Étape 3 : Configurer les Variables d'Environnement (.env)
Créez ou modifiez le fichier `.env` sur Hostinger (via le Gestionnaire de fichiers) :
```env
NODE_ENV=production
PORT=3000

# Informations de votre base Hostinger MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=u123456789_congocar
DB_USER=u123456789_admin
DB_PASSWORD=VotreMotDePasseMySQLSecurise

# Clé secrète pour les jetons de connexion
JWT_SECRET=votre_cle_jwt_tres_longue_et_securisee_2026

# Domaine officiel de votre site
APP_URL=https://votredomaine.com

# Clé Google Gemini AI (optionnel pour les estimations de prix par IA)
GEMINI_API_KEY=votre_cle_api_gemini
```

### Étape 4 : Déployer les Fichiers
1. En local ou dans votre pipeline :
   ```bash
   npm install
   npm run build
   ```
2. Téléversez sur Hostinger via le **Gestionnaire de fichiers** (ou par FTP / Git) :
   - Le dossier `dist/`
   - Le dossier `server/`
   - Le fichier `package.json`
   - Le fichier `.htaccess`
   - Le fichier `.env`
3. Dans la console Node.js de Hostinger (ou via Terminal SSH) :
   ```bash
   npm install --omit=dev
   ```
4. Cliquez sur **Redémarrer l'application (Restart Application)** dans hPanel.

---

## 🚀 Option 2 : Déploiement sur un VPS Hostinger (Ubuntu / Debian)

Si vous avez un VPS Hostinger, vous avez un contrôle total avec **PM2** et **Nginx** :

1. **Connectez-vous en SSH** :
   ```bash
   ssh root@ip_de_votre_vps
   ```

2. **Installer Node.js et PM2** :
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

3. **Cloner ou transférer le projet**, puis compiler :
   ```bash
   npm install
   npm run build
   ```

4. **Démarrer avec PM2 (process manager 24/7)** :
   ```bash
   pm2 start dist/server.cjs --name "congocar"
   pm2 save
   pm2 startup
   ```

5. **Certificat SSL Gratuit (HTTPS)** :
   ```bash
   sudo certbot --nginx -d votredomaine.com
   ```

---

## 🔍 Vérifications Post-Déploiement

- Tester l'API Santé : `https://votredomaine.com/api/health` (doit répondre `{ "status": "ok" }`)
- Tester la connexion MySQL : `https://votredomaine.com/api/test-db`
- Tester la navigation SPA : Rechargez une page interne (ex: `/recherche` ou `/depannage-urgence`) pour vérifier que le fichier `.htaccess` redirige bien vers `index.html`.
