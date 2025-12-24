const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

// Configuration de la session (Connexion sécurisée)
app.use(session({
    secret: 'votre_cle_secrete_super_difficile', // Changez ceci
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Mettre à true si vous avez un certificat SSL (déjà géré par Render)
}));

// Données Admin (À remplacer par une base de données plus tard)
// Le mot de passe ici est "admin123" hashé
const ADMIN_USER = "admin";
const ADMIN_HASH = "$2a$10$XmN/uPzG7HqYfVfL.IIn3OTXvO4R3YhJ8.y5Y5iQ5mD5v5y5y5y5y"; 

// Middleware pour protéger les pages admin
function isAuthenticated(req, res, next) {
    if (req.session.isLoggedIn) {
        return next();
    }
    res.redirect('/admin/login.html');
}

// Route de Connexion
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    // Vérification de l'identifiant et du mot de passe
    if (username === ADMIN_USER && await bcrypt.compare(password, ADMIN_HASH)) {
        req.session.isLoggedIn = true;
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Identifiants incorrects" });
    }
});

// Route de Déconnexion
app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login.html');
});

// Protection de l'accès aux fichiers du dossier admin
app.use('/admin/dashboard.html', isAuthenticated);
app.use('/admin/settings.html', isAuthenticated);
// ... ajoutez les autres pages admin ici

app.listen(process.env.PORT || 3000);
