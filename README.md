# Application Mobile – TPG Signal (React Native + Expo)

## Description
TPG Signal est une application mobile créée avec **React Native et Expo** dans le cadre du module 66-62 **Travail de Bachelor** à la **HEG Genève**, permettant de signaler les problèmes rencontrés dans les transports publics genevois (TPG). L’app est connectée à une API Laravel sécurisée.

## Fonctionnalités principales

- Connexion / mot de passe oublié
- Détection des arrêts à proximité
- Recherche dynamique d’arrêts et de lignes
- Signalement avec :
  - Texte + type
  - Géolocalisation
  - Photo
- Historique des signalements
- Edition / suppression si statut = “envoyé”
- Gestion du profil (avatar, infos)
- Interface multilingue (français, anglais…)
- Mode partiellement hors ligne (cache des arrêts)
- Affichage des lignes par arrêt

## ⚙Stack technique

- **React Native (Expo)**
- **TypeScript**
- **Axios**
- **AsyncStorage**
- **React Navigation**
- **ImagePicker**
- **Framer Motion**, **Ionicons**

## 📁 Structure du projet

```
TPGSignal/
├── App.tsx
├── app.json
├── config.tsx
├── navigation/
├── screens/
├── services/
├── assets/
├── .expo/
├── tsconfig.json
└── package.json
```

## Démarrage rapide

### 1. Prérequis

- Node.js ≥ 18
- Expo CLI (`npm install -g expo-cli`)
- Appareil avec Expo Go ou simulateur

### 2. Installation

```bash
npm install
```

### 3. Configuration

Dans `config.tsx` :

```ts
export const API_BASE_URL = "http://[adresse]:8000/api";
export const BASE_URL = "http://[adresse]:8000/";
```

### 4. Lancement

```bash
npx expo start
```

Scanner le QR code avec **Expo Go**

## Particularités

- Signalement “Arrêts” ou “Lignes”
- Animations et interface fluide
- Dropdown avec recherche intégrée

## Auteurs

Travail de Bachelor 2025  
**Yann Husmann**
