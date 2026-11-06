var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_module = require("module");
var import_meta = {};
var require2 = (0, import_module.createRequire)(import_meta.url);
var authRoutes = require2("./server/routes/auth.js");
var userRoutes = require2("./server/routes/users.js");
var dealershipRoutes = require2("./server/routes/dealerships.js");
var vehicleRoutes = require2("./server/routes/vehicles.js");
var leadRoutes = require2("./server/routes/leads.js");
var favoriteRoutes = require2("./server/routes/favorites.js");
var garageRoutes = require2("./server/routes/garages.js");
var adminRoutes = require2("./server/routes/admin.js");
var monetizationRoutes = require2("./server/routes/monetization.js");
var { pool } = require2("./server/config/database.js");
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "25mb" }));
  app.use(import_express.default.urlencoded({ limit: "25mb", extended: true }));
  let aiClient = null;
  const getAi = () => {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY non configur\xE9e.");
      }
      aiClient = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    }
    return aiClient;
  };
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.get("/api/test-db", async (req, res) => {
    const startTime = Date.now();
    try {
      if (!pool) {
        console.warn("[DB Test] \u26A0\uFE0F Pool MySQL non initialis\xE9.");
        return res.status(503).json({
          success: false,
          connected: false,
          message: "Pool de connexion MySQL non initialis\xE9.",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      const connection = await pool.getConnection();
      const [rows] = await connection.query("SELECT 1 AS connected, NOW() AS server_time, VERSION() AS mysql_version");
      connection.release();
      const latencyMs = Date.now() - startTime;
      console.log(`[DB Test] \u2705 Test de connexion MySQL R\xC9USSI (${latencyMs}ms) - Base: "${process.env.DB_NAME || "congocar_db"}" :`, rows);
      return res.json({
        success: true,
        connected: true,
        message: "Connexion active \xE0 la base de donn\xE9es MySQL v\xE9rifi\xE9e avec succ\xE8s.",
        latency_ms: latencyMs,
        database: process.env.DB_NAME || "congocar_db",
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 3306,
        server_info: rows,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      console.error(`[DB Test] \u274C R\xE9sultat du test de connexion MySQL (${latencyMs}ms) : ${error.message}`);
      return res.status(500).json({
        success: false,
        connected: false,
        message: "\xC9chec de la connexion active \xE0 la base de donn\xE9es MySQL.",
        error: error.message,
        code: error.code || null,
        latency_ms: latencyMs,
        config: {
          host: process.env.DB_HOST || "localhost",
          port: Number(process.env.DB_PORT) || 3306,
          database: process.env.DB_NAME || "congocar_db",
          user: process.env.DB_USER || "root"
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  });
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
        return res.status(400).json({ error: "Marque et mod\xE8le sont requis." });
      }
      const prompt = `Tu es un expert en marketing automobile pour une concession haut de gamme.
R\xE9dige une annonce de vente professionnelle, captivante et persuasive en fran\xE7ais pour le v\xE9hicule suivant :

- Marque : ${marque}
- Mod\xE8le : ${modele} ${finition ? `(${finition})` : ""}
- Ann\xE9e : ${annee}
- \xC9tat : ${etat || "Occasion"}
- Kilom\xE9trage : ${kilometrage ? Number(kilometrage).toLocaleString("fr-FR") + " km" : "N/C"}
- Carburant : ${carburant || "N/C"}
- Bo\xEEte de vitesses : ${transmission || "N/C"}
- Puissance : ${puissance ? puissance + " ch" : "N/C"}
- Prix propos\xE9 : ${prix ? Number(prix).toLocaleString("fr-FR") + " \u20AC" : "N/C"}
- \xC9quipements cl\xE9s : ${equipements.length > 0 ? equipements.join(", ") : "Excellente finition"}
${pointsForts ? `- Remarques / Points forts du vendeur : ${pointsForts}` : ""}

Structure de l'annonce :
1. Titre d'accroche valorisant
2. Pr\xE9sentation g\xE9n\xE9rale et attrait du v\xE9hicule (moteur, conduite, esth\xE9tique)
3. Points forts & \xC9quipements majeurs (liste \xE0 puces claire)
4. \xC9tat & Garanties (v\xE9hicule r\xE9vis\xE9, contr\xF4l\xE9)
5. Appel \xE0 l'action courtois invitant \xE0 r\xE9server un essai ou contacter la concession.

Formate le r\xE9sultat en texte clair avec des paragraphes a\xE9r\xE9s et des puces \xE9l\xE9gantes. Garde un ton professionnel, rassurant et dynamique.`;
      const response = await getAi().models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          temperature: 0.7
        }
      });
      const generatedText = response.text || "Annonce g\xE9n\xE9r\xE9e avec succ\xE8s.";
      return res.json({ description: generatedText });
    } catch (error) {
      console.error("Erreur g\xE9n\xE9ration annonce Gemini:", error);
      return res.status(500).json({
        error: "\xC9chec de la g\xE9n\xE9ration d'annonce. " + (error?.message || "")
      });
    }
  });
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
        return res.status(400).json({ error: "Marque et mod\xE8le sont requis." });
      }
      const prompt = `Tu es un expert SEO sp\xE9cialiste du secteur automobile et du r\xE9f\xE9rencement sur Google, Leboncoin, La Centrale et moteurs de recherche.
G\xE9n\xE8re un contenu d'annonce hautement optimis\xE9 pour le SEO et le taux de conversion commerciale pour le v\xE9hicule suivant :

- Marque : ${marque}
- Mod\xE8le : ${modele}
- Finition : ${finition || "N/C"}
- Ann\xE9e : ${annee}
- \xC9tat : ${etat || "Occasion"}
- Kilom\xE9trage : ${kilometrage ? Number(kilometrage).toLocaleString("fr-FR") + " km" : "N/C"}
- Carburant : ${carburant || "N/C"}
- Transmission : ${transmission || "N/C"}
- Puissance : ${puissance ? puissance + " ch" : "N/C"}
- Prix : ${prix ? Number(prix).toLocaleString("fr-FR") + " \u20AC" : "N/C"}
- \xC9quipements : ${equipements.length > 0 ? equipements.join(", ") : "Excellente finition"}
- Ville / R\xE9gion d'ancrage : ${ville}
- Ton r\xE9ducteur : ${tone}
${targetKeywords ? `- Mots-cl\xE9s SEO cibles prioritaires : ${targetKeywords}` : ""}

G\xE9n\xE8re une r\xE9ponse au format JSON strict avec ce sch\xE9ma :
{
  "seoTitle": "Titre optimis\xE9 Google (max 60 caract\xE8res) ex: BMW S\xE9rie 3 M Sport 2023 - Occasion R\xE9vis\xE9e Lyon",
  "metaDescription": "M\xE9ta-description incitative au clic Google (150-160 caract\xE8res)",
  "description": "Description commerciale compl\xE8te hautement lisible avec paragraphes a\xE9r\xE9s, mots-cl\xE9s naturels, liste \xE0 puces des \xE9quipements et appel \xE0 l'action commercial",
  "keywords": ["mot-cl\xE9 1", "mot-cl\xE9 2", "mot-cl\xE9 3", "mot-cl\xE9 4", "mot-cl\xE9 5"],
  "seoScore": 95,
  "seoAdvice": "Conseil d'optimisation SEO compl\xE9mentaire (ex: ajouter 3 photos de l'int\xE9rieur, mentionner le contr\xF4le technique)"
}`;
      const response = await getAi().models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7
        }
      });
      const data = JSON.parse(response.text || "{}");
      return res.json(data);
    } catch (error) {
      console.error("Erreur g\xE9n\xE9ration SEO Gemini:", error);
      return res.status(500).json({
        error: "\xC9chec de la g\xE9n\xE9ration SEO par l'IA Gemini. " + (error?.message || "")
      });
    }
  });
  app.post("/api/ai/market-estimate", async (req, res) => {
    try {
      const { marque, modele, annee, kilometrage, carburant } = req.body;
      const prompt = `En tant qu'expert de la cote automobile d'occasion en France, analyse ce v\xE9hicule :
Marque: ${marque}, Mod\xE8le: ${modele}, Ann\xE9e: ${annee}, Kilom\xE9trage: ${kilometrage} km, Carburant: ${carburant}.

Donne une estimation r\xE9aliste du prix march\xE9 actuel en euros (fourchette basse et haute) et 3 conseils vendeurs rapides (p\xE9riode de vente, points \xE0 valoriser).
R\xE9ponds au format JSON strict avec ce sch\xE9ma :
{
  "prixMin": nombre,
  "prixMax": nombre,
  "prixMoyenSuggere": nombre,
  "argumentaireAchat": ["point 1", "point 2"],
  "conseilsVente": ["conseil 1", "conseil 2"]
}`;
      const response = await getAi().models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3
        }
      });
      const data = JSON.parse(response.text || "{}");
      return res.json(data);
    } catch (error) {
      console.error("Erreur estimation Gemini:", error);
      return res.status(500).json({ error: "Impossible de calculer la cote estim\xE9e." });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server AutoConcession running on http://0.0.0.0:${PORT}`);
    try {
      const monetizationController = require2("./server/controllers/monetizationController.js");
      monetizationController.cleanupExpiredMonetization(null, null).then((report) => {
        if (report) console.log("[AutoKin Monetization Cron] Initialisation :", report.message);
      }).catch((e) => console.warn("[AutoKin Monetization Cron] Warning:", e.message));
      setInterval(() => {
        monetizationController.cleanupExpiredMonetization(null, null).catch(() => {
        });
      }, 15 * 60 * 1e3);
    } catch (e) {
      console.warn("[AutoKin Monetization Cron] Non d\xE9marr\xE9:", e.message);
    }
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
