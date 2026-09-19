import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const authRoutes = require("./server/routes/auth.js");
const userRoutes = require("./server/routes/users.js");
const dealershipRoutes = require("./server/routes/dealerships.js");
const vehicleRoutes = require("./server/routes/vehicles.js");
const leadRoutes = require("./server/routes/leads.js");
const favoriteRoutes = require("./server/routes/favorites.js");
const garageRoutes = require("./server/routes/garages.js");
const adminRoutes = require("./server/routes/admin.js");
const monetizationRoutes = require("./server/routes/monetization.js");
const { pool } = require("./server/config/database.js");

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize Gemini AI
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Route de test de la connexion active à la base de données MySQL
  app.get("/api/test-db", async (req, res) => {
    const startTime = Date.now();
    try {
      if (!pool) {
        console.warn("[DB Test] ⚠️ Pool MySQL non initialisé.");
        return res.status(503).json({
          success: false,
          connected: false,
          message: "Pool de connexion MySQL non initialisé.",
          timestamp: new Date().toISOString()
        });
      }

      // Tenter une connexion active réelle et exécuter une requête test
      const connection = await pool.getConnection();
      const [rows] = await connection.query("SELECT 1 AS connected, NOW() AS server_time, VERSION() AS mysql_version");
      connection.release();

      const latencyMs = Date.now() - startTime;
      console.log(`[DB Test] ✅ Test de connexion MySQL RÉUSSI (${latencyMs}ms) - Base: "${process.env.DB_NAME || 'congocar_db'}" :`, rows);

      return res.json({
        success: true,
        connected: true,
        message: "Connexion active à la base de données MySQL vérifiée avec succès.",
        latency_ms: latencyMs,
        database: process.env.DB_NAME || 'congocar_db',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        server_info: rows,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      const latencyMs = Date.now() - startTime;
      console.error(`[DB Test] ❌ Résultat du test de connexion MySQL (${latencyMs}ms) : ${error.message}`);

      return res.status(500).json({
        success: false,
        connected: false,
        message: "Échec de la connexion active à la base de données MySQL.",
        error: error.message,
        code: error.code || null,
        latency_ms: latencyMs,
        config: {
          host: process.env.DB_HOST || 'localhost',
          port: Number(process.env.DB_PORT) || 3306,
          database: process.env.DB_NAME || 'congocar_db',
          user: process.env.DB_USER || 'root'
        },
        timestamp: new Date().toISOString()
      });
    }
  });

  // Mount Node.js + MySQL Authentication & Platform Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/dealerships", dealershipRoutes);
  app.use("/api/dealers", dealershipRoutes);
  app.use("/api/vehicles", vehicleRoutes);
  app.use("/api/leads", leadRoutes);
  app.use("/api/favorites", favoriteRoutes);
  app.use("/api/garages", garageRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/monetization", monetizationRoutes);


  // AI Description Generation for Vehicle Listings
  app.post("/api/ai/generate-description", async (req, res) => {
    try {
      const {
        marque,
        modele,
        finition,
        annee,
        kilometrage,
        carburant,
        transmission,
        puissance,
        prix,
        etat,
        equipements = [],
        pointsForts = ""
      } = req.body;

      if (!marque || !modele) {
        return res.status(400).json({ error: "Marque et modèle sont requis." });
      }

      const prompt = `Tu es un expert en marketing automobile pour une concession haut de gamme.
Rédige une annonce de vente professionnelle, captivante et persuasive en français pour le véhicule suivant :

- Marque : ${marque}
- Modèle : ${modele} ${finition ? `(${finition})` : ''}
- Année : ${annee}
- État : ${etat || 'Occasion'}
- Kilométrage : ${kilometrage ? Number(kilometrage).toLocaleString('fr-FR') + ' km' : 'N/C'}
- Carburant : ${carburant || 'N/C'}
- Boîte de vitesses : ${transmission || 'N/C'}
- Puissance : ${puissance ? puissance + ' ch' : 'N/C'}
- Prix proposé : ${prix ? Number(prix).toLocaleString('fr-FR') + ' €' : 'N/C'}
- Équipements clés : ${equipements.length > 0 ? equipements.join(', ') : 'Excellente finition'}
${pointsForts ? `- Remarques / Points forts du vendeur : ${pointsForts}` : ''}

Structure de l'annonce :
1. Titre d'accroche valorisant
2. Présentation générale et attrait du véhicule (moteur, conduite, esthétique)
3. Points forts & Équipements majeurs (liste à puces claire)
4. État & Garanties (véhicule révisé, contrôlé)
5. Appel à l'action courtois invitant à réserver un essai ou contacter la concession.

Formate le résultat en texte clair avec des paragraphes aérés et des puces élégantes. Garde un ton professionnel, rassurant et dynamique.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });

      const generatedText = response.text || "Annonce générée avec succès.";
      return res.json({ description: generatedText });
    } catch (error: any) {
      console.error("Erreur génération annonce Gemini:", error);
      return res.status(500).json({
        error: "Échec de la génération d'annonce. " + (error?.message || "")
      });
    }
  });

  // Dedicated AI SEO Description Generator for Search Engines
  app.post("/api/ai/generate-seo-description", async (req, res) => {
    try {
      const {
        marque,
        modele,
        finition,
        annee,
        kilometrage,
        carburant,
        transmission,
        puissance,
        prix,
        etat,
        equipements = [],
        ville = "France",
        tone = "Professionnel & Vendeur",
        targetKeywords = ""
      } = req.body;

      if (!marque || !modele) {
        return res.status(400).json({ error: "Marque et modèle sont requis." });
      }

      const prompt = `Tu es un expert SEO spécialiste du secteur automobile et du référencement sur Google, Leboncoin, La Centrale et moteurs de recherche.
Génère un contenu d'annonce hautement optimisé pour le SEO et le taux de conversion commerciale pour le véhicule suivant :

- Marque : ${marque}
- Modèle : ${modele}
- Finition : ${finition || 'N/C'}
- Année : ${annee}
- État : ${etat || 'Occasion'}
- Kilométrage : ${kilometrage ? Number(kilometrage).toLocaleString('fr-FR') + ' km' : 'N/C'}
- Carburant : ${carburant || 'N/C'}
- Transmission : ${transmission || 'N/C'}
- Puissance : ${puissance ? puissance + ' ch' : 'N/C'}
- Prix : ${prix ? Number(prix).toLocaleString('fr-FR') + ' €' : 'N/C'}
- Équipements : ${equipements.length > 0 ? equipements.join(', ') : 'Excellente finition'}
- Ville / Région d'ancrage : ${ville}
- Ton réducteur : ${tone}
${targetKeywords ? `- Mots-clés SEO cibles prioritaires : ${targetKeywords}` : ''}

Génère une réponse au format JSON strict avec ce schéma :
{
  "seoTitle": "Titre optimisé Google (max 60 caractères) ex: BMW Série 3 M Sport 2023 - Occasion Révisée Lyon",
  "metaDescription": "Méta-description incitative au clic Google (150-160 caractères)",
  "description": "Description commerciale complète hautement lisible avec paragraphes aérés, mots-clés naturels, liste à puces des équipements et appel à l'action commercial",
  "keywords": ["mot-clé 1", "mot-clé 2", "mot-clé 3", "mot-clé 4", "mot-clé 5"],
  "seoScore": 95,
  "seoAdvice": "Conseil d'optimisation SEO complémentaire (ex: ajouter 3 photos de l'intérieur, mentionner le contrôle technique)"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      });

      const data = JSON.parse(response.text || "{}");
      return res.json(data);
    } catch (error: any) {
      console.error("Erreur génération SEO Gemini:", error);
      return res.status(500).json({
        error: "Échec de la génération SEO par l'IA Gemini. " + (error?.message || "")
      });
    }
  });

  // AI Price Recommendation & Market Insights
  app.post("/api/ai/market-estimate", async (req, res) => {
    try {
      const { marque, modele, annee, kilometrage, carburant } = req.body;

      const prompt = `En tant qu'expert de la cote automobile d'occasion en France, analyse ce véhicule :
Marque: ${marque}, Modèle: ${modele}, Année: ${annee}, Kilométrage: ${kilometrage} km, Carburant: ${carburant}.

Donne une estimation réaliste du prix marché actuel en euros (fourchette basse et haute) et 3 conseils vendeurs rapides (période de vente, points à valoriser).
Réponds au format JSON strict avec ce schéma :
{
  "prixMin": nombre,
  "prixMax": nombre,
  "prixMoyenSuggere": nombre,
  "argumentaireAchat": ["point 1", "point 2"],
  "conseilsVente": ["conseil 1", "conseil 2"]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        }
      });

      const data = JSON.parse(response.text || "{}");
      return res.json(data);
    } catch (error: any) {
      console.error("Erreur estimation Gemini:", error);
      return res.status(500).json({ error: "Impossible de calculer la cote estimée." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server AutoConcession running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
